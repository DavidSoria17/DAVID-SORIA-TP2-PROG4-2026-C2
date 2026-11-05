import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SesionService } from '../services/sesion.service';

/** Hasta que se valida el token guardado, cualquier pantalla lleva a la de carga. */
export const cargaInicialGuard: CanActivateFn = () =>
  inject(SesionService).validada() || inject(Router).createUrlTree(['/cargando']);
