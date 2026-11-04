import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, mongo, SortOrder, Types } from 'mongoose';
import { PayloadToken } from '../common/interfaces/payload-token.interface.js';
import { OrdenPublicaciones } from '../common/pipes/parse-orden.pipe.js';
import { ImagenesService, ImagenSubida } from '../imagenes/imagenes.service.js';
import { UsuariosService } from '../usuarios/usuarios.service.js';
import { CrearPublicacionDto } from './dto/crear-publicacion.dto.js';
import { ListarPublicacionesDto } from './dto/listar-publicaciones.dto.js';
import { MeGusta } from './entities/me-gusta.entity.js';
import { Publicacion } from './entities/publicacion.entity.js';

const CODIGO_CLAVE_DUPLICADA = 11000;

/** Publicación tal como la recibe el front, con si le dio me gusta quien la pide. */
export type PublicacionListada = Omit<Publicacion, 'activa'> & {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  meGustaPropio: boolean;
};

export interface PaginaPublicaciones {
  publicaciones: PublicacionListada[];
  /** Cantidad total que cumple el filtro, para armar la paginación. */
  total: number;
}

export interface EstadoMeGusta {
  cantidadMeGusta: number;
  meGustaPropio: boolean;
}

@Injectable()
export class PublicacionesService {
  constructor(
    @InjectModel(Publicacion.name)
    private readonly publicacionModel: Model<Publicacion>,
    @InjectModel(MeGusta.name) private readonly meGustaModel: Model<MeGusta>,
    private readonly usuariosService: UsuariosService,
    private readonly imagenesService: ImagenesService,
  ) {}

  /**
   * Publica a nombre del usuario de la sesión, con una copia de su nombre y su
   * foto como autor. Si la imagen se subió y después falla el guardado, la
   * borra de Cloudinary.
   * @param datos título y mensaje validados
   * @param imagen imagen opcional, en memoria
   * @param sesion payload del token de quien publica
   */
  async crear(
    datos: CrearPublicacionDto,
    imagen: Express.Multer.File | undefined,
    sesion: PayloadToken,
  ): Promise<PublicacionListada> {
    const usuario = await this.usuariosService.buscarActivo(sesion.sub);
    const imagenSubida = imagen
      ? await this.imagenesService.subir(imagen, 'publicaciones')
      : undefined;

    try {
      const publicacion = await this.publicacionModel.create({
        titulo: datos.titulo,
        mensaje: datos.mensaje,
        urlImagen: imagenSubida?.url,
        autor: {
          _id: usuario._id,
          nombreUsuario: usuario.nombreUsuario,
          urlImagen: usuario.urlImagen,
        },
      });
      const { activa: _activa, ...resto } = publicacion.toObject<
        Omit<PublicacionListada, 'meGustaPropio'> & { activa: boolean }
      >();
      return { ...resto, meGustaPropio: false };
    } catch (error) {
      await this.descartarImagen(imagenSubida);
      throw error;
    }
  }

  /**
   * Página de publicaciones activas, opcionalmente de un solo autor. Cada una
   * indica si quien pide ya le dio me gusta (una sola consulta extra para
   * toda la página).
   * @param orden `fecha` (las más nuevas primero) o `meGusta` (las más gustadas primero)
   * @param filtros autor, `offset` y `limit`
   * @param idUsuario id de quien hace el pedido
   */
  async listar(
    orden: OrdenPublicaciones,
    { usuario, offset, limit }: ListarPublicacionesDto,
    idUsuario: string,
  ): Promise<PaginaPublicaciones> {
    const filtro = {
      activa: true,
      ...(usuario && { 'autor._id': new Types.ObjectId(usuario) }),
    };
    // Siempre se desempata por _id para que la paginación sea estable.
    const ordenamiento: Record<string, SortOrder> =
      orden === 'meGusta'
        ? { cantidadMeGusta: -1, _id: -1 }
        : { createdAt: -1, _id: -1 };

    const [publicaciones, total] = await Promise.all([
      this.publicacionModel
        .find(filtro)
        .sort(ordenamiento)
        .skip(offset)
        .limit(limit)
        .select('-activa')
        .lean<Omit<PublicacionListada, 'meGustaPropio'>[]>()
        .exec(),
      this.publicacionModel.countDocuments(filtro).exec(),
    ]);

    const propios = await this.meGustaModel
      .find({
        usuario: idUsuario,
        publicacion: { $in: publicaciones.map(({ _id }) => _id) },
      })
      .select('publicacion')
      .lean()
      .exec();
    const conMeGusta = new Set(
      propios.map(({ publicacion }) => publicacion.toString()),
    );

    return {
      publicaciones: publicaciones.map((publicacion) => ({
        ...publicacion,
        meGustaPropio: conMeGusta.has(publicacion._id.toString()),
      })),
      total,
    };
  }

  /**
   * Baja lógica. Solo puede hacerla el autor o un administrador (403); si la
   * publicación no existe o ya estaba dada de baja, 404.
   */
  async darDeBaja(id: Types.ObjectId, sesion: PayloadToken): Promise<void> {
    const publicacion = await this.publicacionModel
      .findOne({ _id: id, activa: true })
      .select('autor._id')
      .lean()
      .exec();
    if (!publicacion) throw new NotFoundException('La publicación no existe');

    const esAutor = publicacion.autor._id.equals(sesion.sub);
    if (!esAutor && sesion.perfil !== 'administrador') {
      throw new ForbiddenException(
        'Solo quien la publicó o un administrador puede borrarla',
      );
    }

    const { matchedCount } = await this.publicacionModel
      .updateOne({ _id: id, activa: true }, { $set: { activa: false } })
      .exec();
    if (matchedCount === 0) {
      throw new NotFoundException('La publicación no existe');
    }
  }

  /**
   * Registra el me gusta del usuario y suma uno al contador. Si ya lo había
   * dado, 400. Si la publicación no existe o está dada de baja, deshace el
   * registro y responde 404.
   * @returns el contador actualizado
   */
  async darMeGusta(
    id: Types.ObjectId,
    idUsuario: string,
  ): Promise<EstadoMeGusta> {
    try {
      await this.meGustaModel.create({ publicacion: id, usuario: idUsuario });
    } catch (error) {
      if (
        error instanceof mongo.MongoServerError &&
        error.code === CODIGO_CLAVE_DUPLICADA
      ) {
        throw new BadRequestException(
          'Ya le diste me gusta a esta publicación',
        );
      }
      throw error;
    }

    const publicacion = await this.publicacionModel
      .findOneAndUpdate(
        { _id: id, activa: true },
        { $inc: { cantidadMeGusta: 1 } },
        { returnDocument: 'after' },
      )
      .select('cantidadMeGusta')
      .lean()
      .exec();
    if (!publicacion) {
      await this.meGustaModel
        .deleteOne({ publicacion: id, usuario: idUsuario })
        .exec();
      throw new NotFoundException('La publicación no existe');
    }
    return {
      cantidadMeGusta: publicacion.cantidadMeGusta,
      meGustaPropio: true,
    };
  }

  /**
   * Quita el me gusta del usuario y resta uno al contador. Si no lo había
   * dado, 400.
   * @returns el contador actualizado
   */
  async quitarMeGusta(
    id: Types.ObjectId,
    idUsuario: string,
  ): Promise<EstadoMeGusta> {
    const { deletedCount } = await this.meGustaModel
      .deleteOne({ publicacion: id, usuario: idUsuario })
      .exec();
    if (deletedCount === 0) {
      throw new BadRequestException(
        'No le habías dado me gusta a esta publicación',
      );
    }

    const publicacion = await this.publicacionModel
      .findOneAndUpdate(
        { _id: id },
        { $inc: { cantidadMeGusta: -1 } },
        { returnDocument: 'after' },
      )
      .select('cantidadMeGusta')
      .lean()
      .exec();
    if (!publicacion) throw new NotFoundException('La publicación no existe');
    return {
      cantidadMeGusta: publicacion.cantidadMeGusta,
      meGustaPropio: false,
    };
  }

  private async descartarImagen(imagen?: ImagenSubida): Promise<void> {
    if (imagen) await this.imagenesService.eliminar(imagen.idPublico);
  }
}
