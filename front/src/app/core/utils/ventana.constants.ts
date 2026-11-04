import { BordeVentana } from '../models/interfaz.model';

/** Tamaño mínimo al redimensionar. El máximo es el área del escritorio. */
export const ANCHO_MINIMO_VENTANA = 320;
export const ALTO_MINIMO_VENTANA = 200;

/** Parte de la ventana que siempre queda dentro del escritorio para poder volver a agarrarla. */
export const MARGEN_VISIBLE_VENTANA = 80;

/** Distancia al borde superior del escritorio cuando la ventana se abre por primera vez. */
export const MARGEN_SUPERIOR_VENTANA = 24;

export const BORDES_VENTANA: readonly BordeVentana[] = [
  { clase: 'arriba', x: 0, y: -1 },
  { clase: 'abajo', x: 0, y: 1 },
  { clase: 'izquierda', x: -1, y: 0 },
  { clase: 'derecha', x: 1, y: 0 },
  { clase: 'arriba-izquierda', x: -1, y: -1 },
  { clase: 'arriba-derecha', x: 1, y: -1 },
  { clase: 'abajo-izquierda', x: -1, y: 1 },
  { clase: 'abajo-derecha', x: 1, y: 1 },
];
