import { Perfil } from '../../usuarios/entities/usuario.entity.js';

export interface PayloadToken {
  sub: string;
  nombreUsuario: string;
  perfil: Perfil;
}
