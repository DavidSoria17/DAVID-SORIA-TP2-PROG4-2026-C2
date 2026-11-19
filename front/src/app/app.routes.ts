import { Routes } from '@angular/router';
import { adminGuard } from './core/guards/admin.guard';
import { appInstaladaGuard } from './core/guards/app-instalada.guard';
import { authGuard } from './core/guards/auth.guard';
import { cargaInicialGuard } from './core/guards/carga-inicial.guard';
import { ConfigVentana } from './core/models/interfaz.model';
import { EscritorioLayout } from './layouts/escritorio-layout/escritorio-layout';

/** Datos de la ventana en la que se abre una pantalla. */
const ventana = (config: ConfigVentana) => ({ ventana: config });

/** Las pantallas de Tweeter comparten la ventana de la app. */
const VENTANA_TWEETER: ConfigVentana = { titulo: 'tweeter', ancho: '620px' };

/** Las pantallas de Mi perfil comparten la ventana de la app. */
const VENTANA_PERFIL: ConfigVentana = { titulo: 'mi_perfil', ancho: '860px' };

/** Las pantallas del dashboard comparten la ventana; cada una suma su sección al título. */
const VENTANA_DASHBOARD = { titulo: 'dashboard.exe', ancho: '1000px' };

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
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/auth/cerrar-sesion/cerrar-sesion').then(
            (modulo) => modulo.CerrarSesion,
          ),
      },
      {
        path: 'publicaciones',
        title: 'Tweeter · Windose 20',
        data: ventana(VENTANA_TWEETER),
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/publicaciones/listado/listado').then((modulo) => modulo.Listado),
      },
      {
        path: 'publicaciones/nueva',
        title: 'Nueva publicación · Tweeter · Windose 20',
        data: ventana(VENTANA_TWEETER),
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/publicaciones/nueva-publicacion/nueva-publicacion').then(
            (modulo) => modulo.NuevaPublicacion,
          ),
      },
      {
        path: 'publicaciones/:id',
        title: 'Publicación · Tweeter · Windose 20',
        data: ventana(VENTANA_TWEETER),
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/publicaciones/detalle/detalle').then((modulo) => modulo.Detalle),
      },
      {
        path: 'perfil',
        title: 'Mi perfil · Windose 20',
        data: ventana(VENTANA_PERFIL),
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/perfil/mi-perfil/mi-perfil').then((modulo) => modulo.MiPerfil),
      },
      {
        path: 'perfil/editar',
        title: 'Editar perfil · Mi perfil · Windose 20',
        data: ventana(VENTANA_PERFIL),
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/perfil/editar-perfil/editar-perfil').then(
            (modulo) => modulo.EditarPerfil,
          ),
      },
      { path: 'dashboard', pathMatch: 'full', redirectTo: 'dashboard/usuarios' },
      {
        path: 'dashboard/usuarios',
        title: 'Usuarios · Dashboard · Windose 20',
        canActivate: [authGuard, adminGuard],
        data: ventana({ ...VENTANA_DASHBOARD, seccion: 'usuarios', secciones: true }),
        loadComponent: () =>
          import('./features/dashboard/usuarios/usuarios').then((modulo) => modulo.Usuarios),
      },
      {
        path: 'dashboard/usuarios/nuevo',
        title: 'Nuevo usuario · Dashboard · Windose 20',
        canActivate: [authGuard, adminGuard],
        data: ventana({
          ...VENTANA_DASHBOARD,
          ancho: '780px',
          seccion: 'nuevo usuario',
          estado: ['dashboard › usuarios › nuevo', 'campos obligatorios salvo indicación'],
        }),
        loadComponent: () =>
          import('./features/dashboard/nuevo-usuario/nuevo-usuario').then(
            (modulo) => modulo.NuevoUsuario,
          ),
      },
      {
        path: 'dashboard/estadisticas',
        title: 'Estadísticas · Dashboard · Windose 20',
        canActivate: [authGuard, adminGuard],
        data: ventana({ ...VENTANA_DASHBOARD, seccion: 'estadísticas', secciones: true }),
        loadComponent: () =>
          import('./features/dashboard/estadisticas/estadisticas').then(
            (modulo) => modulo.Estadisticas,
          ),
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
