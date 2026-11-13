/** Lapso de las estadísticas: días AAAA-MM-DD, los dos incluidos. */
export interface RangoFechas {
  desde: string;
  hasta: string;
}

/** Atajo del filtro de lapso que termina hoy. */
export type LapsoRapido = '7-dias' | '30-dias' | '3-meses' | 'este-anio';

export interface PublicacionesPorUsuario {
  _id: string;
  nombreUsuario: string;
  cantidad: number;
}

export interface ComentariosPorDia {
  /** Día AAAA-MM-DD en la hora de Argentina. */
  fecha: string;
  cantidad: number;
}

export interface ComentariosPorPublicacion {
  _id: string;
  titulo: string;
  cantidad: number;
}

/** Todo lo que muestra la pantalla de estadísticas para un lapso. */
export interface ResumenEstadisticas {
  publicacionesPorUsuario: PublicacionesPorUsuario[];
  comentariosPorDia: ComentariosPorDia[];
  comentariosPorPublicacion: ComentariosPorPublicacion[];
  /** Totales del lapso del mismo largo inmediatamente anterior, para comparar. */
  anterior: { publicaciones: number; comentarios: number };
  /** Cuentas registradas, habilitadas o no. */
  usuariosRegistrados: number;
}

/** Dato de un gráfico de una sola serie: barras, torta o líneas. */
export interface DatoGrafico {
  etiqueta: string;
  valor: number;
  /** Etiqueta para el eje, si la completa no entra (`13/10` en vez de `13/10/2026`). */
  etiquetaCorta?: string;
}

/** Porción de la torta con el color que la identifica en la leyenda. */
export interface PorcionTorta extends DatoGrafico {
  /** Variable de color de los tokens (`--color-grafico-1`). */
  color: string;
  /** Recuadros de 1 px que la dibujan, como `d` de un `<path>`. */
  trazo: string;
  porcentaje: number;
}
