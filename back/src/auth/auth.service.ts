import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PayloadToken } from '../common/interfaces/payload-token.interface.js';
import { CrearUsuarioDto } from '../usuarios/dto/crear-usuario.dto.js';
import { UsuarioDocument } from '../usuarios/entities/usuario.entity.js';
import { UsuariosService } from '../usuarios/usuarios.service.js';
import { LoginDto } from './dto/login.dto.js';

export interface RespuestaAuth {
  usuario: UsuarioDocument;
  token: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usuariosService: UsuariosService,
    private readonly config: ConfigService,
  ) {}

  /**
   * Crea la cuenta con perfil `usuario` y devuelve la sesión iniciada.
   * @param datos datos del formulario de registro
   * @param imagen foto de perfil opcional
   */
  async registrar(
    datos: CrearUsuarioDto,
    imagen?: Express.Multer.File,
  ): Promise<RespuestaAuth> {
    const usuario = await this.usuariosService.crear(datos, imagen);
    return { usuario, token: this.firmarToken(usuario) };
  }

  /**
   * Valida las credenciales comparando la contraseña recibida contra el hash guardado.
   * Lanza 401 si el usuario no existe o la contraseña no coincide (con el mismo
   * mensaje, para no revelar qué cuentas existen) y 403 si la cuenta está deshabilitada.
   */
  async iniciarSesion({
    usuario: identificador,
    contrasena,
  }: LoginDto): Promise<RespuestaAuth> {
    const usuario =
      await this.usuariosService.buscarConContrasena(identificador);
    const coincide = usuario
      ? await bcrypt.compare(contrasena, usuario.contrasena)
      : false;

    if (!usuario || !coincide) {
      throw new UnauthorizedException('Usuario o contraseña incorrectos');
    }
    if (!usuario.activo) {
      throw new ForbiddenException(
        'Tu cuenta está deshabilitada. Comunicate con un administrador',
      );
    }
    return { usuario, token: this.firmarToken(usuario) };
  }

  /**
   * Datos actualizados del usuario de un token que ya validó `TokenGuard`.
   * Lanza 403 si la cuenta se deshabilitó después de emitir el token.
   */
  autorizar(sesion: PayloadToken): Promise<UsuarioDocument> {
    return this.usuariosService.buscarActivo(sesion.sub);
  }

  /**
   * Token nuevo con el mismo payload y otros 15 minutos de validez. Lanza 403
   * si la cuenta se deshabilitó después de emitir el token anterior.
   */
  async refrescar(sesion: PayloadToken): Promise<{ token: string }> {
    const usuario = await this.usuariosService.buscarActivo(sesion.sub);
    return { token: this.firmarToken(usuario) };
  }

  private firmarToken(usuario: UsuarioDocument): string {
    const payload: PayloadToken = {
      sub: usuario.id,
      nombreUsuario: usuario.nombreUsuario,
      perfil: usuario.perfil,
    };
    return jwt.sign(payload, this.config.getOrThrow<string>('JWT_SECRETO'), {
      expiresIn: '15m',
    });
  }
}
