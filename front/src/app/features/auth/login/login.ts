import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { NotificacionService } from '../../../core/services/notificacion.service';
import { mensajeDeError } from '../../../core/utils/errores.utils';
import { contrasenaSegura } from '../../../core/validators/formularios.validators';
import { Aviso } from '../../../shared/components/aviso/aviso';
import { CampoContrasena } from '../../../shared/components/campo-contrasena/campo-contrasena';
import { CampoFormulario } from '../../../shared/components/campo-formulario/campo-formulario';
import { Modal } from '../../../shared/components/modal/modal';
import { NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'app-login',
  imports: [
    Aviso,
    CampoContrasena,
    CampoFormulario,
    Modal,
    NgOptimizedImage,
    ReactiveFormsModule,
    RouterLink,
  ],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private readonly authService = inject(AuthService);
  private readonly notificacionService = inject(NotificacionService);
  private readonly router = inject(Router);

  protected readonly enviando = signal(false);
  protected readonly errorServidor = signal<string | null>(null);
  /** Un administrador deshabilitó la cuenta: se avisa con un modal en vez de un error del formulario. */
  protected readonly cuentaDeshabilitada = signal(false);

  protected readonly formulario = new FormGroup({
    usuario: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    contrasena: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, contrasenaSegura()],
    }),
  });

  protected async iniciarSesion(): Promise<void> {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }
    this.enviando.set(true);
    this.errorServidor.set(null);
    try {
      const usuario = await this.authService.iniciarSesion(this.formulario.getRawValue());
      this.notificacionService.mostrar({ tipo: 'exito', titulo: `¡Hola, ${usuario.nombre}!` });
      await this.router.navigate(['/']);
    } catch (error) {
      if (error instanceof HttpErrorResponse && error.status === HttpStatusCode.Forbidden) {
        this.cuentaDeshabilitada.set(true);
      } else {
        this.errorServidor.set(mensajeDeError(error));
      }
    } finally {
      this.enviando.set(false);
    }
  }
}
