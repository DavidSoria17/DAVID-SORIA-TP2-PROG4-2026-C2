import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { mensajeDeError } from '../../../core/utils/errores.utils';
import {
  LARGO_MAXIMO_MENSAJE,
  LARGO_MAXIMO_TITULO,
} from '../../../core/utils/publicaciones.constants';
import { imagenPermitida, sinSoloEspacios } from '../../../core/validators/formularios.validators';
import { Aviso } from '../../../shared/components/aviso/aviso';
import { CampoFormulario } from '../../../shared/components/campo-formulario/campo-formulario';
import { CampoImagen } from '../../../shared/components/campo-imagen/campo-imagen';
import { EstadoVacio } from '../../../shared/components/estado-vacio/estado-vacio';
import { PublicacionesService } from '../services/publicaciones.service';

/**
 * Pantalla de Tweeter para publicar: título, mensaje e imagen opcional. Al
 * publicar o cancelar vuelve al listado con el formulario vacío. Si se deja
 * a medio escribir (yendo a otra app), lo escrito sigue ahí al volver.
 */
@Component({
  selector: 'app-nueva-publicacion',
  imports: [Aviso, CampoFormulario, CampoImagen, EstadoVacio, ReactiveFormsModule, RouterLink],
  templateUrl: './nueva-publicacion.html',
  styleUrl: './nueva-publicacion.css',
})
export class NuevaPublicacion {
  private readonly publicacionesService = inject(PublicacionesService);
  private readonly router = inject(Router);

  protected readonly usuario = inject(AuthService).usuario;
  protected readonly largoMaximoTitulo = LARGO_MAXIMO_TITULO;
  protected readonly largoMaximoMensaje = LARGO_MAXIMO_MENSAJE;
  protected readonly enviando = signal(false);
  protected readonly errorServidor = signal<string | null>(null);

  protected readonly formulario = new FormGroup({
    titulo: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        sinSoloEspacios(),
        Validators.maxLength(LARGO_MAXIMO_TITULO),
      ],
    }),
    mensaje: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        sinSoloEspacios(),
        Validators.maxLength(LARGO_MAXIMO_MENSAJE),
      ],
    }),
    imagen: new FormControl<File | null>(null, { validators: [imagenPermitida()] }),
  });

  protected async publicar(): Promise<void> {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }
    this.enviando.set(true);
    this.errorServidor.set(null);
    try {
      await this.publicacionesService.crear(this.formulario.getRawValue());
      await this.volver();
    } catch (error) {
      this.errorServidor.set(mensajeDeError(error));
    } finally {
      this.enviando.set(false);
    }
  }

  /** Vacía el formulario y vuelve al listado de Tweeter. */
  protected async volver(): Promise<void> {
    this.formulario.reset();
    this.errorServidor.set(null);
    await this.router.navigate(['/publicaciones']);
  }
}
