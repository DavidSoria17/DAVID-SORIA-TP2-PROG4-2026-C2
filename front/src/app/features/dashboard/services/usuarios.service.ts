import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Service, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  DatosAltaUsuario,
  FiltrosUsuarios,
  PaginaUsuarios,
  Usuario,
} from '../../../core/models/usuario.model';
import { formDataDeUsuario } from '../../../core/utils/usuarios.utils';

/**
 * Gestión de usuarios del panel de administración contra la API. Todos los
 * métodos rechazan con el `HttpErrorResponse` si la API no acepta el pedido.
 */
@Service()
export class UsuariosService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.urlApi}/usuarios`;
  private readonly cantidadAltas = signal(0);

  /**
   * Cuántos usuarios se crearon desde que abrió la app. El listado queda
   * guardado mientras se usa la pantalla del alta y lo sigue para mostrar al
   * usuario nuevo.
   */
  readonly altas = this.cantidadAltas.asReadonly();

  /** Página de usuarios, de los más nuevos a los más viejos, con su cantidad de publicaciones. */
  listar({ estado, offset, limit }: FiltrosUsuarios): Promise<PaginaUsuarios> {
    let params = new HttpParams().set('offset', offset).set('limit', limit);
    if (estado) params = params.set('estado', estado);
    return firstValueFrom(this.http.get<PaginaUsuarios>(this.url, { params }));
  }

  /**
   * Da de alta un usuario con el perfil elegido (multipart, con la foto opcional).
   * @returns el usuario creado
   */
  async crear(datos: DatosAltaUsuario): Promise<Usuario> {
    const usuario = await firstValueFrom(
      this.http.post<Usuario>(this.url, formDataDeUsuario(datos)),
    );
    this.cantidadAltas.update((cantidad) => cantidad + 1);
    return usuario;
  }

  /**
   * Deshabilita al usuario: no va a poder iniciar sesión hasta que se lo habilite.
   * @returns el usuario actualizado
   */
  deshabilitar(usuario: Usuario): Promise<Usuario> {
    return firstValueFrom(this.http.delete<Usuario>(`${this.url}/${usuario._id}`));
  }

  /**
   * Vuelve a habilitar a un usuario deshabilitado.
   * @returns el usuario actualizado
   */
  habilitar(usuario: Usuario): Promise<Usuario> {
    return firstValueFrom(this.http.post<Usuario>(`${this.url}/${usuario._id}/alta`, null));
  }
}
