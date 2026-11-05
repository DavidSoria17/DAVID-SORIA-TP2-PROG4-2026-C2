import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { recortar } from '../../common/utils/texto.utils.js';

/** Mensaje de un comentario, al crearlo o al editarlo. */
export class GuardarComentarioDto {
  @Transform(recortar)
  @IsString({ message: 'El comentario tiene que ser texto' })
  @IsNotEmpty({ message: 'El comentario no puede estar vacío' })
  @MaxLength(500, { message: 'El comentario admite hasta 500 caracteres' })
  mensaje: string;
}
