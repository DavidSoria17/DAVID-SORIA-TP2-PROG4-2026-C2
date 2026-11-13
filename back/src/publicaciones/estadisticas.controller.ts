import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AdminGuard } from '../common/guards/admin.guard.js';
import { TokenGuard } from '../common/guards/token.guard.js';
import { ComentariosPorPublicacionDto } from './dto/comentarios-por-publicacion.dto.js';
import { RangoFechasDto } from './dto/rango-fechas.dto.js';
import { EstadisticasService } from './estadisticas.service.js';

@Controller('estadisticas')
@UseGuards(TokenGuard, AdminGuard)
export class EstadisticasController {
  constructor(private readonly estadisticasService: EstadisticasService) {}

  @Get('publicaciones-por-usuario')
  publicacionesPorUsuario(@Query() rango: RangoFechasDto) {
    return this.estadisticasService.publicacionesPorUsuario(rango);
  }

  @Get('comentarios-por-dia')
  comentariosPorDia(@Query() rango: RangoFechasDto) {
    return this.estadisticasService.comentariosPorDia(rango);
  }

  @Get('comentarios-por-publicacion')
  comentariosPorPublicacion(@Query() filtros: ComentariosPorPublicacionDto) {
    return this.estadisticasService.comentariosPorPublicacion(filtros);
  }
}
