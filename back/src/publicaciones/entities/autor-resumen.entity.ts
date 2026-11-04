import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { Usuario } from '../../usuarios/entities/usuario.entity.js';

/**
 * Copia de los datos del autor que muestra cada tarjeta, para listar sin
 * consultar `usuarios`. `_id` es el del usuario; `nombreUsuario` no cambia
 * nunca y `urlImagen` se actualiza cuando el usuario cambia su foto.
 */
@Schema({ _id: false, versionKey: false })
export class AutorResumen {
  @Prop({ type: Types.ObjectId, ref: Usuario.name, required: true })
  _id: Types.ObjectId;

  @Prop({ required: true })
  nombreUsuario: string;

  @Prop()
  urlImagen?: string;
}

export const AutorResumenSchema = SchemaFactory.createForClass(AutorResumen);
