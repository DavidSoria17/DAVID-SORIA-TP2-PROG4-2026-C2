/** Copia de los datos del autor que viaja con cada publicación y comentario. */
export interface AutorResumen {
  _id: string;
  nombreUsuario: string;
  urlImagen?: string;
}

export interface Publicacion {
  _id: string;
  titulo: string;
  mensaje: string;
  urlImagen?: string;
  autor: AutorResumen;
  cantidadMeGusta: number;
  cantidadComentarios: number;
  /** Si quien pidió el listado ya le dio me gusta. */
  meGustaPropio: boolean;
  createdAt: string;
  updatedAt: string;
}

export type OrdenPublicaciones = 'fecha' | 'meGusta';

export interface FiltrosPublicaciones {
  orden: OrdenPublicaciones;
  offset: number;
  limit: number;
  /** Id del autor, para ver solo sus publicaciones. */
  usuario?: string;
}

export interface PaginaPublicaciones {
  publicaciones: Publicacion[];
  /** Cantidad total que cumple el filtro. */
  total: number;
}

export interface EstadoMeGusta {
  cantidadMeGusta: number;
  meGustaPropio: boolean;
}

export interface DatosPublicacion {
  titulo: string;
  mensaje: string;
  imagen: File | null;
}
