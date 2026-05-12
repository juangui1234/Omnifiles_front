/**
 * admin.guard.ts — Guard de rutas exclusivas para administradores
 * Redirige al dashboard si el usuario no tiene rol ADMIN
 */
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = () => {
  const auth   = inject(AuthService);
  const router = inject(Router);

  if (!auth.isAuth()) {
    router.navigate(['/login']);
    return false;
  }

  if (auth.isAdmin()) {
    return true;
  }

  // Autenticado pero sin permisos — volver al dashboard
  router.navigate(['/app/dashboard']);
  return false;
};
