import { Type } from 'class-transformer';
import { IsInt, Max, Min } from 'class-validator';

/** Cantidad de resultados por pedido, común a los listados paginados. */
export class LimiteDto {
  @Type(() => Number)
  @IsInt({ message: 'El límite tiene que ser un número entero' })
  @Min(1, { message: 'El límite mínimo es 1' })
  @Max(50, { message: 'El límite máximo es 50' })
  limit = 10;
}
