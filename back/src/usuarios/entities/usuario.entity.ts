import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export const PERFILES = ['usuario', 'administrador'] as const;
export type Perfil = (typeof PERFILES)[number];

@Schema({
  collection: 'usuarios',
  timestamps: true,
  versionKey: false,
  // La contraseña nunca sale en una respuesta, aunque el documento se haya
  // cargado con ella para validar el login.
  toJSON: {
    transform: (_documento, usuario) => {
      Reflect.deleteProperty(usuario, 'contrasena');
      return usuario;
    },
  },
})
export class Usuario {
  @Prop({ required: true, trim: true, maxlength: 50 })
  nombre: string;

  @Prop({ required: true, trim: true, maxlength: 50 })
  apellido: string;

  @Prop({ required: true, trim: true, lowercase: true, unique: true })
  correo: string;

  @Prop({
    required: true,
    trim: true,
    lowercase: true,
    unique: true,
    match: /^[a-z0-9._]{3,20}$/,
  })
  nombreUsuario: string;

  @Prop({ required: true, select: false })
  contrasena: string;

  @Prop({ required: true })
  fechaNacimiento: Date;

  @Prop({ trim: true, maxlength: 200, default: '' })
  descripcion: string;

  @Prop()
  urlImagen?: string;

  @Prop({ enum: PERFILES, default: 'usuario' })
  perfil: Perfil;

  @Prop({ default: true })
  activo: boolean;
}

export type UsuarioDocument = HydratedDocument<Usuario>;
export const UsuarioSchema = SchemaFactory.createForClass(Usuario);
