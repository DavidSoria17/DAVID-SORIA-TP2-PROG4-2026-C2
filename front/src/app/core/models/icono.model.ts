import { ICONOS_APPS } from '../utils/iconos-apps.constants';
import { ICONOS } from '../utils/iconos.constants';

export interface TrazoIcono {
  /** Variable de color de los tokens; sin color se usa `currentColor`. */
  color?: string;
  d: string;
}

export interface IconoPixel {
  ancho: number;
  alto: number;
  trazos: TrazoIcono[];
}

export type NombreIcono = keyof typeof ICONOS;

/** Ícono PNG de una app, en `public/iconos/apps/`. */
export type NombreIconoApp = keyof typeof ICONOS_APPS;
