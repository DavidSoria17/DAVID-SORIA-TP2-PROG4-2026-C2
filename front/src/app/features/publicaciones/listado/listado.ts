import {
  Component,
  effect,
  ElementRef,
  inject,
  OnDestroy,
  OnInit,
  signal,
  untracked,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { OrdenPublicaciones, Publicacion } from '../../../core/models/publicacion.model';
import { AuthService } from '../../../core/services/auth.service';
import { mensajeDeError } from '../../../core/utils/errores.utils';
import { PUBLICACIONES_POR_PAGINA } from '../../../core/utils/publicaciones.constants';
import { Aviso } from '../../../shared/components/aviso/aviso';
import { EstadoVacio } from '../../../shared/components/estado-vacio/estado-vacio';
import { Icono } from '../../../shared/components/icono/icono';
import { Paginador } from '../../../shared/components/paginador/paginador';
import { PublicacionCard } from '../../../shared/components/publicacion-card/publicacion-card';
import { PublicacionesService } from '../services/publicaciones.service';

/**
 * Tweeter: publicaciones de todos, de a una página por vez, ordenadas por
 * fecha (por defecto) o por cantidad de me gusta. Desde acá se pasa a la
 * pantalla para publicar, se da o quita me gusta y se borran las propias.
 */
@Component({
  selector: 'app-listado',
  imports: [Aviso, EstadoVacio, Icono, Paginador, PublicacionCard, ReactiveFormsModule, RouterLink],
  templateUrl: './listado.html',
  styleUrl: './listado.css',
})
export class Listado implements OnInit, OnDestroy {
  private readonly publicacionesService = inject(PublicacionesService);
  private readonly elemento: HTMLElement = inject(ElementRef).nativeElement;

  protected readonly usuario = inject(AuthService).usuario;
  protected readonly porPagina = PUBLICACIONES_POR_PAGINA;
  protected readonly orden = new FormControl<OrdenPublicaciones>('fecha', { nonNullable: true });
  protected readonly pagina = signal(1);
  protected readonly publicaciones = signal<Publicacion[]>([]);
  protected readonly total = signal(0);
  protected readonly cargada = signal(false);
  protected readonly error = signal<string | null>(null);

  private cambiosDeOrden?: Subscription;
  /** Número del último pedido: si llega la respuesta de uno anterior, se descarta. */
  private ultimoPedido = 0;
  /** Publicaciones creadas que ya se ven en la lista (las anteriores a abrir Tweeter, también). */
  private publicadasVistas = this.publicacionesService.publicadas();

  /**
   * El listado se conserva mientras se publica en la otra pantalla de
   * Tweeter. Cuando se crea una publicación, vuelve a la primera página de
   * las más nuevas para mostrarla.
   */
  private readonly mostrarLoPublicado = effect(() => {
    const publicadas = this.publicacionesService.publicadas();
    if (publicadas === this.publicadasVistas) return;
    this.publicadasVistas = publicadas;
    untracked(() => {
      if (this.orden.value === 'fecha') void this.irAPagina(1, true);
      else this.orden.setValue('fecha');
    });
  });

  ngOnInit(): void {
    this.cambiosDeOrden = this.orden.valueChanges.subscribe(() => this.irAPagina(1, true));
    if (this.usuario()) void this.cargar();
  }

  ngOnDestroy(): void {
    this.cambiosDeOrden?.unsubscribe();
  }

  /** Va a otra página; con `forzar`, recarga aunque sea la misma (por ejemplo, al cambiar el orden). */
  protected async irAPagina(pagina: number, forzar = false): Promise<void> {
    if (pagina === this.pagina() && !forzar) return;
    this.pagina.set(pagina);
    await this.cargar();
    this.elemento.scrollIntoView({ block: 'start' });
  }

  /** Reemplaza la publicación por la copia que vuelve (aunque no cambie), así la tarjeta libera el botón. */
  protected async alternarMeGusta(publicacion: Publicacion): Promise<void> {
    const actualizada = await this.publicacionesService.alternarMeGusta(publicacion);
    this.publicaciones.update((publicaciones) =>
      publicaciones.map((otra) => (otra._id === publicacion._id ? actualizada : otra)),
    );
  }

  /** Borra la publicación y recarga la página; si quedó vacía, vuelve a la anterior. */
  protected async eliminar(publicacion: Publicacion): Promise<void> {
    if (!(await this.publicacionesService.eliminar(publicacion._id))) return;
    const quedaVacia = this.publicaciones().length === 1 && this.pagina() > 1;
    await this.irAPagina(quedaVacia ? this.pagina() - 1 : this.pagina(), true);
  }

  private async cargar(): Promise<void> {
    const pedido = ++this.ultimoPedido;
    try {
      const respuesta = await this.publicacionesService.listar({
        orden: this.orden.value,
        offset: (this.pagina() - 1) * PUBLICACIONES_POR_PAGINA,
        limit: PUBLICACIONES_POR_PAGINA,
      });
      if (pedido !== this.ultimoPedido) return;
      this.publicaciones.set(respuesta.publicaciones);
      this.total.set(respuesta.total);
      this.error.set(null);
    } catch (error) {
      if (pedido !== this.ultimoPedido) return;
      this.error.set(mensajeDeError(error));
    } finally {
      if (pedido === this.ultimoPedido) this.cargada.set(true);
    }
  }
}
