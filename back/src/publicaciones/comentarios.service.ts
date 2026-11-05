import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { PayloadToken } from '../common/interfaces/payload-token.interface.js';
import { UsuariosService } from '../usuarios/usuarios.service.js';
import { GuardarComentarioDto } from './dto/guardar-comentario.dto.js';
import { ListarComentariosDto } from './dto/listar-comentarios.dto.js';
import { Comentario } from './entities/comentario.entity.js';
import { Publicacion } from './entities/publicacion.entity.js';

export type ComentarioListado = Comentario & {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

export interface PaginaComentarios {
  comentarios: ComentarioListado[];
  /** Si quedan comentarios más viejos para pedir con `antesDe`. */
  hayMas: boolean;
}

@Injectable()
export class ComentariosService {
  constructor(
    @InjectModel(Comentario.name)
    private readonly comentarioModel: Model<Comentario>,
    @InjectModel(Publicacion.name)
    private readonly publicacionModel: Model<Publicacion>,
    private readonly usuariosService: UsuariosService,
  ) {}

  /**
   * Comentarios de una publicación activa, del más reciente al más viejo. Se
   * pagina con cursor: `antesDe` es el id del último que ya se recibió. Si la
   * publicación no existe o está dada de baja, 404.
   */
  async listar(
    idPublicacion: Types.ObjectId,
    { antesDe, limit }: ListarComentariosDto,
  ): Promise<PaginaComentarios> {
    await this.verificarPublicacion(idPublicacion);

    const filtro = {
      publicacion: idPublicacion,
      ...(antesDe && { _id: { $lt: new Types.ObjectId(antesDe) } }),
    };
    // Se pide uno de más para saber si hay otra página sin contar todo.
    const comentarios = await this.comentarioModel
      .find(filtro)
      .sort({ _id: -1 })
      .limit(limit + 1)
      .lean<ComentarioListado[]>()
      .exec();

    return {
      comentarios: comentarios.slice(0, limit),
      hayMas: comentarios.length > limit,
    };
  }

  /**
   * Comenta una publicación activa a nombre del usuario de la sesión, con una
   * copia de su nombre y su foto como autor. Primero suma uno al contador de
   * la publicación (si no existe o está dada de baja, 404) y después guarda
   * el comentario; si el guardado falla, resta lo sumado.
   * @param idPublicacion publicación que se comenta
   * @param datos mensaje validado
   * @param sesion payload del token de quien comenta
   * @returns el comentario creado
   */
  async crear(
    idPublicacion: Types.ObjectId,
    { mensaje }: GuardarComentarioDto,
    sesion: PayloadToken,
  ): Promise<ComentarioListado> {
    const usuario = await this.usuariosService.buscarActivo(sesion.sub);

    const publicacion = await this.publicacionModel
      .findOneAndUpdate(
        { _id: idPublicacion, activa: true },
        { $inc: { cantidadComentarios: 1 } },
      )
      .select('_id')
      .lean()
      .exec();
    if (!publicacion) throw new NotFoundException('La publicación no existe');

    try {
      const comentario = await this.comentarioModel.create({
        publicacion: idPublicacion,
        mensaje,
        autor: {
          _id: usuario._id,
          nombreUsuario: usuario.nombreUsuario,
          urlImagen: usuario.urlImagen,
        },
      });
      return comentario.toObject<ComentarioListado>();
    } catch (error) {
      await this.publicacionModel
        .updateOne(
          { _id: idPublicacion },
          { $inc: { cantidadComentarios: -1 } },
        )
        .exec();
      throw error;
    }
  }

  /**
   * Cambia el mensaje de un comentario y lo marca como modificado. Si el
   * comentario no existe en esa publicación activa, 404; si no es de quien
   * lo pide, 403.
   * @returns el comentario actualizado
   */
  async editar(
    idPublicacion: Types.ObjectId,
    idComentario: Types.ObjectId,
    { mensaje }: GuardarComentarioDto,
    sesion: PayloadToken,
  ): Promise<ComentarioListado> {
    await this.verificarPublicacion(idPublicacion);

    const comentario = await this.comentarioModel
      .findOne({ _id: idComentario, publicacion: idPublicacion })
      .select('autor._id')
      .lean()
      .exec();
    if (!comentario) throw new NotFoundException('El comentario no existe');
    if (!comentario.autor._id.equals(sesion.sub)) {
      throw new ForbiddenException(
        'Solo quien escribió el comentario puede editarlo',
      );
    }

    const editado = await this.comentarioModel
      .findOneAndUpdate(
        { _id: idComentario },
        { $set: { mensaje, modificado: true } },
        { returnDocument: 'after' },
      )
      .lean<ComentarioListado>()
      .exec();
    if (!editado) throw new NotFoundException('El comentario no existe');
    return editado;
  }

  /** Lanza 404 si la publicación no existe o está dada de baja. */
  private async verificarPublicacion(id: Types.ObjectId): Promise<void> {
    const existe = await this.publicacionModel
      .exists({ _id: id, activa: true })
      .exec();
    if (!existe) throw new NotFoundException('La publicación no existe');
  }
}
