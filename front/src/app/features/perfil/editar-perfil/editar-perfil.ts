import { Component, inject, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { mensajeDeError } from '../../../core/utils/errores.utils';
import { fechaIsoATexto, textoAFechaIso } from '../../../core/utils/fechas.utils';
import {
  LARGO_MAXIMO_DESCRIPCION,
  LARGO_MAXIMO_NOMBRE,
} from '../../../core/utils/usuarios.constants';
import {
  fechaPasada,
  imagenPermitida,
  soloLetras,
} from '../../../core/validators/formularios.validators';
import { Avatar } from '../../../shared/components/avatar/avatar';
import { Aviso } from '../../../shared/components/aviso/aviso';
import { CampoFormulario } from '../../../shared/components/campo-formulario/campo-formulario';
import { CampoImagen } from '../../../shared/components/campo-imagen/campo-imagen';
import { EstadoVacio } from '../../../shared/components/estado-vacio/estado-vacio';
import { FechaMaskDirective } from '../../../shared/directives/fecha-mask/fecha-mask';
import { ArrobaPipe } from '../../../shared/pipes/arroba/arroba';
import { PerfilService } from '../services/perfil.service';

/**
 * Pantalla de Mi perfil para editar nombre, apellido, fecha de nacimiento,
 * descripción y foto. Abre con los datos actuales de la sesión; el correo y
 * el nombre de usuario se muestran pero no se editan. Al guardar o cancelar
 * vuelve a Mi perfil.
 */
@Component({
  selector: 'app-editar-perfil',
  imports: [
    ArrobaPipe,
    Avatar,
    Aviso,
    CampoFormulario,
    CampoImagen,
    EstadoVacio,
    FechaMaskDirective,
    ReactiveFormsModule,
    RouterLink,
  ],
  templateUrl: './editar-perfil.html',
  styleUrl: './editar-perfil.css',
})
export class EditarPerfil implements OnInit {
  private readonly perfilService = inject(PerfilService);
  private readonly router = inject(Router);

  protected readonly usuario = inject(AuthService).usuario;
  protected readonly largoMaximoDescripcion = LARGO_MAXIMO_DESCRIPCION;
  protected readonly enviando = signal(false);
  protected readonly errorServidor = signal<string | null>(null);

  protected readonly formulario = new FormGroup({
    nombre: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(LARGO_MAXIMO_NOMBRE), soloLetras()],
    }),
    apellido: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(LARGO_MAXIMO_NOMBRE), soloLetras()],
    }),
    fechaNacimiento: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, fechaPasada()],
    }),
    descripcion: new FormControl('', {
      nonNullable: true,
      validators: [Validators.maxLength(LARGO_MAXIMO_DESCRIPCION)],
    }),
    imagen: new FormControl<File | null>(null, { validators: [imagenPermitida()] }),
  });

  ngOnInit(): void {
    this.mostrarDatosActuales();
  }

  protected async guardar(): Promise<void> {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }
    this.enviando.set(true);
    this.errorServidor.set(null);
    const { fechaNacimiento, ...datos } = this.formulario.getRawValue();
    try {
      await this.perfilService.actualizar({
        ...datos,
        fechaNacimiento: textoAFechaIso(fechaNacimiento) ?? '',
      });
      await this.volver();
    } catch (error) {
      this.errorServidor.set(mensajeDeError(error));
    } finally {
      this.enviando.set(false);
    }
  }

  /**
   * Vuelve a Mi perfil. La pantalla se conserva mientras la app está abierta,
   * así que antes de salir se recarga con los datos de la sesión: la próxima
   * vez abre con los valores actuales.
   */
  protected async volver(): Promise<void> {
    this.mostrarDatosActuales();
    this.errorServidor.set(null);
    await this.router.navigate(['/perfil']);
  }

  /** Completa el formulario con el usuario de la sesión, sin foto nueva elegida. */
  private mostrarDatosActuales(): void {
    const usuario = this.usuario();
    if (!usuario) return;
    this.formulario.reset({
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      // La API devuelve la fecha completa a las 00:00 UTC; el campo usa solo el día.
      fechaNacimiento: fechaIsoATexto(usuario.fechaNacimiento.slice(0, 10)),
      descripcion: usuario.descripcion,
      imagen: null,
    });
  }
}
