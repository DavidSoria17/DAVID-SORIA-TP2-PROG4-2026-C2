import { DatePipe } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Comentario as DatosComentario } from '../../../core/models/comentario.model';
import { Publicacion } from '../../../core/models/publicacion.model';
import { Usuario } from '../../../core/models/usuario.model';
import { AuthService } from '../../../core/services/auth.service';
import { mensajeDeError } from '../../../core/utils/errores.utils';
import {
  COMENTARIOS_EN_PERFIL,
  PUBLICACIONES_EN_PERFIL,
} from '../../../core/utils/publicaciones.constants';
import { Avatar } from '../../../shared/components/avatar/avatar';
import { Aviso } from '../../../shared/components/aviso/aviso';
import { Comentario } from '../../../shared/components/comentario/comentario';
import { EstadoVacio } from '../../../shared/components/estado-vacio/estado-vacio';
import { PublicacionCard } from '../../../shared/components/publicacion-card/publicacion-card';
import { PublicacionesService } from '../../publicaciones/services/publicaciones.service';
import { PerfilService } from '../services/perfil.service';

/**
 * Mi perfil: datos y foto del usuario de la sesión, y sus últimas
 * publicaciones con los comentarios más recientes de cada una. Mientras
 * llegan los datos actualizados del servidor muestra los guardados al
 * iniciar sesión.
 */
@Component({
  selector: 'app-mi-perfil',
  imports: [Avatar, Aviso, Comentario, DatePipe, EstadoVacio, PublicacionCard, RouterLink],
  templateUrl: './mi-perfil.html',
  styleUrl: './mi-perfil.css',
})
export class MiPerfil implements OnInit {
  private readonly perfilService = inject(PerfilService);
  private readonly publicacionesService = inject(PublicacionesService);
  private readonly sesion = inject(AuthService).usuario;
  private readonly perfilActualizado = signal<Usuario | null>(null);

  protected readonly usuario = computed(() => this.perfilActualizado() ?? this.sesion());
  protected readonly cantidadMostrada = PUBLICACIONES_EN_PERFIL;
  protected readonly publicaciones = signal<Publicacion[]>([]);
  /** Comentarios de cada publicación, por id. */
  protected readonly comentarios = signal<Record<string, DatosComentario[]>>({});
  protected readonly totalPublicaciones = signal<number | null>(null);
  protected readonly error = signal<string | null>(null);

  ngOnInit(): void {
    const sesion = this.sesion();
    if (sesion) void this.cargar(sesion._id);
  }

  protected async alternarMeGusta(publicacion: Publicacion): Promise<void> {
    const actualizada = await this.publicacionesService.alternarMeGusta(publicacion);
    this.publicaciones.update((publicaciones) =>
      publicaciones.map((otra) => (otra._id === publicacion._id ? actualizada : otra)),
    );
  }

  /** Borra la publicación y vuelve a traer las últimas, así entra la siguiente más vieja. */
  protected async eliminar(publicacion: Publicacion): Promise<void> {
    if (await this.publicacionesService.eliminar(publicacion._id)) {
      await this.cargar(publicacion.autor._id);
    }
  }

  private async cargar(idUsuario: string): Promise<void> {
    try {
      const [perfil, pagina] = await Promise.all([
        this.perfilService.obtener(),
        this.publicacionesService.listar({
          orden: 'fecha',
          offset: 0,
          limit: PUBLICACIONES_EN_PERFIL,
          usuario: idUsuario,
        }),
      ]);
      const comentarios = await Promise.all(
        pagina.publicaciones.map(({ _id }) =>
          this.publicacionesService.listarComentarios(_id, COMENTARIOS_EN_PERFIL),
        ),
      );
      this.perfilActualizado.set(perfil);
      this.publicaciones.set(pagina.publicaciones);
      this.totalPublicaciones.set(pagina.total);
      this.comentarios.set(
        Object.fromEntries(
          pagina.publicaciones.map(({ _id }, indice) => [_id, comentarios[indice].comentarios]),
        ),
      );
      this.error.set(null);
    } catch (error) {
      this.error.set(mensajeDeError(error));
    }
  }
}
