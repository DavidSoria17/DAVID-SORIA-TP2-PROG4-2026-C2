import { IsIn } from 'class-validator';
import { type Perfil, PERFILES } from '../entities/usuario.entity.js';
import { CrearUsuarioDto } from './crear-usuario.dto.js';

/** Alta de un usuario hecha por un administrador: los datos del registro y el perfil elegido. */
export class AltaUsuarioDto extends CrearUsuarioDto {
  @IsIn(PERFILES, {
    message: 'El perfil tiene que ser usuario o administrador',
  })
  perfil: Perfil;
}
