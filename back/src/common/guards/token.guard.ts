import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import jwt from 'jsonwebtoken';
import { PERFILES } from '../../usuarios/entities/usuario.entity.js';
import { PayloadToken } from '../interfaces/payload-token.interface.js';
import { PeticionAutenticada } from '../interfaces/peticion-autenticada.interface.js';

const esPayloadToken = (valor: unknown): valor is PayloadToken => {
  if (typeof valor !== 'object' || valor === null) return false;
  const { sub, nombreUsuario, perfil } = valor as Record<string, unknown>;
  return (
    typeof sub === 'string' &&
    typeof nombreUsuario === 'string' &&
    PERFILES.some((valido) => valido === perfil)
  );
};

/**
 * Exige el header `Authorization: Bearer <token>` con un JWT firmado por el
 * servidor y sin vencer. Deja el payload en `request.usuario`; si falta, está
 * mal formado o venció, responde 401.
 */
@Injectable()
export class TokenGuard implements CanActivate {
  constructor(private readonly config: ConfigService) {}

  canActivate(contexto: ExecutionContext): boolean {
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
    peticion.usuario = payload;
    return true;
  }
}
