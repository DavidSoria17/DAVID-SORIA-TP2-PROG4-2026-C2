import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ImagenesModule } from '../imagenes/imagenes.module.js';
import { UsuariosModule } from '../usuarios/usuarios.module.js';
import { ComentariosController } from './comentarios.controller.js';
import { ComentariosService } from './comentarios.service.js';
import { Comentario, ComentarioSchema } from './entities/comentario.entity.js';
import { MeGusta, MeGustaSchema } from './entities/me-gusta.entity.js';
import {
  Publicacion,
  PublicacionSchema,
} from './entities/publicacion.entity.js';
import { PublicacionesController } from './publicaciones.controller.js';
import { PublicacionesService } from './publicaciones.service.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Publicacion.name, schema: PublicacionSchema },
      { name: MeGusta.name, schema: MeGustaSchema },
      { name: Comentario.name, schema: ComentarioSchema },
    ]),
    UsuariosModule,
    ImagenesModule,
  ],
  controllers: [PublicacionesController, ComentariosController],
  providers: [PublicacionesService, ComentariosService],
})
export class PublicacionesModule {}
