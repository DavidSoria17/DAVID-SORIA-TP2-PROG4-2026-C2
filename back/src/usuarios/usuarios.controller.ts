import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Types } from 'mongoose';
import { UsuarioActual } from '../common/decorators/usuario-actual.decorator.js';
import { AdminGuard } from '../common/guards/admin.guard.js';
import { TokenGuard } from '../common/guards/token.guard.js';
import type { PayloadToken } from '../common/interfaces/payload-token.interface.js';
import { validarImagenOpcional } from '../common/pipes/imagen-opcional.pipe.js';
import { NormalizarTextoPipe } from '../common/pipes/normalizar-texto.pipe.js';
import { ParseObjectIdPipe } from '../common/pipes/parse-object-id.pipe.js';
import { AltaUsuarioDto } from './dto/alta-usuario.dto.js';
import { ListarUsuariosDto } from './dto/listar-usuarios.dto.js';
import { UsuariosService } from './usuarios.service.js';

@Controller('usuarios')
@UseGuards(TokenGuard)
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Get('perfil')
  perfil(@UsuarioActual() usuario: PayloadToken) {
    return this.usuariosService.buscarActivo(usuario.sub);
  }

  @Get()
  @UseGuards(AdminGuard)
  listar(@Query() filtros: ListarUsuariosDto) {
    return this.usuariosService.listar(filtros);
  }

  @Post()
  @UseGuards(AdminGuard)
  @UseInterceptors(FileInterceptor('imagen'))
  crear(
    @Body(NormalizarTextoPipe) { perfil, ...datos }: AltaUsuarioDto,
    @UploadedFile(validarImagenOpcional()) imagen?: Express.Multer.File,
  ) {
    return this.usuariosService.crear(datos, perfil, imagen);
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  deshabilitar(
    @Param('id', ParseObjectIdPipe) id: Types.ObjectId,
    @UsuarioActual() usuario: PayloadToken,
  ) {
    return this.usuariosService.deshabilitar(id, usuario);
  }

  @Post(':id/alta')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AdminGuard)
  habilitar(@Param('id', ParseObjectIdPipe) id: Types.ObjectId) {
    return this.usuariosService.habilitar(id);
  }
}
