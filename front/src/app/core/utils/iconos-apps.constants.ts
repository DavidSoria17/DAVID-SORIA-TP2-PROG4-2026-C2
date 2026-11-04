import { Tamano } from '../models/interfaz.model';

/**
 * Íconos PNG de las apps (`public/iconos/apps/`) con su tamaño nativo. Cada
 * uno tiene también una versión `@2x` con el doble de píxeles.
 */
export const ICONOS_APPS = {
  'iniciar-sesion': { ancho: 32, alto: 30 },
  'crear-cuenta': { ancho: 30, alto: 28 },
  tweeter: { ancho: 29, alto: 26 },
  'mi-perfil': { ancho: 32, alto: 27 },
  dashboard: { ancho: 32, alto: 32 },
  'cerrar-sesion': { ancho: 31, alto: 29 },
  leeme: { ancho: 24, alto: 30 },
  papelera: { ancho: 26, alto: 28 },
} satisfies Record<string, Tamano>;
