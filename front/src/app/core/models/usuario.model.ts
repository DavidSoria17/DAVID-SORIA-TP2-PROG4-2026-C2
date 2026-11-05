export type Perfil = 'usuario' | 'administrador';

export interface Usuario {
  _id: string;
  nombre: string;
  apellido: string;
  correo: string;
  nombreUsuario: string;
  /** ISO a las 00:00 UTC; se muestra en UTC para no correr el día. */
  fechaNacimiento: string;
  descripcion: string;
  urlImagen?: string;
  perfil: Perfil;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RespuestaAuth {
  usuario: Usuario;
  token: string;
}

/** Respuesta de `POST /auth/refrescar`. */
export interface TokenRefrescado {
  token: string;
}

export interface DatosLogin {
  /** Correo o nombre de usuario. */
  usuario: string;
  contrasena: string;
}

export interface DatosRegistro {
  nombre: string;
  apellido: string;
  correo: string;
  nombreUsuario: string;
  contrasena: string;
  /** AAAA-MM-DD, el formato que espera la API. */
  fechaNacimiento: string;
  descripcion: string;
  imagen: File | null;
}
