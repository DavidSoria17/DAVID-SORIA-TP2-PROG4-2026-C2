import { DetachedRouteHandle } from '@angular/router';
import { NombreIcono, NombreIconoApp } from './icono.model';

/** Con qué sesión aparece una app en el escritorio. */
export type AccesoApp = 'siempre' | 'sin-sesion' | 'con-sesion' | 'administrador';

/** Aplicación con ícono en el escritorio; abrirla navega a su ruta. */
export interface AppEscritorio {
  id: string;
  etiqueta: string;
  /** Nombre de archivo con el que aparece en su menú y en el registro del Reboot. */
  archivo: string;
  ruta: string;
  icono: NombreIconoApp;
  acceso: AccesoApp;
  /**
   * Casillero lógico que ocupa en la grilla. Dos apps que nunca se ven juntas
   * (Iniciar sesión y Cerrar sesión) comparten lugar: una aparece donde estaba la otra.
   */
  lugar: string;
  /** La papelera recibe lo que se suelta encima y no se puede tirar. */
  esPapelera?: boolean;
}

/** Dónde quedó una app que se sacó del escritorio. Las que no figuran están instaladas. */
export type EstadoAppQuitada = 'papelera' | 'eliminada';

/** App fuera del escritorio, con el momento en que se tiró (milisegundos desde 1970). */
export interface AppQuitada {
  estado: EstadoAppQuitada;
  fecha: number;
}

/** App de la papelera lista para mostrar. */
export interface AppEnPapelera {
  app: AppEscritorio;
  borrada: Date;
}

/** Opción de un menú desplegable (menú contextual de un ícono, menú Start). */
export interface OpcionMenu {
  id: string;
  etiqueta: string;
  icono?: NombreIcono;
  /** Tecla que hace lo mismo, a la derecha (menú contextual). */
  atajo?: string;
  /** Línea que la separa de la opción anterior. */
  separada?: boolean;
  /** Acción destructiva: se resalta con el color de peligro. */
  peligro?: boolean;
}

export interface Posicion {
  x: number;
  y: number;
}

export interface Tamano {
  ancho: number;
  alto: number;
}

/** Casillero de la grilla de íconos del escritorio. */
export interface Celda {
  columna: number;
  fila: number;
}

/** Cantidad de casilleros que entran en el escritorio. */
export interface Grilla {
  columnas: number;
  filas: number;
}

/** Lo que necesita `ubicarIconos` de cada ícono para elegirle un casillero. */
export interface PedidoUbicacion {
  id: string;
  /** Donde lo dejó el usuario, aunque hoy no entre en la grilla. */
  preferida: Celda | null;
  /** Donde va la primera vez que aparece. */
  inicial: Celda;
}

/**
 * Ícono del escritorio con el casillero que ocupa. Nunca hay dos en el mismo.
 * En celular la grilla es fija y la celda es `null`.
 */
export interface IconoUbicado {
  app: AppEscritorio;
  celda: Celda | null;
}

/** Datos de la ventana de cada pantalla, definidos en `data.ventana` de la ruta. */
export interface ConfigVentana {
  titulo: string;
  /** Ancho en escritorio, como valor CSS. */
  ancho: string;
  estado?: readonly string[];
  /**
   * La pantalla arma sus propias secciones del marco (barra de comandos,
   * cuerpo y barra de estado) en vez de ir dentro de un único cuerpo.
   */
  secciones?: boolean;
}

/** App abierta: aparece en la barra de tareas aunque su ventana no esté a la vista. */
export interface VentanaAbierta {
  /** Ruta de la app, que identifica a la ventana. */
  ruta: string;
  config: ConfigVentana;
  /** Última dirección que mostró: puede ser una pantalla interna de la app (`/publicaciones/nueva`). */
  url: string;
}

/** Pantalla de una app abierta que se guardó al pasar a otra, con la dirección en la que estaba. */
export interface PantallaGuardada {
  pantalla: DetachedRouteHandle;
  /** Dirección con sus parámetros: `/publicaciones/:id` guarda el detalle de una sola publicación. */
  url: string;
}

/** Lugar, tamaño y estado de una ventana; se recuerda por app mientras está abierta. */
export interface DisposicionVentana {
  /** `null` hasta que se ubica por primera vez (centrada). */
  posicion: Posicion | null;
  /** `null` mientras conserve el tamaño de su contenido. */
  tamano: Tamano | null;
  maximizada: boolean;
}

/** Borde o esquina desde el que se cambia el tamaño: -1 izquierda/arriba, 1 derecha/abajo, 0 no cambia. */
export interface BordeVentana {
  clase: string;
  x: -1 | 0 | 1;
  y: -1 | 0 | 1;
}

/** Desplazamiento de un arrastre desde el punto donde empezó. */
export interface FinArrastre extends Posicion {
  /** Si se soltó encima de un elemento marcado con `data-papelera`. */
  sobrePapelera: boolean;
}

export type TipoAviso = 'info' | 'exito' | 'alerta' | 'peligro';

export interface Notificacion {
  id: number;
  tipo: TipoAviso;
  titulo: string;
  texto?: string;
}

/** Línea del registro de la pantalla de arranque. */
export interface LineaArranque {
  texto: string;
  lista: boolean;
}

export interface RequisitoContrasena {
  descripcion: string;
  cumple: (contrasena: string) => boolean;
}

export type TamanoAvatar = 'chico' | 'normal' | 'grande' | 'xl';

/** Qué se está por eliminar definitivamente de la papelera: la app elegida o todas. */
export type EliminacionPapelera = 'seleccionada' | 'todas';
