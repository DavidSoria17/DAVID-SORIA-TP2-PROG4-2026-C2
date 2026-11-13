import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { DatosAltaUsuario } from '../../../core/models/usuario.model';
import { AuthService } from '../../../core/services/auth.service';
import { NotificacionService } from '../../../core/services/notificacion.service';
import { mensajeDeError } from '../../../core/utils/errores.utils';
import { Aviso } from '../../../shared/components/aviso/aviso';
import { FormularioUsuario } from '../../../shared/components/formulario-usuario/formulario-usuario';

@Component({
  selector: 'app-registro',
  imports: [Aviso, FormularioUsuario, RouterLink],
  templateUrl: './registro.html',
  styleUrl: './registro.css',
})
export class Registro {
  private readonly authService = inject(AuthService);
  private readonly notificacionService = inject(NotificacionService);
  private readonly router = inject(Router);

  protected readonly enviando = signal(false);
  protected readonly errorServidor = signal<string | null>(null);

  /** El registro siempre crea un perfil `usuario`: el que viene del formulario se descarta. */
  protected async registrar({ perfil: _perfil, ...datos }: DatosAltaUsuario): Promise<void> {
    this.enviando.set(true);
    this.errorServidor.set(null);
    try {
      const usuario = await this.authService.registrar(datos);
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
