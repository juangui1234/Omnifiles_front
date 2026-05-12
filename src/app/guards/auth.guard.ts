/**
 * auth.guard.ts — Guard de rutas protegidas
 * Redirige al login si el usuario no está autenticado
 */
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
  const auth   = inject(AuthService);
  const router = inject(Router);
  if (auth.isAuth()) return true;
  router.navigate(['/login']);
  return false;
};
