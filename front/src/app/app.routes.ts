import { Routes } from '@angular/router';
import { appInstaladaGuard } from './core/guards/app-instalada.guard';
import { cargaInicialGuard } from './core/guards/carga-inicial.guard';
import { ConfigVentana } from './core/models/interfaz.model';
import { EscritorioLayout } from './layouts/escritorio-layout/escritorio-layout';

/** Datos de la ventana en la que se abre una pantalla. */
const ventana = (config: ConfigVentana) => ({ ventana: config });

/** Las pantallas de Tweeter comparten la ventana de la app. */
const VENTANA_TWEETER: ConfigVentana = { titulo: 'tweeter', ancho: '620px' };

export const routes: Routes = [
  // Pantalla de arranque: valida el token guardado y lleva a Tweeter o al login.
  {
    path: 'cargando',
    title: 'Windose 20',
    loadComponent: () => import('./features/cargando/cargando').then((modulo) => modulo.Cargando),
  },
  {
    path: '',
    component: EscritorioLayout,
    canActivate: [cargaInicialGuard],
    canActivateChild: [appInstaladaGuard],
    children: [
      // Escritorio sin ventanas abiertas.
      { path: '', pathMatch: 'full', title: 'Windose 20', children: [] },
      {
        path: 'login',
        title: 'Iniciar sesión · Windose 20',
        data: ventana({
          titulo: 'iniciar_sesion.exe',
          ancho: '400px',
          estado: ['Windose 20', 'conexión segura'],
        }),
        loadComponent: () => import('./features/auth/login/login').then((modulo) => modulo.Login),
      },
      {
        path: 'registro',
        title: 'Crear cuenta · Windose 20',
        data: ventana({
          titulo: 'nueva_cuenta.exe',
          ancho: '780px',
          estado: ['Paso 1 de 1', 'campos obligatorios salvo indicación'],
        }),
        loadComponent: () =>
          import('./features/auth/registro/registro').then((modulo) => modulo.Registro),
      },
      {
        path: 'cerrar-sesion',
        title: 'Cerrar sesión · Windose 20',
        data: ventana({ titulo: 'cerrar_sesion.exe', ancho: '400px' }),
        loadComponent: () =>
          import('./features/auth/cerrar-sesion/cerrar-sesion').then(
            (modulo) => modulo.CerrarSesion,
          ),
      },
      {
        path: 'publicaciones',
        title: 'Tweeter · Windose 20',
        data: ventana(VENTANA_TWEETER),
        loadComponent: () =>
          import('./features/publicaciones/listado/listado').then((modulo) => modulo.Listado),
      },
      {
        path: 'publicaciones/nueva',
        title: 'Nueva publicación · Tweeter · Windose 20',
        data: ventana(VENTANA_TWEETER),
        loadComponent: () =>
          import('./features/publicaciones/nueva-publicacion/nueva-publicacion').then(
            (modulo) => modulo.NuevaPublicacion,
          ),
      },
      {
        path: 'publicaciones/:id',
        title: 'Publicación · Tweeter · Windose 20',
        data: ventana(VENTANA_TWEETER),
        loadComponent: () =>
          import('./features/publicaciones/detalle/detalle').then((modulo) => modulo.Detalle),
      },
      {
        path: 'perfil',
        title: 'Mi perfil · Windose 20',
        data: ventana({ titulo: 'mi_perfil', ancho: '860px' }),
        loadComponent: () =>
          import('./features/perfil/mi-perfil/mi-perfil').then((modulo) => modulo.MiPerfil),
      },
      {
        path: 'dashboard',
        title: 'Dashboard · Windose 20',
        data: ventana({ titulo: 'dashboard', ancho: '560px' }),
        loadComponent: () =>
          import('./features/dashboard/inicio/inicio').then((modulo) => modulo.Inicio),
      },
      {
        path: 'leeme',
        title: 'léeme.txt · Windose 20',
        data: ventana({ titulo: 'léeme.txt', ancho: '380px' }),
        loadComponent: () =>
          import('./features/escritorio/leeme/leeme').then((modulo) => modulo.Leeme),
      },
      {
        path: 'papelera',
        title: 'Papelera · Windose 20',
        data: ventana({ titulo: 'papelera', ancho: '720px', secciones: true }),
        loadComponent: () =>
          import('./features/escritorio/papelera/papelera').then((modulo) => modulo.Papelera),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
