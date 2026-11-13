import { IsISO8601, Matches } from 'class-validator';

const FORMATO_DIA = /^\d{4}-\d{2}-\d{2}$/;

/** Lapso de las estadísticas: días AAAA-MM-DD, los dos incluidos. */
export class RangoFechasDto {
  @Matches(FORMATO_DIA, { message: 'La fecha desde tiene que ser AAAA-MM-DD' })
  @IsISO8601({ strict: true }, { message: 'La fecha desde no existe' })
  desde: string;

  @Matches(FORMATO_DIA, { message: 'La fecha hasta tiene que ser AAAA-MM-DD' })
  @IsISO8601({ strict: true }, { message: 'La fecha hasta no existe' })
  hasta: string;
}
