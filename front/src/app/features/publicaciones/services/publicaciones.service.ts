import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Service, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Comentario, PaginaComentarios } from '../../../core/models/comentario.model';
import {
  CambioPublicacion,
  DatosPublicacion,
  EstadoMeGusta,
  FiltrosPublicaciones,
  PaginaPublicaciones,
  Publicacion,
} from '../../../core/models/publicacion.model';
import { NotificacionService } from '../../../core/services/notificacion.service';
import { mensajeDeError } from '../../../core/utils/errores.utils';

/**
 * Publicaciones, me gusta y comentarios contra la API. Listar, obtener,
 * crear, comentar y editar rechazan con el `HttpErrorResponse`; el me gusta
 * y la baja, que se disparan desde una tarjeta, avisan del error ellos mismos.
 */
@Service()
export class PublicacionesService {
  private readonly http = inject(HttpClient);
  private readonly notificacionService = inject(NotificacionService);
  private readonly url = `${environment.urlApi}/publicaciones`;
  private readonly cambio = signal<CambioPublicacion | null>(null);

  /** Último cambio hecho a una publicación (alta, me gusta, comentario o baja). */
  readonly ultimoCambio = this.cambio.asReadonly();

  /**
   * Página de publicaciones activas.
   * @param filtros orden, página (`offset`, `limit`) y, opcionalmente, el autor
   */
  listar({ orden, offset, limit, usuario }: FiltrosPublicaciones): Promise<PaginaPublicaciones> {
    let params = new HttpParams().set('orden', orden).set('offset', offset).set('limit', limit);
    if (usuario) params = params.set('usuario', usuario);
    return firstValueFrom(this.http.get<PaginaPublicaciones>(this.url, { params }));
  }

  /** Una publicación activa, con si le di me gusta. */
  obtener(id: string): Promise<Publicacion> {
    return firstValueFrom(this.http.get<Publicacion>(`${this.url}/${id}`));
  }

  /** Publica con la imagen opcional (multipart). */
  async crear({ titulo, mensaje, imagen }: DatosPublicacion): Promise<Publicacion> {
    const formData = new FormData();
    formData.append('titulo', titulo);
    formData.append('mensaje', mensaje);
    if (imagen) formData.append('imagen', imagen);
    const publicacion = await firstValueFrom(this.http.post<Publicacion>(this.url, formData));
    this.cambio.set({ tipo: 'creada', publicacion });
    return publicacion;
  }

  /**
   * Da de baja una publicación propia (o cualquiera, si es administrador).
   * @returns `true` si se borró; si no, avisa por qué y devuelve `false`
   */
  async eliminar(publicacion: Publicacion): Promise<boolean> {
    try {
      await firstValueFrom(this.http.delete<void>(`${this.url}/${publicacion._id}`));
      this.cambio.set({ tipo: 'eliminada', publicacion });
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
      const actualizada = { ...publicacion, ...estado };
      this.cambio.set({ tipo: 'actualizada', publicacion: actualizada });
      return actualizada;
    } catch (error) {
      this.avisarError(
        publicacion.meGustaPropio ? 'No se pudo quitar el me gusta' : 'No se pudo dar me gusta',
        error,
      );
      return { ...publicacion };
    }
  }

  /**
   * Comentarios de una publicación, del más reciente al más viejo.
   * @param limit cuántos traer
   * @param antesDe id del último comentario recibido, para traer los anteriores
   */
  listarComentarios(
    idPublicacion: string,
    limit: number,
    antesDe?: string,
  ): Promise<PaginaComentarios> {
    let params = new HttpParams().set('limit', limit);
    if (antesDe) params = params.set('antesDe', antesDe);
    return firstValueFrom(
      this.http.get<PaginaComentarios>(`${this.url}/${idPublicacion}/comentarios`, { params }),
    );
  }

  /**
   * Comenta una publicación y suma uno a su cantidad de comentarios.
   * @returns el comentario creado
   */
  async comentar(publicacion: Publicacion, mensaje: string): Promise<Comentario> {
    const comentario = await firstValueFrom(
      this.http.post<Comentario>(`${this.url}/${publicacion._id}/comentarios`, { mensaje }),
    );
    this.cambio.set({
      tipo: 'actualizada',
      publicacion: { ...publicacion, cantidadComentarios: publicacion.cantidadComentarios + 1 },
    });
    return comentario;
  }

  /**
   * Cambia el mensaje de un comentario propio; queda marcado como editado.
   * @returns el comentario actualizado
   */
  editarComentario(comentario: Comentario, mensaje: string): Promise<Comentario> {
    return firstValueFrom(
      this.http.put<Comentario>(
        `${this.url}/${comentario.publicacion}/comentarios/${comentario._id}`,
        { mensaje },
      ),
    );
  }

  private avisarError(titulo: string, error: unknown): void {
    this.notificacionService.mostrar({ tipo: 'peligro', titulo, texto: mensajeDeError(error) });
  }
}
