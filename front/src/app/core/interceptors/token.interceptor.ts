import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { AuthService } from '../services/auth.service';
import { SIN_TOKEN } from '../utils/http.constants';

/**
 * Agrega `Authorization: Bearer <token>` a los pedidos a la API cuando hay
 * sesión. No lo manda a otros dominios (el token es solo para nuestra API) ni
 * a los pedidos marcados con `SIN_TOKEN`. El `Content-Type` no se toca:
 * `HttpClient` lo pone según el cuerpo (JSON o multipart con su separador).
 */
export const tokenInterceptor: HttpInterceptorFn = (peticion, siguiente) => {
  const token = inject(AuthService).token();
  const esDeLaApi = peticion.url.startsWith(environment.urlApi);
  if (!token || !esDeLaApi || peticion.context.get(SIN_TOKEN)) return siguiente(peticion);
  return siguiente(peticion.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
};
