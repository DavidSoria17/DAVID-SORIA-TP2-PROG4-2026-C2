import { IsMongoId, IsOptional } from 'class-validator';
import { LimiteDto } from './limite.dto.js';

/** Página de comentarios con cursor: los anteriores al último que se recibió. */
export class ListarComentariosDto extends LimiteDto {
  /** Id del último comentario recibido; sin valor, empieza por el más reciente. */
  @IsOptional()
  @IsMongoId({ message: 'El cursor no es un id válido' })
  antesDe?: string;
}
