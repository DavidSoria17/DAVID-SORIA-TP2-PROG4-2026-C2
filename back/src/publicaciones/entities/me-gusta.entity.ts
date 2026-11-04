import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Usuario } from '../../usuarios/entities/usuario.entity.js';
import { Publicacion } from './publicacion.entity.js';

/**
 * Un me gusta de un usuario a una publicación. Va en su propia colección (y no
 * como array dentro de la publicación) para que no crezca sin límite.
 */
@Schema({
  collection: 'megustas',
  timestamps: { createdAt: true, updatedAt: false },
  versionKey: false,
})
export class MeGusta {
  @Prop({ type: Types.ObjectId, ref: Publicacion.name, required: true })
  publicacion: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: Usuario.name, required: true })
  usuario: Types.ObjectId;
}

export type MeGustaDocument = HydratedDocument<MeGusta>;
export const MeGustaSchema = SchemaFactory.createForClass(MeGusta);

// Un solo me gusta por usuario y publicación. También sirve para buscar los
// me gusta propios de una página del listado.
MeGustaSchema.index({ publicacion: 1, usuario: 1 }, { unique: true });
