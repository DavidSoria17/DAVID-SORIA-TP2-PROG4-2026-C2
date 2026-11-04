import { Controller, Get, UseGuards } from '@nestjs/common';
import { UsuarioActual } from '../common/decorators/usuario-actual.decorator.js';
import { TokenGuard } from '../common/guards/token.guard.js';
import type { PayloadToken } from '../common/interfaces/payload-token.interface.js';
import { UsuariosService } from './usuarios.service.js';

@Controller('usuarios')
@UseGuards(TokenGuard)
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Get('perfil')
  perfil(@UsuarioActual() usuario: PayloadToken) {
    return this.usuariosService.buscarActivo(usuario.sub);
  }
}
