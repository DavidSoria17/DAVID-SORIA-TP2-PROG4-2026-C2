import { PartialType, PickType } from '@nestjs/mapped-types';
import { CrearUsuarioDto } from './crear-usuario.dto.js';

/**
 * Datos editables del perfil propio, todos opcionales y con las mismas
 * validaciones del registro. Correo, nombre de usuario y contraseña no están:
 * `whitelist` los descarta si vienen en el body.
 */
export class ActualizarPerfilDto extends PartialType(
  PickType(CrearUsuarioDto, [
    'nombre',
    'apellido',
    'fechaNacimiento',
    'descripcion',
  ] as const),
) {}
