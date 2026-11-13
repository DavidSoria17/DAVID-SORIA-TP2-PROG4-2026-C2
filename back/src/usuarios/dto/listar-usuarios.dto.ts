import { IsIn, IsOptional } from 'class-validator';
import { PaginaDto } from '../../common/dto/pagina.dto.js';

export const ESTADOS_USUARIO = ['habilitados', 'deshabilitados'] as const;
export type EstadoUsuario = (typeof ESTADOS_USUARIO)[number];

/** Página del listado de usuarios, opcionalmente solo los habilitados o los deshabilitados. */
export class ListarUsuariosDto extends PaginaDto {
  @IsOptional()
  @IsIn(ESTADOS_USUARIO, {
    message: 'El estado tiene que ser habilitados o deshabilitados',
  })
  estado?: EstadoUsuario;
}
