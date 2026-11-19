import { DatePipe } from '@angular/common';
import { Component, computed, effect, inject, OnInit, signal, untracked } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Comentario as DatosComentario } from '../../../core/models/comentario.model';
import { Publicacion } from '../../../core/models/publicacion.model';
import { AuthService } from '../../../core/services/auth.service';
import { mensajeDeError } from '../../../core/utils/errores.utils';
import { reemplazarPorId } from '../../../core/utils/listas.utils';
import {
  COMENTARIOS_EN_PERFIL,
  PUBLICACIONES_EN_PERFIL,
} from '../../../core/utils/publicaciones.constants';
import { Avatar } from '../../../shared/components/avatar/avatar';
import { Aviso } from '../../../shared/components/aviso/aviso';
import { Comentario } from '../../../shared/components/comentario/comentario';
import { EstadoVacio } from '../../../shared/components/estado-vacio/estado-vacio';
import { Icono } from '../../../shared/components/icono/icono';
import { PublicacionCard } from '../../../shared/components/publicacion-card/publicacion-card';
import { SiAdminDirective } from '../../../shared/directives/si-admin/si-admin';
import { ArrobaPipe } from '../../../shared/pipes/arroba/arroba';
import { PublicacionesService } from '../../publicaciones/services/publicaciones.service';
import { PerfilService } from '../services/perfil.service';

/**
 * Mi perfil: datos y foto del usuario de la sesión, y sus últimas
 * publicaciones con los comentarios más recientes de cada una. Muestra el
 * usuario guardado en la sesión, que `PerfilService` reemplaza por los datos
 * del servidor al cargar y al editar el perfil.
 */
@Component({
  selector: 'app-mi-perfil',
  imports: [
    ArrobaPipe,
    Avatar,
    Aviso,
    Comentario,
    DatePipe,
    EstadoVacio,
    Icono,
    PublicacionCard,
    RouterLink,
    SiAdminDirective,
  ],
  templateUrl: './mi-perfil.html',
  styleUrl: './mi-perfil.css',
})
export class MiPerfil implements OnInit {
  private readonly perfilService = inject(PerfilService);
  private readonly publicacionesService = inject(PublicacionesService);

  protected readonly usuario = inject(AuthService).usuario;
  protected readonly cantidadMostrada = PUBLICACIONES_EN_PERFIL;
  protected readonly publicaciones = signal<Publicacion[]>([]);
  /** Comentarios de cada publicación, por id. */
  protected readonly comentarios = signal<Record<string, DatosComentario[]>>({});
  protected readonly totalPublicaciones = signal<number | null>(null);
  protected readonly error = signal<string | null>(null);

  private readonly fotoDePerfil = computed(() => this.usuario()?.urlImagen);
  private fotoVista = this.fotoDePerfil();

  /**
   * La pantalla se conserva mientras se edita el perfil. Si cambió la foto,
   * las tarjetas tienen la copia vieja del autor y se vuelven a pedir.
   */
  private readonly seguirFoto = effect(() => {
    const foto = this.fotoDePerfil();
    if (foto === this.fotoVista) return;
    this.fotoVista = foto;
    const usuario = untracked(this.usuario);
    if (usuario) untracked(() => void this.cargar(usuario._id));
  });

  ngOnInit(): void {
    const usuario = this.usuario();
    if (usuario) void this.cargar(usuario._id);
  }

  protected async alternarMeGusta(publicacion: Publicacion): Promise<void> {
    const actualizada = await this.publicacionesService.alternarMeGusta(publicacion);
    this.publicaciones.update((publicaciones) => reemplazarPorId(publicaciones, actualizada));
  }

  /** Borra la publicación y vuelve a traer las últimas, así entra la siguiente más vieja. */
  protected async eliminar(publicacion: Publicacion): Promise<void> {
    if (await this.publicacionesService.eliminar(publicacion)) {
      await this.cargar(publicacion.autor._id);
    }
  }

  private async cargar(idUsuario: string): Promise<void> {
    try {
      const [, pagina] = await Promise.all([
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
