import { Component, effect, inject, OnDestroy, OnInit, signal, untracked } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { Comentario as DatosComentario } from '../../../core/models/comentario.model';
import { CambioPublicacion, Publicacion } from '../../../core/models/publicacion.model';
import { AuthService } from '../../../core/services/auth.service';
import { mensajeDeError } from '../../../core/utils/errores.utils';
import {
  COMENTARIOS_POR_PAGINA,
  LARGO_MAXIMO_COMENTARIO,
} from '../../../core/utils/publicaciones.constants';
import { sinSoloEspacios } from '../../../core/validators/formularios.validators';
import { Aviso } from '../../../shared/components/aviso/aviso';
import { CampoFormulario } from '../../../shared/components/campo-formulario/campo-formulario';
import { Comentario } from '../../../shared/components/comentario/comentario';
import { EstadoVacio } from '../../../shared/components/estado-vacio/estado-vacio';
import { Icono } from '../../../shared/components/icono/icono';
import { PublicacionCard } from '../../../shared/components/publicacion-card/publicacion-card';
import { PublicacionesService } from '../services/publicaciones.service';

/** Mensaje de un comentario: obligatorio, no solo espacios y hasta 500 caracteres. */
const formularioComentario = () =>
  new FormGroup({
    mensaje: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        sinSoloEspacios(),
        Validators.maxLength(LARGO_MAXIMO_COMENTARIO),
      ],
    }),
  });

/**
 * Pantalla de Tweeter con una publicación en grande y sus comentarios, del
 * más reciente al más viejo. Llegan de a diez: «Cargar más» suma los
 * anteriores debajo de los que ya se ven. Se puede comentar y editar los
 * comentarios propios, que quedan marcados como editados.
 */
@Component({
  selector: 'app-detalle',
  imports: [
    Aviso,
    CampoFormulario,
    Comentario,
    EstadoVacio,
    Icono,
    PublicacionCard,
    ReactiveFormsModule,
    RouterLink,
  ],
  templateUrl: './detalle.html',
  styleUrl: './detalle.css',
})
export class Detalle implements OnInit, OnDestroy {
  private readonly publicacionesService = inject(PublicacionesService);
  private readonly ruta = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly usuario = inject(AuthService).usuario;
  protected readonly largoMaximoComentario = LARGO_MAXIMO_COMENTARIO;

  protected readonly publicacion = signal<Publicacion | null>(null);
  protected readonly error = signal<string | null>(null);

  protected readonly comentarios = signal<DatosComentario[]>([]);
  protected readonly hayMas = signal(false);
  protected readonly comentariosCargados = signal(false);
  protected readonly cargandoMas = signal(false);
  protected readonly errorComentarios = signal<string | null>(null);

  protected readonly formulario = formularioComentario();
  protected readonly enviando = signal(false);
  protected readonly errorComentario = signal<string | null>(null);

  /** Id del comentario que se está editando; uno por vez. */
  protected readonly editando = signal<string | null>(null);
  protected readonly edicion = formularioComentario();
  protected readonly guardando = signal(false);
  protected readonly errorEdicion = signal<string | null>(null);

  private parametros?: Subscription;
  /** Número de la última carga: si llega la respuesta de una anterior, se descarta. */
  private ultimaCarga = 0;
  /** Último cambio de una publicación que ya refleja la pantalla. */
  private cambioVisto = this.publicacionesService.ultimoCambio();

  /**
   * La pantalla se conserva mientras se usa otra, así que sigue los cambios
   * a su publicación hechos desde cualquier lado (también los propios: un
   * comentario nuevo suma uno a la cantidad).
   */
  private readonly seguirCambios = effect(() => {
    const cambio = this.publicacionesService.ultimoCambio();
    if (!cambio || cambio === this.cambioVisto) return;
    this.cambioVisto = cambio;
    untracked(() => this.aplicarCambio(cambio));
  });

  ngOnInit(): void {
    this.parametros = this.ruta.paramMap.subscribe((parametros) => {
      const id = parametros.get('id');
      if (id && this.usuario()) void this.cargar(id);
    });
  }

  ngOnDestroy(): void {
    this.parametros?.unsubscribe();
  }

  /** Reemplaza la publicación por la copia que vuelve (aunque no cambie), así la tarjeta libera el botón. */
  protected async alternarMeGusta(publicacion: Publicacion): Promise<void> {
    this.publicacion.set(await this.publicacionesService.alternarMeGusta(publicacion));
  }

  /** Si se borró, vuelve al listado. */
  protected async eliminar(publicacion: Publicacion): Promise<void> {
    if (await this.publicacionesService.eliminar(publicacion)) {
      await this.router.navigate(['/publicaciones']);
    }
  }

  /** Trae los comentarios anteriores al último que se ve y los suma al final. */
  protected async cargarMas(): Promise<void> {
    const publicacion = this.publicacion();
    const ultimo = this.comentarios().at(-1);
    if (!publicacion || !ultimo || this.cargandoMas()) return;
    this.cargandoMas.set(true);
    this.errorComentarios.set(null);
    try {
      const pagina = await this.publicacionesService.listarComentarios(
        publicacion._id,
        COMENTARIOS_POR_PAGINA,
        ultimo._id,
      );
      this.comentarios.update((comentarios) => [...comentarios, ...pagina.comentarios]);
      this.hayMas.set(pagina.hayMas);
    } catch (error) {
      this.errorComentarios.set(mensajeDeError(error));
    } finally {
      this.cargandoMas.set(false);
    }
  }

  /** Publica el comentario; queda primero en la lista, que va del más reciente al más viejo. */
  protected async comentar(): Promise<void> {
    const publicacion = this.publicacion();
    if (!publicacion) return;
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }
    this.enviando.set(true);
    this.errorComentario.set(null);
    try {
      const comentario = await this.publicacionesService.comentar(
        publicacion,
        this.formulario.getRawValue().mensaje,
      );
      this.comentarios.update((comentarios) => [comentario, ...comentarios]);
      this.formulario.reset();
    } catch (error) {
      this.errorComentario.set(mensajeDeError(error));
    } finally {
      this.enviando.set(false);
    }
  }

  /** Abre la edición del comentario con su texto actual (y cierra la de otro, si había). */
  protected empezarEdicion(comentario: DatosComentario): void {
    this.edicion.reset({ mensaje: comentario.mensaje });
    this.errorEdicion.set(null);
    this.editando.set(comentario._id);
  }

  protected cancelarEdicion(): void {
    this.editando.set(null);
  }

  protected async guardarEdicion(comentario: DatosComentario): Promise<void> {
    if (this.edicion.invalid) {
      this.edicion.markAllAsTouched();
      return;
    }
    this.guardando.set(true);
    this.errorEdicion.set(null);
    try {
      const editado = await this.publicacionesService.editarComentario(
        comentario,
        this.edicion.getRawValue().mensaje,
      );
      this.comentarios.update((comentarios) =>
        comentarios.map((otro) => (otro._id === editado._id ? editado : otro)),
      );
      this.editando.set(null);
    } catch (error) {
      this.errorEdicion.set(mensajeDeError(error));
    } finally {
      this.guardando.set(false);
    }
  }

  /** Trae en paralelo la publicación y su primera tanda de comentarios. */
  private async cargar(id: string): Promise<void> {
    const carga = ++this.ultimaCarga;
    this.publicacion.set(null);
    this.error.set(null);
    this.comentarios.set([]);
    this.hayMas.set(false);
    this.comentariosCargados.set(false);
    this.errorComentarios.set(null);
    this.errorComentario.set(null);
    this.editando.set(null);
    this.formulario.reset();
    try {
      const [publicacion, pagina] = await Promise.all([
        this.publicacionesService.obtener(id),
        this.publicacionesService.listarComentarios(id, COMENTARIOS_POR_PAGINA),
      ]);
      if (carga !== this.ultimaCarga) return;
      this.publicacion.set(publicacion);
      this.comentarios.set(pagina.comentarios);
      this.hayMas.set(pagina.hayMas);
      this.comentariosCargados.set(true);
    } catch (error) {
      if (carga === this.ultimaCarga) this.error.set(mensajeDeError(error));
    }
  }

  private aplicarCambio({ tipo, publicacion }: CambioPublicacion): void {
    if (publicacion._id !== this.publicacion()?._id) return;
    if (tipo === 'actualizada') {
      this.publicacion.set(publicacion);
    } else if (tipo === 'eliminada') {
      this.publicacion.set(null);
      this.error.set('La publicación se borró.');
    }
  }
}
