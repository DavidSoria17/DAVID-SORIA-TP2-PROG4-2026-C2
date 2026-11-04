import { Request } from 'express';
import { PayloadToken } from './payload-token.interface.js';

/** Petición que ya pasó por `TokenGuard`: trae el payload del token en `usuario`. */
export interface PeticionAutenticada extends Request {
  usuario: PayloadToken;
}
