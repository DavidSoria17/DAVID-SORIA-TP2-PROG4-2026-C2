import { Transform, Type } from 'class-transformer';
import {
  IsDate,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxDate,
  MaxLength,
  MinLength,
} from 'class-validator';
import { recortar } from '../../common/utils/texto.utils.js';

/** Letras (con tildes y ñ) separadas por un espacio, apóstrofo o guion. */
const SOLO_LETRAS = /^\p{L}+(?:[ '-]\p{L}+)*$/u;

export class CrearUsuarioDto {
  @Transform(recortar)
  @IsString()
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @MaxLength(50, { message: 'El nombre admite hasta 50 caracteres' })
  @Matches(SOLO_LETRAS, {
    message:
      'El nombre solo puede tener letras, espacios, apóstrofos o guiones',
  })
  nombre: string;

  @Transform(recortar)
  @IsString()
  @IsNotEmpty({ message: 'El apellido es obligatorio' })
  @MaxLength(50, { message: 'El apellido admite hasta 50 caracteres' })
  @Matches(SOLO_LETRAS, {
    message:
      'El apellido solo puede tener letras, espacios, apóstrofos o guiones',
  })
  apellido: string;

  @Transform(recortar)
  @IsEmail({}, { message: 'El correo no tiene un formato válido' })
  correo: string;

  // Se aceptan mayúsculas porque NormalizarTextoPipe lo pasa a minúsculas
  // después de esta validación.
  @Transform(recortar)
  @Matches(/^[a-z0-9._]{3,20}$/i, {
    message:
      'El nombre de usuario lleva de 3 a 20 letras, números, puntos o guiones bajos',
  })
  nombreUsuario: string;

  @IsString()
  @MinLength(8, { message: 'La contraseña necesita al menos 8 caracteres' })
  // Un solo @Matches: class-validator guarda un mensaje por tipo de regla,
  // así que dos @Matches en la misma propiedad mostrarían uno solo.
  @Matches(/^(?=.*[A-Z])(?=.*\d)/, {
    message: 'La contraseña necesita al menos una mayúscula y un número',
  })
  contrasena: string;

  // El front manda AAAA-MM-DD, que se interpreta como las 00:00 UTC de ese día.
  @Type(() => Date)
  @IsDate({ message: 'La fecha de nacimiento no es válida' })
  @MaxDate(() => new Date(), {
    message: 'La fecha de nacimiento tiene que ser anterior a hoy',
  })
  fechaNacimiento: Date;

  @IsOptional()
  @Transform(recortar)
  @IsString()
  @MaxLength(200, { message: 'La descripción admite hasta 200 caracteres' })
  descripcion?: string;
}
