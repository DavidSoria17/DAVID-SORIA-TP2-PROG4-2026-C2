import { AppEscritorio } from '../models/interfaz.model';

/** Lado de la celda de la grilla en la que se acomodan los íconos del escritorio. */
export const CELDA_ICONO = 120;

/**
 * Todas las apps del escritorio. El orden es el de la grilla fija del celular;
 * cuáles se ven depende de la sesión (`acceso`) y de la papelera.
 */
export const APPS_ESCRITORIO: readonly AppEscritorio[] = [
  {
    id: 'iniciar-sesion',
    etiqueta: 'Iniciar sesión',
    archivo: 'iniciar_sesion.app',
    ruta: '/login',
    icono: 'iniciar-sesion',
    acceso: 'sin-sesion',
    lugar: 'sesion',
  },
  {
    id: 'crear-cuenta',
    etiqueta: 'Crear cuenta',
    archivo: 'crear_cuenta.app',
    ruta: '/registro',
    icono: 'crear-cuenta',
    acceso: 'sin-sesion',
    lugar: 'cuenta',
  },
  {
    id: 'publicaciones',
    etiqueta: 'Tweeter',
    archivo: 'tweeter.app',
    ruta: '/publicaciones',
    icono: 'tweeter',
    acceso: 'con-sesion',
    lugar: 'publicaciones',
  },
  {
    id: 'mi-perfil',
    etiqueta: 'Mi perfil',
    archivo: 'mi_perfil.app',
    ruta: '/perfil',
    icono: 'mi-perfil',
    acceso: 'con-sesion',
    lugar: 'cuenta',
  },
  {
    id: 'dashboard',
    etiqueta: 'Dashboard',
    archivo: 'dashboard.app',
    ruta: '/dashboard',
    icono: 'dashboard',
    acceso: 'administrador',
    lugar: 'dashboard',
  },
  {
    id: 'cerrar-sesion',
    etiqueta: 'Cerrar sesión',
    archivo: 'cerrar_sesion.app',
    ruta: '/cerrar-sesion',
    icono: 'cerrar-sesion',
    acceso: 'con-sesion',
    lugar: 'sesion',
  },
  {
    id: 'leeme',
    etiqueta: 'léeme.txt',
    archivo: 'léeme.txt',
    ruta: '/leeme',
    icono: 'leeme',
    acceso: 'siempre',
    lugar: 'leeme',
  },
  {
    id: 'papelera',
    etiqueta: 'Papelera',
    archivo: 'papelera',
    ruta: '/papelera',
    icono: 'papelera',
    acceso: 'siempre',
    lugar: 'papelera',
    esPapelera: true,
  },
];

/**
 * Orden en que se ocupan los casilleros la primera vez que aparece cada lugar
 * (columna por columna, de arriba hacia abajo). Los lugares que usan las dos
 * sesiones van primero para que ni con ni sin sesión queden huecos.
 */
export const ORDEN_INICIAL_LUGARES: readonly string[] = [
  'sesion',
  'cuenta',
  'leeme',
  'papelera',
  'publicaciones',
  'dashboard',
];
