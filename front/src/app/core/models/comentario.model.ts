import { AutorResumen } from './publicacion.model';

export interface Comentario {
  _id: string;
  publicacion: string;
  autor: AutorResumen;
  mensaje: string;
  /** Si se editó después de publicarlo. */
  modificado: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PaginaComentarios {
  comentarios: Comentario[];
  /** Si quedan comentarios más viejos para pedir. */
  hayMas: boolean;
}
