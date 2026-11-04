import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { AutorResumen, AutorResumenSchema } from './autor-resumen.entity.js';
import { Publicacion } from './publicacion.entity.js';

/**
 * Comentario de una publicación. No tiene baja propia: solo se accede a través
 * de una publicación activa.
 */
@Schema({ collection: 'comentarios', timestamps: true, versionKey: false })
export class Comentario {
  @Prop({ type: Types.ObjectId, ref: Publicacion.name, required: true })
  publicacion: Types.ObjectId;

  @Prop({ type: AutorResumenSchema, required: true })
  autor: AutorResumen;

  @Prop({ required: true, trim: true, minlength: 1, maxlength: 500 })
  mensaje: string;

  @Prop({ default: false })
  modificado: boolean;
}

export type ComentarioDocument = HydratedDocument<Comentario>;
export const ComentarioSchema = SchemaFactory.createForClass(Comentario);

// Comentarios de una publicación, del más reciente al más viejo, con cursor.
ComentarioSchema.index({ publicacion: 1, _id: -1 });
