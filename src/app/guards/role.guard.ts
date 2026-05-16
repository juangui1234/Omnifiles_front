/**
 * role.guard.ts — Guard de rutas por rol
 * Restringe el acceso a rutas según el rol del usuario autenticado.
 * Uso: canActivate: [roleGuard('REVISOR', 'APROBADOR', 'FIRMANTE')]
 */
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard = (...roles: string[]): CanActivateFn => {
  return () => {
    const auth   = inject(AuthService);
    const router = inject(Router);

    if (!auth.isAuth()) {
      router.navigate(['/login']);
      return false;
    }

    const tienePermiso = roles.some(r => auth.hasRole(r));
    if (tienePermiso) return true;

    router.navigate(['/app/dashboard']);
    return false;
  };
};