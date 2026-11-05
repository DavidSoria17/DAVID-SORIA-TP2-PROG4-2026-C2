import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { UsuarioActual } from '../common/decorators/usuario-actual.decorator.js';
import { TokenGuard } from '../common/guards/token.guard.js';
import type { PayloadToken } from '../common/interfaces/payload-token.interface.js';
import { ParseObjectIdPipe } from '../common/pipes/parse-object-id.pipe.js';
import { ComentariosService } from './comentarios.service.js';
import { GuardarComentarioDto } from './dto/guardar-comentario.dto.js';
import { ListarComentariosDto } from './dto/listar-comentarios.dto.js';

@Controller('publicaciones/:id/comentarios')
@UseGuards(TokenGuard)
export class ComentariosController {
  constructor(private readonly comentariosService: ComentariosService) {}

  @Get()
  listar(
    @Param('id', ParseObjectIdPipe) id: Types.ObjectId,
    @Query() filtros: ListarComentariosDto,
  ) {
    return this.comentariosService.listar(id, filtros);
  }

  @Post()
  crear(
    @Param('id', ParseObjectIdPipe) id: Types.ObjectId,
    @Body() datos: GuardarComentarioDto,
    @UsuarioActual() usuario: PayloadToken,
  ) {
    return this.comentariosService.crear(id, datos, usuario);
  }

  @Put(':idComentario')
  editar(
    @Param('id', ParseObjectIdPipe) id: Types.ObjectId,
    @Param('idComentario', ParseObjectIdPipe) idComentario: Types.ObjectId,
    @Body() datos: GuardarComentarioDto,
    @UsuarioActual() usuario: PayloadToken,
  ) {
    return this.comentariosService.editar(id, idComentario, datos, usuario);
  }
}
