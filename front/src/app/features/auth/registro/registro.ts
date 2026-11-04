import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { NotificacionService } from '../../../core/services/notificacion.service';
import { mensajeDeError } from '../../../core/utils/errores.utils';
import { textoAFechaIso } from '../../../core/utils/fechas.utils';
import {
  camposIguales,
  contrasenaSegura,
  fechaPasada,
  imagenPermitida,
  nombreUsuarioValido,
  soloLetras,
} from '../../../core/validators/formularios.validators';
import { Aviso } from '../../../shared/components/aviso/aviso';
import { CampoContrasena } from '../../../shared/components/campo-contrasena/campo-contrasena';
import { CampoFormulario } from '../../../shared/components/campo-formulario/campo-formulario';
import { CampoImagen } from '../../../shared/components/campo-imagen/campo-imagen';
import { FechaMaskDirective } from '../../../shared/directives/fecha-mask/fecha-mask';

const LARGO_MAXIMO_NOMBRE = 50;
const LARGO_MAXIMO_DESCRIPCION = 200;

@Component({
  selector: 'app-registro',
  imports: [
    Aviso,
    CampoContrasena,
    CampoFormulario,
    CampoImagen,
    FechaMaskDirective,
    ReactiveFormsModule,
    RouterLink,
  ],
  templateUrl: './registro.html',
  styleUrl: './registro.css',
})
export class Registro {
  private readonly authService = inject(AuthService);
  private readonly notificacionService = inject(NotificacionService);
  private readonly router = inject(Router);

  protected readonly largoMaximoDescripcion = LARGO_MAXIMO_DESCRIPCION;
  protected readonly enviando = signal(false);
  protected readonly errorServidor = signal<string | null>(null);

  protected readonly formulario = new FormGroup(
    {
      nombre: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.maxLength(LARGO_MAXIMO_NOMBRE), soloLetras()],
      }),
      apellido: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.maxLength(LARGO_MAXIMO_NOMBRE), soloLetras()],
      }),
      correo: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.email],
      }),
      nombreUsuario: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, nombreUsuarioValido()],
      }),
      contrasena: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, contrasenaSegura()],
      }),
      repetirContrasena: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required],
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
    },
    {
      validators: [
        camposIguales('contrasena', 'repetirContrasena', 'Las contraseñas no coinciden.'),
      ],
    },
  );

  protected async registrar(): Promise<void> {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }
    this.enviando.set(true);
    this.errorServidor.set(null);
    const {
      repetirContrasena: _repetida,
      fechaNacimiento,
      ...datos
    } = this.formulario.getRawValue();
    try {
      const usuario = await this.authService.registrar({
        ...datos,
        fechaNacimiento: textoAFechaIso(fechaNacimiento) ?? '',
      });
      this.notificacionService.mostrar({
        tipo: 'exito',
        titulo: `¡Te damos la bienvenida, ${usuario.nombre}!`,
        texto: 'Tu cuenta ya está lista.',
      });
      await this.router.navigate(['/']);
    } catch (error) {
      this.errorServidor.set(mensajeDeError(error));
    } finally {
      this.enviando.set(false);
    }
  }
}
