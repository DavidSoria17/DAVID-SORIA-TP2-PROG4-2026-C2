import { registerLocaleData } from '@angular/common';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import localeEsAr from '@angular/common/locales/es-AR';
import { ApplicationConfig, LOCALE_ID, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, RouteReuseStrategy } from '@angular/router';
import { routes } from './app.routes';
import { cargaInterceptor } from './core/interceptors/carga.interceptor';
import { tokenInterceptor } from './core/interceptors/token.interceptor';
import { VentanasReuseStrategy } from './core/routing/ventanas-reuse.strategy';

registerLocaleData(localeEsAr);

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    { provide: RouteReuseStrategy, useClass: VentanasReuseStrategy },
    provideHttpClient(withFetch(), withInterceptors([tokenInterceptor, cargaInterceptor])),
    { provide: LOCALE_ID, useValue: 'es-AR' },
  ],
};
