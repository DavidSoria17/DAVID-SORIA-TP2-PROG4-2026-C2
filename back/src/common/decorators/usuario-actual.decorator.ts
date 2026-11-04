import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { PayloadToken } from '../interfaces/payload-token.interface.js';
import { PeticionAutenticada } from '../interfaces/peticion-autenticada.interface.js';

/** Payload del token de quien hace la petición. Solo en rutas con `TokenGuard`. */
export const UsuarioActual = createParamDecorator(
  (_dato: unknown, contexto: ExecutionContext): PayloadToken =>
    contexto.switchToHttp().getRequest<PeticionAutenticada>().usuario,
);
