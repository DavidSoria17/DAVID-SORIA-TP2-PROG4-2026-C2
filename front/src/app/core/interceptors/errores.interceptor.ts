import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { SesionService } from '../services/sesion.service';
import { mensajeDeError } from '../utils/errores.utils';
import { SIN_TOKEN } from '../utils/http.constants';

/**
 * Si la API rechaza el token (401), cierra la sesión y lleva al login para
 * conseguir uno nuevo. No actúa sobre los pedidos `SIN_TOKEN`: en el login,
 * un 401 son credenciales incorrectas y lo muestra el formulario. El error
 * sigue viaje igual, para que quien hizo el pedido deje de esperar.
 */
export const erroresInterceptor: HttpInterceptorFn = (peticion, siguiente) => {
  const sesionService = inject(SesionService);
  return siguiente(peticion).pipe(
    catchError((error: unknown) => {
      if (
        error instanceof HttpErrorResponse &&
        error.status === 401 &&
        !peticion.context.get(SIN_TOKEN)
      ) {
        sesionService.terminar(mensajeDeError(error));
      }
      return throwError(() => error);
    }),
  );
};
