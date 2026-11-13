import { registerLocaleData } from '@angular/common';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import localeEsAr from '@angular/common/locales/es-AR';
import {
  ApplicationConfig,
  isDevMode,
  LOCALE_ID,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter, RouteReuseStrategy } from '@angular/router';
import { provideServiceWorker } from '@angular/service-worker';
import { routes } from './app.routes';
import { cargaInterceptor } from './core/interceptors/carga.interceptor';
import { erroresInterceptor } from './core/interceptors/errores.interceptor';
import { tokenInterceptor } from './core/interceptors/token.interceptor';
import { VentanasReuseStrategy } from './core/routing/ventanas-reuse.strategy';

registerLocaleData(localeEsAr);

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    { provide: RouteReuseStrategy, useClass: VentanasReuseStrategy },
    provideHttpClient(
      withFetch(),
      withInterceptors([tokenInterceptor, erroresInterceptor, cargaInterceptor]),
    ),
    { provide: LOCALE_ID, useValue: 'es-AR' },
    // PWA: el service worker guarda la app para abrirla instalada y sin conexión.
    // En desarrollo queda apagado para no servir versiones viejas mientras se edita.
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000',
    }),
  ],
};
