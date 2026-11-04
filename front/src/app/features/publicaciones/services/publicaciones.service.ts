import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Service, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { PaginaComentarios } from '../../../core/models/comentario.model';
import {
  DatosPublicacion,
  EstadoMeGusta,
  FiltrosPublicaciones,
  PaginaPublicaciones,
  Publicacion,
} from '../../../core/models/publicacion.model';
import { NotificacionService } from '../../../core/services/notificacion.service';
import { mensajeDeError } from '../../../core/utils/errores.utils';

/**
 * Publicaciones, me gusta y comentarios contra la API. Listar, crear y traer
 * comentarios rechazan con el `HttpErrorResponse`; el me gusta y la baja,
 * que se disparan desde una tarjeta, avisan del error ellos mismos.
 */
@Service()
export class PublicacionesService {
  private readonly http = inject(HttpClient);
  private readonly notificacionService = inject(NotificacionService);
  private readonly url = `${environment.urlApi}/publicaciones`;
  private readonly cantidadPublicadas = signal(0);

  /** Cuántas publicaciones se crearon en esta sesión; el listado lo sigue para recargarse. */
  readonly publicadas = this.cantidadPublicadas.asReadonly();

  /**
   * Página de publicaciones activas.
   * @param filtros orden, página (`offset`, `limit`) y, opcionalmente, el autor
   */
  listar({ orden, offset, limit, usuario }: FiltrosPublicaciones): Promise<PaginaPublicaciones> {
    let params = new HttpParams().set('orden', orden).set('offset', offset).set('limit', limit);
    if (usuario) params = params.set('usuario', usuario);
    return firstValueFrom(this.http.get<PaginaPublicaciones>(this.url, { params }));
  }

  /** Publica con la imagen opcional (multipart). */
  async crear({ titulo, mensaje, imagen }: DatosPublicacion): Promise<Publicacion> {
    const formData = new FormData();
    formData.append('titulo', titulo);
    formData.append('mensaje', mensaje);
    if (imagen) formData.append('imagen', imagen);
    const publicacion = await firstValueFrom(this.http.post<Publicacion>(this.url, formData));
    this.cantidadPublicadas.update((cantidad) => cantidad + 1);
    return publicacion;
  }

  /**
   * Da de baja una publicación propia (o cualquiera, si es administrador).
   * @returns `true` si se borró; si no, avisa por qué y devuelve `false`
   */
  async eliminar(id: string): Promise<boolean> {
    try {
      await firstValueFrom(this.http.delete<void>(`${this.url}/${id}`));
      return true;
    } catch (error) {
      this.avisarError('No se pudo borrar la publicación', error);
      return false;
    }
  }

  /**
   * Da o quita el me gusta según cómo esté.
   * @returns una copia de la publicación con el contador y el me gusta propio
   *   actualizados; si falla, avisa y la copia queda igual
   */
  async alternarMeGusta(publicacion: Publicacion): Promise<Publicacion> {
    const url = `${this.url}/${publicacion._id}/me-gusta`;
    try {
      const estado = await firstValueFrom(
        publicacion.meGustaPropio
          ? this.http.delete<EstadoMeGusta>(url)
          : this.http.post<EstadoMeGusta>(url, null),
      );
      return { ...publicacion, ...estado };
    } catch (error) {
      this.avisarError(
        publicacion.meGustaPropio ? 'No se pudo quitar el me gusta' : 'No se pudo dar me gusta',
        error,
      );
      return { ...publicacion };
    }
  }

  /** Los comentarios más recientes de una publicación. */
  listarComentarios(idPublicacion: string, limit: number): Promise<PaginaComentarios> {
    const params = new HttpParams().set('limit', limit);
    return firstValueFrom(
      this.http.get<PaginaComentarios>(`${this.url}/${idPublicacion}/comentarios`, { params }),
    );
  }

  private avisarError(titulo: string, error: unknown): void {
    this.notificacionService.mostrar({ tipo: 'peligro', titulo, texto: mensajeDeError(error) });
  }
}
