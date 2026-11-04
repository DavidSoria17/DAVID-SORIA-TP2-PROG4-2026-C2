import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { NotificacionService } from '../../../core/services/notificacion.service';
import { Avatar } from '../../../shared/components/avatar/avatar';
import { EstadoVacio } from '../../../shared/components/estado-vacio/estado-vacio';

@Component({
  selector: 'app-cerrar-sesion',
  imports: [Avatar, EstadoVacio, RouterLink],
  templateUrl: './cerrar-sesion.html',
  styleUrl: './cerrar-sesion.css',
})
export class CerrarSesion {
  private readonly authService = inject(AuthService);
  private readonly notificacionService = inject(NotificacionService);
  private readonly router = inject(Router);

  protected readonly usuario = this.authService.usuario;

  protected async confirmar(): Promise<void> {
    this.authService.cerrarSesion();
    this.notificacionService.mostrar({
      tipo: 'info',
      titulo: 'Cerraste la sesión. ¡Hasta pronto!',
    });
    await this.router.navigate(['/login']);
  }
}
