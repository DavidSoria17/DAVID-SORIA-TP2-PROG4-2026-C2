import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/** Las pantallas del dashboard son solo para administradores; el resto vuelve al escritorio. */
export const adminGuard: CanActivateFn = () =>
  inject(AuthService).esAdmin() || inject(Router).createUrlTree(['/']);
