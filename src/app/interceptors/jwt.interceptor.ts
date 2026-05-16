/**
 * jwt.interceptor.ts — Interceptor HTTP
 * 1. Adjunta el token JWT en Authorization
 * 2. Grave 9 — Detecta 401 y redirige al login (token expirado)
 * 3. Grave 8 — Captura errores del backend y los normaliza para
 *    que todos los componentes puedan leer e.error?.message
 */
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const token  = sessionStorage.getItem('omnifiles_token');

  // Adjuntar token si existe
  if (token) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {

      /**
       * Grave 9 — Token expirado o inválido.
       * El backend devuelve 401 cuando el JWT no es válido.
       * Se limpia la sesión y se redirige al login automáticamente.
       */
      if (error.status === 401) {
        sessionStorage.removeItem('omnifiles_token');
        sessionStorage.removeItem('omnifiles_user');
        sessionStorage.removeItem('omnifiles_roles');
        router.navigate(['/login']);
      }

      /**
       * Grave 8 — Normalizar el error para que todos los componentes
       * puedan leer e.error?.message de forma consistente.
       *
       * El backend devuelve: { status, error, message, path, timestamp }
       * Si el error no tiene ese formato (ej: error de red), se genera
       * un mensaje genérico legible.
       */
      const mensajeBackend = error.error?.message;
      const mensajeFallback = error.status === 0
        ? 'No se pudo conectar con el servidor'
        : error.status === 403
          ? 'No tienes permisos para realizar esta acción'
          : error.status === 404
            ? 'El recurso solicitado no existe'
            : error.status === 409
              ? error.error?.message || 'Ya existe un registro con esos datos'
              : 'Error inesperado, intenta de nuevo';

      // Si el backend ya tiene mensaje lo respetamos, si no usamos el fallback
      const errorNormalizado = new HttpErrorResponse({
        error:   { message: mensajeBackend || mensajeFallback },
        status:  error.status,
        statusText: error.statusText,
        url:     error.url || undefined
      });

      return throwError(() => errorNormalizado);
    })
  );
};