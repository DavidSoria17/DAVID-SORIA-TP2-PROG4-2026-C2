import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/** Deja entrar solo con sesión iniciada; sin token, lleva al login. */
export const authGuard: CanActivateFn = () =>
  inject(AuthService).token() !== null || inject(Router).createUrlTree(['/login']);
