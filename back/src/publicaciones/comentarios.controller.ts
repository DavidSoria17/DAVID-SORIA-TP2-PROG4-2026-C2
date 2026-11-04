import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { Types } from 'mongoose';
import { TokenGuard } from '../common/guards/token.guard.js';
import { ParseObjectIdPipe } from '../common/pipes/parse-object-id.pipe.js';
import { ComentariosService } from './comentarios.service.js';
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
}
