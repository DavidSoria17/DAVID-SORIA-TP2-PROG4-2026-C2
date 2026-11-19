import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { DatosPerfil, Usuario } from '../../../core/models/usuario.model';
import { AuthService } from '../../../core/services/auth.service';
import { formDataDeUsuario } from '../../../core/utils/usuarios.utils';

/**
 * Perfil propio contra la API. Cada respuesta reemplaza al usuario guardado
 * en la sesión, así todas las pantallas muestran los datos actuales.
 */
@Service()
export class PerfilService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly url = `${environment.urlApi}/usuarios/perfil`;

  /**
   * Datos actualizados del usuario de la sesión.
   * @returns el usuario; rechaza con el `HttpErrorResponse` si la sesión no es válida
   */
  async obtener(): Promise<Usuario> {
    const usuario = await firstValueFrom(this.http.get<Usuario>(this.url));
    this.authService.guardarUsuario(usuario);
    return usuario;
  }

  /**
   * Guarda los cambios del perfil (multipart, con la foto nueva si se eligió una).
   * @returns el usuario actualizado; rechaza con el `HttpErrorResponse` si la API no los acepta
   */
  async actualizar(datos: DatosPerfil): Promise<Usuario> {
    const usuario = await firstValueFrom(
      this.http.patch<Usuario>(this.url, formDataDeUsuario(datos)),
    );
    this.authService.guardarUsuario(usuario);
    return usuario;
  }
}
