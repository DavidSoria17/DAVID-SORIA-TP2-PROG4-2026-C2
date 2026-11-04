import { inject } from '@angular/core';
import { CanActivateChildFn, Router } from '@angular/router';
import { EscritorioService } from '../services/escritorio.service';
import { PapeleraService } from '../services/papelera.service';
import { rutaDeApp } from '../utils/rutas.utils';

/**
 * Una app que está en la papelera o se eliminó no se abre ni escribiendo su
 * ruta, ni la de una de sus pantallas: se vuelve al escritorio. Las rutas que
 * no son de una app pasan.
 */
export const appInstaladaGuard: CanActivateChildFn = (ruta) => {
  const camino = ruta.routeConfig?.path;
  const app = camino ? inject(EscritorioService).appDeRuta(rutaDeApp(`/${camino}`)) : undefined;
  if (!app || inject(PapeleraService).estaInstalada(app.id)) return true;
  return inject(Router).createUrlTree(['/']);
};
