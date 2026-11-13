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

/** Alta hecha por un administrador: los datos del registro y el perfil elegido. */
export interface DatosAltaUsuario extends DatosRegistro {
  perfil: Perfil;
}

/** Usuario del listado de administración, con cuántas publicaciones activas tiene. */
export interface UsuarioListado extends Usuario {
  cantidadPublicaciones: number;
}

/** Filtro del listado de administración; sin valor, todos. */
export type EstadoUsuarios = 'habilitados' | 'deshabilitados';

export interface FiltrosUsuarios {
  estado: EstadoUsuarios | null;
  offset: number;
  limit: number;
}

export interface PaginaUsuarios {
  usuarios: UsuarioListado[];
  /** Cantidad que cumple el filtro. */
  total: number;
  /** Cuántos hay de cada estado, sin importar el filtro. */
  cantidades: { todos: number; habilitados: number; deshabilitados: number };
}
