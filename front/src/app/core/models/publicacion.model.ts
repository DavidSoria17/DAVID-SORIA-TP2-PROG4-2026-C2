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

/**
 * Último cambio hecho a una publicación desde cualquier pantalla. Las
 * pantallas que quedan guardadas mientras se usa otra (el listado de
 * Tweeter) lo siguen para no mostrar datos viejos.
 */
export interface CambioPublicacion {
  tipo: 'creada' | 'actualizada' | 'eliminada';
  publicacion: Publicacion;
}

export interface DatosPublicacion {
  titulo: string;
  mensaje: string;
  imagen: File | null;
}
