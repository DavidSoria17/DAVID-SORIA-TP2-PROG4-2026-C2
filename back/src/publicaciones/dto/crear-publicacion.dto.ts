import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { recortar } from '../../common/utils/texto.utils.js';

export class CrearPublicacionDto {
  @Transform(recortar)
  @IsString({ message: 'El título tiene que ser texto' })
  @IsNotEmpty({ message: 'El título es obligatorio' })
  @MaxLength(100, { message: 'El título admite hasta 100 caracteres' })
  titulo: string;

  @Transform(recortar)
  @IsString({ message: 'El mensaje tiene que ser texto' })
  @IsNotEmpty({ message: 'El mensaje es obligatorio' })
  @MaxLength(2000, { message: 'El mensaje admite hasta 2000 caracteres' })
  mensaje: string;
}
