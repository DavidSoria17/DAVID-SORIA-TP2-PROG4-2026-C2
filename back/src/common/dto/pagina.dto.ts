import { Type } from 'class-transformer';
import { IsInt, Min } from 'class-validator';
import { LimiteDto } from './limite.dto.js';

/** Página de un listado con `offset` y `limit`. */
export class PaginaDto extends LimiteDto {
  @Type(() => Number)
  @IsInt({ message: 'El offset tiene que ser un número entero' })
  @Min(0, { message: 'El offset no puede ser negativo' })
  offset = 0;
}
