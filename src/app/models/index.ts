/**
 * models/index.ts — Interfaces TypeScript del dominio OmniFiles
 * Alineadas con los DTOs del backend Spring Boot
 */

// ─── Auth ─────────────────────────────────────────────────────────────────────
export interface LoginRequest {
  email:    string;
  password: string;
}

/**
 * Respuesta REAL del backend:
 * { accessToken, tokenType, expiresInSeconds, email, roles }
 * El backend NO devuelve un objeto "usuario" anidado.
 */
export interface LoginResponse {
  id:               number;   // id real del usuario — agregado al backend
  accessToken:      string;
  tokenType:        string;   // siempre "Bearer"
  expiresInSeconds: number;
  email:            string;
  roles:            string[]; // ej: ["ROLE_ADMIN"], ["ROLE_CREADOR"]
}

// ─── Usuario ──────────────────────────────────────────────────────────────────
export interface Usuario {
  id:          number;
  nombre:      string;
  email:       string;
  contrasena?: string;
  rolId?:      number;
  rolNombre?:  string;
  cargo?:      string;
  telefono?:   string;
  activo?:     boolean;
}

/**
 * UsuarioResponseDTO del backend:
 * { id, nombre, email, rolId, rolNombre, activo, telefono, cargo }
 * El backend NO devuelve un campo "rol" suelto, solo "rolNombre".
 */
export interface UsuarioResponse {
  id:        number;
  nombre:    string;
  email:     string;
  rolId:     number;
  rolNombre: string;
  activo:    boolean;
  telefono?: string;
  cargo?:    string;
}

// ─── Documento ────────────────────────────────────────────────────────────────
export type EstadoDocumento = 'CREADO' | 'EN_REVISION' | 'APROBADO' | 'RECHAZADO';

export interface Documento {
  id:                  number;
  nombre:              string;
  estado:              EstadoDocumento;
  rutaArchivo?:        string;
  usuarioId?:          number;
  tipoDocumentoId?:    number;
  eliminado?:          boolean;
  createdAt?:          string; // backend devuelve "createdAt", no "fechaCreacion"
  updatedAt?:          string; // backend devuelve "updatedAt", no "fechaActualizacion"
}

export interface DocumentoDTO {
  nombre:          string;
  tipoDocumentoId: number;
  flujoId?:        number;
  usuarioId?:      number;
}

// ─── Historial ────────────────────────────────────────────────────────────────
/**
 * HistorialDocumentoDTO del backend:
 * { id, documentoId, usuarioId, estado, accion, fechaCambio }
 * "estado" y "accion" son strings simples, NO objetos anidados.
 */
export interface HistorialDocumento {
  id?:          number;
  documentoId?: number;
  usuarioId?:   number;
  estado?:      string; // ej: "APROBADO", "CREADO"
  accion?:      string; // ej: "CREACION", "ETAPA_APROBADA"
  fechaCambio?: string; // ISO datetime
}

// ─── Tarea ────────────────────────────────────────────────────────────────────
export type EstadoTarea = 'PENDIENTE' | 'APROBADO' | 'RECHAZADO' | 'CORRECCION';

/**
 * TareaDTO del backend:
 * { id, documentoId, usuarioAsignadoId, etapaFlujoId, estado,
 *   observaciones, fechaAsignacion, fechaResolucion }
 */
export interface Tarea {
  id:                number;
  documentoId:       number;
  usuarioAsignadoId: number;  // antes era "usuarioId", el backend usa "usuarioAsignadoId"
  etapaFlujoId?:     number;
  estado?:           EstadoTarea;
  observaciones?:    string;
  fechaAsignacion?:  string;  // antes era "fechaCreacion"
  fechaResolucion?:  string;
}

export interface TareaAccionDTO { observaciones?: string; }

// ─── Tipo Documento ───────────────────────────────────────────────────────────
export interface TipoDocumento {
  id:               number;
  nombre:           string;
  descripcion?:     string;
  estado?:          boolean;
  flujoConfigurado?: boolean; // campo nuevo del backend
}

// ─── Flujo ────────────────────────────────────────────────────────────────────
export interface Flujo {
  id:              number;
  tipoDocumentoId: number;
  nombre:          string;
  etapas?:         EtapaFlujo[];
}

export interface EtapaFlujo {
  id?:       number;
  flujoId:   number;
  orden:     number;
  nombre:    string;
  rolId:     number;
  rolNombre?: string;
  usuarioId?: number;
}

// ─── Utilidades UI ────────────────────────────────────────────────────────────
export interface SelectOption { value: string | number; label: string; }
export interface AlertData    { type: 'success' | 'error' | 'warning' | 'info'; message: string; }