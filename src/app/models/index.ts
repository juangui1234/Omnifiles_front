/**
 * models/index.ts — Interfaces TypeScript del dominio OmniFiles
 * Reflejan los DTOs del backend Spring Boot
 */

// ─── Auth ─────────────────────────────────────────────────────────────────────
export interface LoginRequest  { email: string; password: string; }
export interface LoginResponse { token: string; usuario: UsuarioResponse; }

// ─── Usuario ──────────────────────────────────────────────────────────────────
export interface Usuario {
  id:         number;
  nombre:     string;
  email:      string;
  contrasena?: string;
  rol?:       string;
  rolNombre?: string;
  cargo?:     string;
  telefono?:  string;
  activo?:    boolean;
  estado?:    boolean;
}

export interface UsuarioResponse {
  id:       number;
  nombre:   string;
  email:    string;
  rol:      string;
  rolNombre?: string;
  cargo?:   string;
  activo?:  boolean;
}

// ─── Documento ────────────────────────────────────────────────────────────────
export type EstadoDocumento = 'CREADO' | 'EN_REVISION' | 'APROBADO' | 'RECHAZADO';

export interface Documento {
  id:                  number;
  nombre:              string;
  estado:              EstadoDocumento;
  fechaCreacion?:      string;
  fechaActualizacion?: string;
  eliminado?:          boolean;
  usuarioId?:          number;
  usuarioNombre?:      string;
  tipoDocumentoId?:    number;
  tipoDocumentoNombre?: string;
  rutaArchivo?:        string;
  observaciones?:      string;
}

export interface DocumentoDTO {
  nombre:           string;
  tipoDocumentoId:  number;
  usuarioId:        number;
  observaciones?:   string;
}

// ─── Historial ────────────────────────────────────────────────────────────────
export interface HistorialDocumento {
  id?:               number;
  accion?:           string;
  tipoAccion?:       string;
  fechaAccion?:      string;
  fechaCambio?:      string;
  usuarioId?:        number;
  usuarioNombre?:    string;
  estadoResultante?: string;
  observaciones?:    string;
  documentoId?:      number;
  documentoNombre?:  string;
}

// ─── Tarea ────────────────────────────────────────────────────────────────────
export type EstadoTarea = 'PENDIENTE' | 'APROBADO' | 'RECHAZADO' | 'CORRECCION';

export interface Tarea {
  id:           number;
  documentoId:  number;
  documentoNombre?: string;
  usuarioId?:   number;
  tipoTarea?:   string;
  estado?:      EstadoTarea;
  fechaCreacion?: string;
  observaciones?: string;
}

export interface TareaAccionDTO { observaciones?: string; }

// ─── Tipo Documento ───────────────────────────────────────────────────────────
export interface TipoDocumento {
  id:           number;
  nombre:       string;
  descripcion?: string;
  estado?:      boolean;
}

// ─── Utilidades UI ────────────────────────────────────────────────────────────
export interface SelectOption { value: string | number; label: string; }
export interface AlertData    { type: 'success' | 'error' | 'warning' | 'info'; message: string; }
