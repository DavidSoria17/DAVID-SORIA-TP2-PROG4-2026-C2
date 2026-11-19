import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import bcrypt from 'bcrypt';
import { Model, mongo, Types } from 'mongoose';
import { PayloadToken } from '../common/interfaces/payload-token.interface.js';
import { ImagenesService, ImagenSubida } from '../imagenes/imagenes.service.js';
import { Comentario } from '../publicaciones/entities/comentario.entity.js';
import { Publicacion } from '../publicaciones/entities/publicacion.entity.js';
import { ActualizarPerfilDto } from './dto/actualizar-perfil.dto.js';
import { CrearUsuarioDto } from './dto/crear-usuario.dto.js';
import { ListarUsuariosDto } from './dto/listar-usuarios.dto.js';
import { Perfil, Usuario, UsuarioDocument } from './entities/usuario.entity.js';

const RONDAS_BCRYPT = 10;
const CODIGO_CLAVE_DUPLICADA = 11000;

export const MENSAJE_CUENTA_DESHABILITADA =
  'Tu cuenta está deshabilitada. Comunicate con un administrador';

/** Usuario del listado de administración, como objeto plano. */
export type UsuarioListado = Usuario & {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

export interface PaginaUsuarios {
  usuarios: UsuarioListado[];
  /** Cantidad que cumple el filtro, para armar la paginación. */
  total: number;
  /** Cuántos hay de cada estado, sin importar el filtro. */
  cantidades: { todos: number; habilitados: number; deshabilitados: number };
}

@Injectable()
export class UsuariosService {
  constructor(
    @InjectModel(Usuario.name) private readonly usuarioModel: Model<Usuario>,
    @InjectModel(Publicacion.name)
    private readonly publicacionModel: Model<Publicacion>,
    @InjectModel(Comentario.name)
    private readonly comentarioModel: Model<Comentario>,
    private readonly imagenesService: ImagenesService,
  ) {}

  /**
   * Da de alta un usuario con la contraseña hasheada y, si viene, su foto de perfil.
   * Lanza 409 si el correo o el nombre de usuario ya están en uso. Si la imagen
   * se subió y después falla el guardado, la borra de Cloudinary.
   * @param datos datos validados y normalizados del formulario
   * @param perfil `usuario` en el registro; el que elija el administrador en un alta
   * @param imagen foto de perfil opcional, en memoria
   * @returns el usuario creado (sin contraseña al serializarse)
   */
  async crear(
    datos: CrearUsuarioDto,
    perfil: Perfil,
    imagen?: Express.Multer.File,
  ): Promise<UsuarioDocument> {
    await this.verificarDisponibilidad(datos.correo, datos.nombreUsuario);

    const contrasena = await bcrypt.hash(datos.contrasena, RONDAS_BCRYPT);
    const imagenSubida = imagen
      ? await this.imagenesService.subir(imagen, 'perfiles')
      : undefined;

    try {
      return await this.usuarioModel.create({
        nombre: datos.nombre,
        apellido: datos.apellido,
        correo: datos.correo,
        nombreUsuario: datos.nombreUsuario,
        contrasena,
        fechaNacimiento: datos.fechaNacimiento,
        descripcion: datos.descripcion,
        urlImagen: imagenSubida?.url,
        perfil,
      });
    } catch (error) {
      await this.descartarImagen(imagenSubida);
      // Dos registros iguales al mismo tiempo pasan la verificación previa;
      // el índice único rechaza el segundo.
      if (
        error instanceof mongo.MongoServerError &&
        error.code === CODIGO_CLAVE_DUPLICADA
      ) {
        throw new ConflictException(
          'El correo o el nombre de usuario ya están en uso',
        );
      }
      throw error;
    }
  }

  /**
   * Busca un usuario por correo o por nombre de usuario, incluyendo el hash
   * de la contraseña para poder compararlo en el login.
   * @param identificador correo (si contiene `@`) o nombre de usuario, en minúsculas
   */
  buscarConContrasena(identificador: string): Promise<UsuarioDocument | null> {
    const filtro = identificador.includes('@')
      ? { correo: identificador }
      : { nombreUsuario: identificador };
    return this.usuarioModel.findOne(filtro).select('+contrasena').exec();
  }

  /**
   * Busca un usuario por id.
   * @returns el usuario, o `null` si no existe
   */
  buscarPorId(id: string): Promise<UsuarioDocument | null> {
    return this.usuarioModel.findById(id).exec();
  }

  /**
   * Usuario de la sesión, para mostrar su perfil o copiar sus datos como autor.
   * Lanza 404 si la cuenta ya no existe y 403 si está deshabilitada.
   */
  async buscarActivo(id: string): Promise<UsuarioDocument> {
    const usuario = await this.buscarPorId(id);
    if (!usuario) throw new NotFoundException('La cuenta no existe');
    if (!usuario.activo) {
      throw new ForbiddenException(MENSAJE_CUENTA_DESHABILITADA);
    }
    return usuario;
  }

  /**
   * Edita el perfil propio: nombre, apellido, fecha de nacimiento, descripción
   * y foto. Si cambia la foto, actualiza la copia del autor en sus
   * publicaciones y comentarios. Si la imagen se subió y después falla el
   * guardado, la borra de Cloudinary.
   * @param id usuario de la sesión
   * @param datos solo los campos que se quieren cambiar
   * @param imagen foto de perfil nueva, opcional
   * @returns el usuario actualizado; 404 si la cuenta ya no existe
   */
  async actualizarPerfil(
    id: string,
    datos: ActualizarPerfilDto,
    imagen?: Express.Multer.File,
  ): Promise<UsuarioDocument> {
    const imagenSubida = imagen
      ? await this.imagenesService.subir(imagen, 'perfiles')
      : undefined;

    // Mongoose descarta las claves sin valor: solo se pisan los campos que vinieron.
    const cambios: Partial<Usuario> = {
      nombre: datos.nombre,
      apellido: datos.apellido,
      fechaNacimiento: datos.fechaNacimiento,
      descripcion: datos.descripcion,
      urlImagen: imagenSubida?.url,
    };

    let usuario: UsuarioDocument | null;
    try {
      usuario = await this.usuarioModel
        .findByIdAndUpdate(
          id,
          { $set: cambios },
          { returnDocument: 'after', runValidators: true },
        )
        .exec();
    } catch (error) {
      await this.descartarImagen(imagenSubida);
      throw error;
    }
    if (!usuario) {
      await this.descartarImagen(imagenSubida);
      throw new NotFoundException('La cuenta no existe');
    }

    if (imagenSubida) {
      const copiaDelAutor = { 'autor._id': usuario._id };
      const fotoNueva = { $set: { 'autor.urlImagen': imagenSubida.url } };
      await Promise.all([
        this.publicacionModel.updateMany(copiaDelAutor, fotoNueva).exec(),
        this.comentarioModel.updateMany(copiaDelAutor, fotoNueva).exec(),
      ]);
    }
    return usuario;
  }

  /**
   * Estado de una cuenta. Lo consulta `TokenGuard` en cada petición, por eso
   * trae solo el campo `activo`.
   * @returns `true` si está habilitada, `false` si no, o `null` si no existe
   */
  async estaActivo(id: string): Promise<boolean | null> {
    const usuario = await this.usuarioModel
      .findById(id)
      .select('activo')
      .lean()
      .exec();
    return usuario ? usuario.activo : null;
  }

  /**
   * Página de usuarios para el panel de administración, de los más nuevos a
   * los más viejos, con el total que cumple el filtro y cuántos hay de cada
   * estado.
   * @param filtros estado opcional, `offset` y `limit`
   */
  async listar({
    estado,
    offset,
    limit,
  }: ListarUsuariosDto): Promise<PaginaUsuarios> {
    const filtro = estado ? { activo: estado === 'habilitados' } : {};

    const [usuarios, total, todos, deshabilitados] = await Promise.all([
      this.usuarioModel
        .find(filtro)
        .sort({ _id: -1 })
        .skip(offset)
        .limit(limit)
        .lean<UsuarioListado[]>()
        .exec(),
      this.usuarioModel.countDocuments(filtro).exec(),
      this.usuarioModel.countDocuments().exec(),
      this.usuarioModel.countDocuments({ activo: false }).exec(),
    ]);

    return {
      usuarios,
      total,
      cantidades: {
        todos,
        habilitados: todos - deshabilitados,
        deshabilitados,
      },
    };
  }

  /**
   * Baja lógica: el usuario deja de poder iniciar sesión. Un administrador no
   * puede deshabilitarse a sí mismo (400); si el usuario no existe, 404.
   * @param id usuario a deshabilitar
   * @param sesion payload del token del administrador
   * @returns el usuario actualizado
   */
  async deshabilitar(
    id: Types.ObjectId,
    sesion: PayloadToken,
  ): Promise<UsuarioDocument> {
    if (id.equals(sesion.sub)) {
      throw new BadRequestException('No podés deshabilitar tu propia cuenta');
    }
    return this.cambiarEstado(id, false);
  }

  /**
   * Alta lógica: el usuario vuelve a poder iniciar sesión. Si no existe, 404.
   * @returns el usuario actualizado
   */
  habilitar(id: Types.ObjectId): Promise<UsuarioDocument> {
    return this.cambiarEstado(id, true);
  }

  private async cambiarEstado(
    id: Types.ObjectId,
    activo: boolean,
  ): Promise<UsuarioDocument> {
    const usuario = await this.usuarioModel
      .findByIdAndUpdate(id, { $set: { activo } }, { returnDocument: 'after' })
      .exec();
    if (!usuario) throw new NotFoundException('El usuario no existe');
    return usuario;
  }

  private async verificarDisponibilidad(
    correo: string,
    nombreUsuario: string,
  ): Promise<void> {
    const existente = await this.usuarioModel
      .findOne({ $or: [{ correo }, { nombreUsuario }] })
      .select('correo')
      .lean()
      .exec();

    if (!existente) return;
    if (existente.correo === correo) {
      throw new ConflictException('Ya existe una cuenta con ese correo');
    }
    throw new ConflictException('Ese nombre de usuario ya está en uso');
  }

  private async descartarImagen(imagen?: ImagenSubida): Promise<void> {
    if (imagen) await this.imagenesService.eliminar(imagen.idPublico);
  }
}
