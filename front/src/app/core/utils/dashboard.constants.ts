import { LapsoRapido } from '../models/estadistica.model';
import { PestanaVentana } from '../models/interfaz.model';

export const USUARIOS_POR_PAGINA = 10;

/** Secciones del dashboard, cada una con su ruta dentro de la misma ventana. */
export const PESTANAS_DASHBOARD: readonly PestanaVentana[] = [
  { etiqueta: 'Usuarios', ruta: '/dashboard/usuarios', icono: 'usuarios' },
  { etiqueta: 'Estadísticas', ruta: '/dashboard/estadisticas', icono: 'graficoBarras' },
];

export const LAPSOS_RAPIDOS: readonly { lapso: LapsoRapido; etiqueta: string }[] = [
  { lapso: '7-dias', etiqueta: '7 días' },
  { lapso: '30-dias', etiqueta: '30 días' },
  { lapso: '3-meses', etiqueta: '3 meses' },
  { lapso: 'este-anio', etiqueta: 'Este año' },
];

/** Lapso con el que abre la pantalla de estadísticas. */
export const LAPSO_INICIAL: LapsoRapido = '30-dias';

/** Publicaciones con nombre propio en la torta; las demás se juntan en «Otras». */
export const PUBLICACIONES_EN_TORTA = 4;

/** Colores de las porciones de la torta, en orden, y el de «Otras». */
export const COLORES_TORTA = [
  '--color-grafico-1',
  '--color-grafico-2',
  '--color-grafico-3',
  '--color-grafico-4',
] as const;
export const COLOR_OTRAS = '--color-grafico-otros';
