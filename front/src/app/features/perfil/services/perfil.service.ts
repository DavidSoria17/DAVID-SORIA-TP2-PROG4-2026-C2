import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Usuario } from '../../../core/models/usuario.model';

/** Datos del perfil propio contra la API. */
@Service()
export class PerfilService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.urlApi}/usuarios/perfil`;

  /**
   * Datos actualizados del usuario de la sesión.
   * @returns el usuario; rechaza con el `HttpErrorResponse` si la sesión no es válida
   */
  obtener(): Promise<Usuario> {
    return firstValueFrom(this.http.get<Usuario>(this.url));
  }
}
