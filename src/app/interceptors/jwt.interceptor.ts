/**
 * jwt.interceptor.ts — Interceptor HTTP
 * Adjunta el token JWT en el header Authorization de cada petición al backend
 */
import { HttpInterceptorFn } from '@angular/common/http';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const token = sessionStorage.getItem('omnifiles_token');
  if (token) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }
  return next(req);
};
