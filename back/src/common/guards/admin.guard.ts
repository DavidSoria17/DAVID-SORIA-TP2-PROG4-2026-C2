import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { PeticionAutenticada } from '../interfaces/peticion-autenticada.interface.js';

/**
 * Deja pasar solo a administradores; si no, responde 403. Va después de
 * `TokenGuard`, que es el que deja el payload en `request.usuario`.
 */
@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(contexto: ExecutionContext): boolean {
    const { usuario } = contexto
      .switchToHttp()
      .getRequest<PeticionAutenticada>();
    if (usuario.perfil !== 'administrador') {
      throw new ForbiddenException('Esta acción es solo para administradores');
    }
    return true;
  }
}
