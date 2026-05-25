/**
 * jwt.interceptor.ts
 *
 * Responsabilidad ÚNICA: seguridad de autenticación.
 * — Adjunta el token JWT en cada petición al backend.
 * — Maneja errores de autenticación (401) y autorización (403).
 * — Redirige al login cuando el token expira.
 */
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const token  = sessionStorage.getItem('omnifiles_token');

  // Adjunta el token si existe
  if (token) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        // Token expirado o inválido — limpiar sesión y redirigir
        sessionStorage.clear();
        router.navigate(['/login']);
        return throwError(() => ({
          error: { message: 'Sesión expirada. Por favor inicia sesión nuevamente.' }
        }));
      }

      if (error.status === 403) {
        return throwError(() => ({
          error: { message: 'No tienes permisos para realizar esta acción.' }
        }));
      }

      if (error.status === 0) {
        return throwError(() => ({
          error: { message: 'No se pudo conectar con el servidor.' }
        }));
      }

      // Otros errores: pasar el mensaje real del backend
      return throwError(() => error);
    })
  );
};