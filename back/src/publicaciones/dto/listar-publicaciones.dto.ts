import { Type } from 'class-transformer';
import { IsInt, IsMongoId, IsOptional, Min } from 'class-validator';
import { LimiteDto } from './limite.dto.js';

/** Filtro y página del listado de publicaciones. El orden llega aparte, por `ParseOrdenPipe`. */
export class ListarPublicacionesDto extends LimiteDto {
  /** Id del autor, para ver solo sus publicaciones. */
  @IsOptional()
  @IsMongoId({ message: 'El usuario no es un id válido' })
  usuario?: string;

  @Type(() => Number)
  @IsInt({ message: 'El offset tiene que ser un número entero' })
  @Min(0, { message: 'El offset no puede ser negativo' })
  offset = 0;
}
