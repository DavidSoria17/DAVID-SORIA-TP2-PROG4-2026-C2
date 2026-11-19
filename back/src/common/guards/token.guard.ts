import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import jwt from 'jsonwebtoken';
import { isValidObjectId } from 'mongoose';
import { PERFILES } from '../../usuarios/entities/usuario.entity.js';
import {
  MENSAJE_CUENTA_DESHABILITADA,
  UsuariosService,
} from '../../usuarios/usuarios.service.js';
import { PayloadToken } from '../interfaces/payload-token.interface.js';
import { PeticionAutenticada } from '../interfaces/peticion-autenticada.interface.js';

const esPayloadToken = (valor: unknown): valor is PayloadToken => {
  if (typeof valor !== 'object' || valor === null) return false;
  const { sub, nombreUsuario, perfil } = valor as Record<string, unknown>;
  return (
    typeof sub === 'string' &&
    isValidObjectId(sub) &&
    typeof nombreUsuario === 'string' &&
    PERFILES.some((valido) => valido === perfil)
  );
};

/**
 * Exige el header `Authorization: Bearer <token>` con un JWT firmado por el
 * servidor y sin vencer, y que la cuenta del token siga habilitada en la base.
 * Deja el payload en `request.usuario`. Responde 401 si el token falta, está
 * mal formado, venció o es de una cuenta que no existe, y 403 si la cuenta
 * está deshabilitada: un token emitido antes de la baja deja de servir en el
 * momento, sin esperar a que venza.
 */
@Injectable()
export class TokenGuard implements CanActivate {
  constructor(
    private readonly config: ConfigService,
    private readonly usuariosService: UsuariosService,
  ) {}

  async canActivate(contexto: ExecutionContext): Promise<boolean> {
    const peticion = contexto.switchToHttp().getRequest<PeticionAutenticada>();
    const [tipo, token] = peticion.headers.authorization?.split(' ') ?? [];
    if (tipo !== 'Bearer' || !token) {
      throw new UnauthorizedException('Iniciá sesión para continuar');
    }

    let payload: unknown;
    try {
      payload = jwt.verify(
        token,
        this.config.getOrThrow<string>('JWT_SECRETO'),
      );
    } catch (error) {
      throw new UnauthorizedException(
        error instanceof jwt.TokenExpiredError
          ? 'La sesión venció. Volvé a iniciar sesión'
          : 'La sesión no es válida. Volvé a iniciar sesión',
      );
    }
    if (!esPayloadToken(payload)) {
      throw new UnauthorizedException(
        'La sesión no es válida. Volvé a iniciar sesión',
      );
    }

    const activo = await this.usuariosService.estaActivo(payload.sub);
    if (activo === null) {
      throw new UnauthorizedException(
        'La sesión no es válida. Volvé a iniciar sesión',
      );
    }
    if (!activo) {
      throw new ForbiddenException(MENSAJE_CUENTA_DESHABILITADA);
    }

    peticion.usuario = payload;
    return true;
  }
}
