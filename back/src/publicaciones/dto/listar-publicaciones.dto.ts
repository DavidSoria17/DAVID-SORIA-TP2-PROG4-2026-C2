import { IsIn, IsMongoId, IsOptional } from 'class-validator';
import { PaginaDto } from '../../common/dto/pagina.dto.js';

export const ORDENES_PUBLICACIONES = ['fecha', 'meGusta'] as const;
export type OrdenPublicaciones = (typeof ORDENES_PUBLICACIONES)[number];

/** Filtro y página del listado de publicaciones. El orden llega aparte, por `ParseOrdenPipe`. */
export class ListarPublicacionesDto extends PaginaDto {
  /** Id del autor, para ver solo sus publicaciones. */
  @IsOptional()
  @IsMongoId({ message: 'El usuario no es un id válido' })
  usuario?: string;

  @IsOptional()
  @IsIn(ORDENES_PUBLICACIONES, { message: 'El orden tiene que ser fecha o meGusta' })
  orden: OrdenPublicaciones = 'fecha';
}



