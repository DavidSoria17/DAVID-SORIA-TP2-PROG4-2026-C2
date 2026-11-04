import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
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
    const existe = await this.publicacionModel
      .exists({ _id: idPublicacion, activa: true })
      .exec();
    if (!existe) throw new NotFoundException('La publicación no existe');

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
}
