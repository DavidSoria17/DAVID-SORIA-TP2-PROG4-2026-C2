import { IsMongoId, IsOptional } from 'class-validator';
import { PaginaDto } from '../../common/dto/pagina.dto.js';

/** Filtro y página del listado de publicaciones. El orden llega aparte, por `ParseOrdenPipe`. */
export class ListarPublicacionesDto extends PaginaDto {
  /** Id del autor, para ver solo sus publicaciones. */
  @IsOptional()
  @IsMongoId({ message: 'El usuario no es un id válido' })
  usuario?: string;
}
