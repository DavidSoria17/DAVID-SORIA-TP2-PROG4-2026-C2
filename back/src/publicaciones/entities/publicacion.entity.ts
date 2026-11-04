import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { AutorResumen, AutorResumenSchema } from './autor-resumen.entity.js';

@Schema({ collection: 'publicaciones', timestamps: true, versionKey: false })
export class Publicacion {
  @Prop({ required: true, trim: true, minlength: 1, maxlength: 100 })
  titulo: string;

  @Prop({ required: true, trim: true, minlength: 1, maxlength: 2000 })
  mensaje: string;

  @Prop()
  urlImagen?: string;

  @Prop({ type: AutorResumenSchema, required: true })
  autor: AutorResumen;

  @Prop({ default: 0, min: 0 })
  cantidadMeGusta: number;

  @Prop({ default: 0, min: 0 })
  cantidadComentarios: number;

  @Prop({ default: true })
  activa: boolean;
}

export type PublicacionDocument = HydratedDocument<Publicacion>;
export const PublicacionSchema = SchemaFactory.createForClass(Publicacion);

// Listado por fecha y rango de fechas de las estadísticas.
PublicacionSchema.index({ createdAt: -1, _id: -1 });
// Listado por cantidad de me gusta.
PublicacionSchema.index({ cantidadMeGusta: -1, _id: -1 });
// Publicaciones de un usuario y actualización de la copia del autor.
PublicacionSchema.index({ 'autor._id': 1, createdAt: -1, _id: -1 });
