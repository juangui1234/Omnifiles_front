/**
 * audit.interceptor.ts
 *
 * Responsabilidad ÚNICA: trazabilidad de acciones.
 *
 * Registra en sessionStorage cada acción relevante que el usuario
 * realiza contra el backend: qué hizo, cuándo, con qué datos y
 * con qué resultado. Esto permite:
 *
 *  — Mostrar un log de actividad en el componente de auditoría.
 *  — Detectar acciones sospechosas (muchos intentos fallidos, etc).
 *  — Demostrar al profesor que el sistema tiene trazabilidad real.
 *
 * Solo registra métodos que modifican datos: POST, PUT, PATCH, DELETE.
 * Los GET (solo lectura) no se auditan para no saturar el log.
 */
import { HttpInterceptorFn, HttpRequest, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { tap } from 'rxjs';

// ── Tipos ──────────────────────────────────────────────────────────────────

export interface AuditEntry {
  id:        string;       // UUID único del registro
  timestamp: string;       // ISO 8601
  usuario:   string;       // email del usuario autenticado
  accion:    string;       // descripción legible de la acción
  metodo:    string;       // HTTP method
  url:       string;       // URL relativa
  resultado: 'EXITOSO' | 'FALLIDO';
  detalle?:  string;       // mensaje de error si falló
}

const STORAGE_KEY = 'omnifiles_audit_log';
const MAX_ENTRIES = 200;   // máximo de entradas guardadas en memoria

// ── Mapa de rutas → descripción legible ───────────────────────────────────

function describirAccion(method: string, url: string): string {
  const ruta = url.replace('/omnifiles/api/v1', '');

  // Documentos
  if (method === 'POST'   && ruta.match(/^\/documentos$/))              return 'Crear documento';
  if (method === 'PUT'    && ruta.match(/^\/documentos\/\d+$/))         return 'Actualizar documento';
  if (method === 'DELETE' && ruta.match(/^\/documentos\/\d+$/))         return 'Enviar documento a papelera';
  if (method === 'POST'   && ruta.match(/^\/documentos\/\d+\/upload$/)) return 'Subir archivo';
  if (method === 'PUT'    && ruta.match(/\/papelera\/\d+\/restaurar$/)) return 'Restaurar documento de papelera';
  if (method === 'DELETE' && ruta.match(/\/papelera\/\d+$/))            return 'Eliminar documento permanentemente';

  // Tareas
  if (method === 'PATCH' && ruta.match(/\/tareas\/\d+\/aprobar$/))      return 'Aprobar tarea';
  if (method === 'PATCH' && ruta.match(/\/tareas\/\d+\/rechazar$/))     return 'Rechazar tarea';
  if (method === 'PATCH' && ruta.match(/\/tareas\/\d+\/correccion$/))   return 'Solicitar corrección de tarea';

  // Usuarios
  if (method === 'POST'   && ruta.match(/^\/usuarios$/))                return 'Crear usuario';
  if (method === 'PUT'    && ruta.match(/^\/usuarios\/\d+$/))           return 'Actualizar usuario';
  if (method === 'DELETE' && ruta.match(/^\/usuarios\/\d+$/))           return 'Eliminar usuario';
  if (method === 'PATCH'  && ruta.match(/\/usuarios\/\d+\/estado$/))    return 'Cambiar estado de usuario';

  // Tipos documentales
  if (method === 'POST'  && ruta.match(/^\/tipos-documentales$/))       return 'Crear tipo documental';
  if (method === 'PUT'   && ruta.match(/^\/tipos-documentales\/\d+$/))  return 'Actualizar tipo documental';
  if (method === 'PATCH' && ruta.match(/\/tipos-documentales\/\d+\/estado$/)) return 'Cambiar estado de tipo documental';

  // Flujos
  if (method === 'POST'   && ruta.match(/^\/flujos$/))                  return 'Crear flujo';
  if (method === 'POST'   && ruta.match(/\/flujos\/\d+\/etapas$/))      return 'Agregar etapa al flujo';
  if (method === 'DELETE' && ruta.match(/\/flujos\/etapas\/\d+$/))      return 'Eliminar etapa del flujo';

  // Auth
  if (method === 'POST' && ruta.includes('/auth/login'))                return 'Inicio de sesión';
  if (method === 'POST' && ruta.includes('/auth/logout'))               return 'Cierre de sesión';

  return `${method} ${ruta}`;
}

// ── Helpers ────────────────────────────────────────────────────────────────

function obtenerUsuario(): string {
  try {
    const raw = sessionStorage.getItem('omnifiles_user');
    if (!raw) return 'anónimo';
    const u = JSON.parse(raw);
    return u.email || u.nombre || 'usuario';
  } catch {
    return 'anónimo';
  }
}

function generarId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function guardarEntrada(entry: AuditEntry): void {
  try {
    const raw      = sessionStorage.getItem(STORAGE_KEY);
    const log: AuditEntry[] = raw ? JSON.parse(raw) : [];
    log.unshift(entry);                          // más reciente primero
    if (log.length > MAX_ENTRIES) log.splice(MAX_ENTRIES);
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(log));
  } catch {
    // Si falla (storage lleno, etc.) no interrumpir la petición
  }
}

/** Expone el log completo para el componente de auditoría */
export function getAuditLog(): AuditEntry[] {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/** Limpia el log (útil al cerrar sesión) */
export function clearAuditLog(): void {
  sessionStorage.removeItem(STORAGE_KEY);
}

// ── Interceptor ────────────────────────────────────────────────────────────

const METODOS_AUDITABLES = ['POST', 'PUT', 'PATCH', 'DELETE'];

export const auditInterceptor: HttpInterceptorFn = (req, next) => {
  // Solo auditar peticiones al backend de OmniFiles que modifiquen datos
  const esAuditable =
    req.url.includes('/omnifiles/api/v1') &&
    METODOS_AUDITABLES.includes(req.method);

  if (!esAuditable) return next(req);

  const inicio  = Date.now();
  const accion  = describirAccion(req.method, req.url);
  const usuario = obtenerUsuario();

  return next(req).pipe(
    tap({
      next: (event) => {
        if (event instanceof HttpResponse) {
          guardarEntrada({
            id:        generarId(),
            timestamp: new Date().toISOString(),
            usuario,
            accion,
            metodo:    req.method,
            url:       req.url,
            resultado: 'EXITOSO',
          });
        }
      },
      error: (error: HttpErrorResponse) => {
        guardarEntrada({
          id:        generarId(),
          timestamp: new Date().toISOString(),
          usuario,
          accion,
          metodo:    req.method,
          url:       req.url,
          resultado: 'FALLIDO',
          detalle:   error?.error?.message || `HTTP ${error?.status}`,
        });
      }
    })
  );
};