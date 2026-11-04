import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { validarImagenOpcional } from '../common/pipes/imagen-opcional.pipe.js';
import { NormalizarTextoPipe } from '../common/pipes/normalizar-texto.pipe.js';
import { CrearUsuarioDto } from '../usuarios/dto/crear-usuario.dto.js';
import { AuthService } from './auth.service.js';
import { LoginDto } from './dto/login.dto.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('registro')
  @UseInterceptors(FileInterceptor('imagen'))
  registrar(
    @Body(NormalizarTextoPipe) datos: CrearUsuarioDto,
    @UploadedFile(validarImagenOpcional()) imagen?: Express.Multer.File,
  ) {
    return this.authService.registrar(datos, imagen);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  iniciarSesion(@Body(NormalizarTextoPipe) datos: LoginDto) {
    return this.authService.iniciarSesion(datos);
  }
}
