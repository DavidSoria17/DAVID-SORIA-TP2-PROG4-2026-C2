import { Type } from 'class-transformer';
import { IsInt, Max, Min } from 'class-validator';
import { RangoFechasDto } from './rango-fechas.dto.js';

/** Lapso y cantidad de publicaciones del ranking de comentarios. */
export class ComentariosPorPublicacionDto extends RangoFechasDto {
  @Type(() => Number)
  @IsInt({ message: 'El límite tiene que ser un número entero' })
  @Min(1, { message: 'El límite mínimo es 1' })
  @Max(50, { message: 'El límite máximo es 50' })
  limite = 10;
}
