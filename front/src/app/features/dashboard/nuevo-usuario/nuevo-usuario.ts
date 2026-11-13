import { Component, inject, signal, viewChild } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { DatosAltaUsuario } from '../../../core/models/usuario.model';
import { NotificacionService } from '../../../core/services/notificacion.service';
import { mensajeDeError } from '../../../core/utils/errores.utils';
import { conArroba, nombreCompleto } from '../../../core/utils/formato.utils';
import { Aviso } from '../../../shared/components/aviso/aviso';
import { FormularioUsuario } from '../../../shared/components/formulario-usuario/formulario-usuario';
import { Icono } from '../../../shared/components/icono/icono';
import { UsuariosService } from '../services/usuarios.service';

/**
 * Dashboard › Usuarios › Nuevo: alta de una cuenta con los mismos datos que
 * el registro y el perfil elegido con dos radios. Al crearla vacía el
 * formulario y vuelve al listado.
 */
@Component({
  selector: 'app-nuevo-usuario',
  imports: [Aviso, FormularioUsuario, Icono, RouterLink],
  templateUrl: './nuevo-usuario.html',
  styleUrl: './nuevo-usuario.css',
})
export class NuevoUsuario {
  private readonly usuariosService = inject(UsuariosService);
  private readonly notificacionService = inject(NotificacionService);
  private readonly router = inject(Router);

  private readonly formulario = viewChild.required(FormularioUsuario);

  protected readonly enviando = signal(false);
  protected readonly errorServidor = signal<string | null>(null);

  protected async crear(datos: DatosAltaUsuario): Promise<void> {
    this.enviando.set(true);
    this.errorServidor.set(null);
    try {
      const usuario = await this.usuariosService.crear(datos);
      this.notificacionService.mostrar({
        tipo: 'exito',
        titulo: `Creaste la cuenta de ${nombreCompleto(usuario)}`,
        texto: `Ya puede iniciar sesión como ${conArroba(usuario.nombreUsuario)}.`,
      });
      this.formulario().reiniciar();
      await this.router.navigate(['/dashboard/usuarios']);
    } catch (error) {
      this.errorServidor.set(mensajeDeError(error));
    } finally {
      this.enviando.set(false);
    }
  }
}
