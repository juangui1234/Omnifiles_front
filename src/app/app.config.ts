/**
 * app.config.ts — Configuración global de la aplicación
 *
 * Orden de interceptors (importante):
 *  1. jwtInterceptor  — primero agrega el token y maneja errores de auth
 *  2. auditInterceptor — después registra el resultado de la acción
 *
 * Si fuera al revés, el audit registraría antes de saber si el token
 * fue rechazado por el servidor.
 */
import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { jwtInterceptor }   from './interceptors/jwt.interceptor';
import { auditInterceptor } from './interceptors/audit.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([
        jwtInterceptor,    // 1° seguridad
        auditInterceptor,  // 2° trazabilidad
      ])
    ),
  ]
};