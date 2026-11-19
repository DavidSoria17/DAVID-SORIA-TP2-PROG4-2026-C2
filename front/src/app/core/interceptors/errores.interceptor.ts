import { HttpErrorResponse, HttpInterceptorFn, HttpStatusCode } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { SesionService } from '../services/sesion.service';
import { mensajeDeError } from '../utils/errores.utils';
import { SIN_TOKEN } from '../utils/http.constants';

/**
 * Si la API rechaza el token (401), cierra la sesión y lleva al login para
 * conseguir uno nuevo. No actúa sobre los pedidos `SIN_TOKEN`: en el login,
 * un 401 son credenciales incorrectas y lo muestra el formulario.
 *
 * Si la API frena los pedidos por exceso (429), reemplaza el mensaje por uno
 * que dice cuántos segundos esperar, leídos del header `Retry-After`; así
 * cualquier pantalla que muestre el error con `mensajeDeError` lo explica igual.
 *
 * En los dos casos el error sigue viaje, para que quien hizo el pedido deje de esperar.
 */
export const erroresInterceptor: HttpInterceptorFn = (peticion, siguiente) => {
  const sesionService = inject(SesionService);
  return siguiente(peticion).pipe(
    catchError((error: unknown) => {
      if (!(error instanceof HttpErrorResponse)) return throwError(() => error);

      if (error.status === HttpStatusCode.Unauthorized && !peticion.context.get(SIN_TOKEN)) {
        sesionService.terminar(mensajeDeError(error));
      }
      if (error.status === HttpStatusCode.TooManyRequests) {
        return throwError(() => conMensajeDeEspera(error));
      }
      return throwError(() => error);
    }),
  );
};

/** Copia del 429 con un mensaje que indica cuánto esperar antes de reintentar. */
function conMensajeDeEspera(error: HttpErrorResponse): HttpErrorResponse {
  const segundos = Number(error.headers.get('Retry-After'));
  const espera =
    Number.isInteger(segundos) && segundos > 0
      ? `Esperá ${segundos} ${segundos === 1 ? 'segundo' : 'segundos'}`
      : 'Esperá un minuto';
  return new HttpErrorResponse({
    error: { message: `Hiciste demasiados pedidos seguidos. ${espera} y probá de nuevo.` },
    headers: error.headers,
    status: error.status,
    statusText: error.statusText,
    url: error.url ?? undefined,
  });
}
