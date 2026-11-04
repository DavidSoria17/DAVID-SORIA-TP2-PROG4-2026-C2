import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  /** Correo si contiene `@`; si no, nombre de usuario. */
  @IsString()
  @IsNotEmpty({ message: 'Ingresá tu correo o nombre de usuario' })
  usuario: string;

  @IsString()
  @IsNotEmpty({ message: 'Ingresá tu contraseña' })
  contrasena: string;
}
