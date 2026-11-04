import {
  Body,
  Controller,
  Delete,
  Get,
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
import { TokenGuard } from '../common/guards/token.guard.js';
import type { PayloadToken } from '../common/interfaces/payload-token.interface.js';
import { validarImagenOpcional } from '../common/pipes/imagen-opcional.pipe.js';
import { ParseObjectIdPipe } from '../common/pipes/parse-object-id.pipe.js';
import {
  type OrdenPublicaciones,
  ParseOrdenPipe,
} from '../common/pipes/parse-orden.pipe.js';
import { CrearPublicacionDto } from './dto/crear-publicacion.dto.js';
import { ListarPublicacionesDto } from './dto/listar-publicaciones.dto.js';
import { PublicacionesService } from './publicaciones.service.js';

@Controller('publicaciones')
@UseGuards(TokenGuard)
export class PublicacionesController {
  constructor(private readonly publicacionesService: PublicacionesService) {}

  @Get()
  listar(
    @Query('orden', ParseOrdenPipe) orden: OrdenPublicaciones,
    @Query() filtros: ListarPublicacionesDto,
    @UsuarioActual() usuario: PayloadToken,
  ) {
    return this.publicacionesService.listar(orden, filtros, usuario.sub);
  }

  @Post()
  @UseInterceptors(FileInterceptor('imagen'))
  crear(
    @Body() datos: CrearPublicacionDto,
    @UploadedFile(validarImagenOpcional())
    imagen: Express.Multer.File | undefined,
    @UsuarioActual() usuario: PayloadToken,
  ) {
    return this.publicacionesService.crear(datos, imagen, usuario);
  }

  @Delete(':id')
  darDeBaja(
    @Param('id', ParseObjectIdPipe) id: Types.ObjectId,
    @UsuarioActual() usuario: PayloadToken,
  ) {
    return this.publicacionesService.darDeBaja(id, usuario);
  }

  @Post(':id/me-gusta')
  darMeGusta(
    @Param('id', ParseObjectIdPipe) id: Types.ObjectId,
    @UsuarioActual() usuario: PayloadToken,
  ) {
    return this.publicacionesService.darMeGusta(id, usuario.sub);
  }

  @Delete(':id/me-gusta')
  quitarMeGusta(
    @Param('id', ParseObjectIdPipe) id: Types.ObjectId,
    @UsuarioActual() usuario: PayloadToken,
  ) {
    return this.publicacionesService.quitarMeGusta(id, usuario.sub);
  }
}
