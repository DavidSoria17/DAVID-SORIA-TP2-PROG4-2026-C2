import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import bcrypt from 'bcrypt';
import { Model, mongo } from 'mongoose';
import { ImagenesService, ImagenSubida } from '../imagenes/imagenes.service.js';
import { CrearUsuarioDto } from './dto/crear-usuario.dto.js';
import { Usuario, UsuarioDocument } from './entities/usuario.entity.js';

const RONDAS_BCRYPT = 10;
const CODIGO_CLAVE_DUPLICADA = 11000;

@Injectable()
export class UsuariosService {
  constructor(
    @InjectModel(Usuario.name) private readonly usuarioModel: Model<Usuario>,
    private readonly imagenesService: ImagenesService,
  ) {}

  /**
   * Da de alta un usuario con la contraseña hasheada y, si viene, su foto de perfil.
   * Lanza 409 si el correo o el nombre de usuario ya están en uso. Si la imagen
   * se subió y después falla el guardado, la borra de Cloudinary.
   * @param datos datos validados y normalizados del formulario
   * @param imagen foto de perfil opcional, en memoria
   * @returns el usuario creado (sin contraseña al serializarse)
   */
  async crear(
    datos: CrearUsuarioDto,
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
      throw new ForbiddenException(
        'Tu cuenta está deshabilitada. Comunicate con un administrador',
      );
    }
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
