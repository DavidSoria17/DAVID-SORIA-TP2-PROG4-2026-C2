import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ImagenesModule } from '../imagenes/imagenes.module.js';
import {
  Comentario,
  ComentarioSchema,
} from '../publicaciones/entities/comentario.entity.js';
import {
  Publicacion,
  PublicacionSchema,
} from '../publicaciones/entities/publicacion.entity.js';
import { Usuario, UsuarioSchema } from './entities/usuario.entity.js';
import { UsuariosController } from './usuarios.controller.js';
import { UsuariosService } from './usuarios.service.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Usuario.name, schema: UsuarioSchema },
      // Para actualizar la copia del autor cuando cambia la foto de perfil.
      { name: Publicacion.name, schema: PublicacionSchema },
      { name: Comentario.name, schema: ComentarioSchema },
    ]),
    ImagenesModule,
  ],
  controllers: [UsuariosController],
  providers: [UsuariosService],
  exports: [UsuariosService],
})
export class UsuariosModule {}
