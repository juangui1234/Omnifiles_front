/**
 * api.service.ts — Capa de comunicación con el backend OmniFiles
 */
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  UsuarioResponse, Documento, DocumentoDTO,
  HistorialDocumento, Tarea, TareaAccionDTO, TipoDocumento
} from '../models';

@Injectable({ providedIn: 'root' })
export class ApiService {

  private readonly BASE = '/omnifiles/api/v1';

  constructor(private http: HttpClient) {}

  private textOpts = { responseType: 'text' as const };

  // ─── Usuarios ──────────────────────────────────────────────────────────────

  getUsuarios(): Observable<UsuarioResponse[]> {
    return this.http.get<UsuarioResponse[]>(`${this.BASE}/usuarios`);
  }
  getUsuario(id: number): Observable<UsuarioResponse> {
    return this.http.get<UsuarioResponse>(`${this.BASE}/usuarios/${id}`);
  }
  crearUsuario(data: any): Observable<any> {
    return this.http.post(`${this.BASE}/usuarios`, data);
  }
  actualizarUsuario(id: number, data: any): Observable<any> {
    return this.http.put(`${this.BASE}/usuarios/${id}`, data);
  }

  /**
   * Crítico 3 — El backend usa @RequestParam, NO concatenación en string.
   * Usar HttpParams es la forma correcta y evita errores de parsing.
   * ANTES: `...estado?activo=${activo}`, {}, this.textOpts
   * AHORA: HttpParams con .set()
   */
  cambiarEstadoUsuario(id: number, activo: boolean): Observable<any> {
    const params = new HttpParams().set('activo', String(activo));
    return this.http.patch(
      `${this.BASE}/usuarios/${id}/estado`,
      {},
      { ...this.textOpts, params }
    );
  }

  eliminarUsuario(id: number): Observable<any> {
    return this.http.delete(`${this.BASE}/usuarios/${id}`, this.textOpts);
  }

  // ─── Documentos ────────────────────────────────────────────────────────────

  getDocumentos(filtros?: {
    estado?:          string;
    usuarioId?:       number;
    tipoDocumentoId?: number;
    fechaDesde?:      string;  // formato: 2025-01-01T00:00:00
    fechaHasta?:      string;  // formato: 2025-12-31T23:59:59
  }): Observable<Documento[]> {
    let params = new HttpParams();
    if (filtros?.estado)          params = params.set('estado',          filtros.estado);
    if (filtros?.usuarioId)       params = params.set('usuarioId',       filtros.usuarioId);
    if (filtros?.tipoDocumentoId) params = params.set('tipoDocumentoId', filtros.tipoDocumentoId);
    if (filtros?.fechaDesde)      params = params.set('fechaDesde',      filtros.fechaDesde);
    if (filtros?.fechaHasta)      params = params.set('fechaHasta',      filtros.fechaHasta);
    return this.http.get<Documento[]>(`${this.BASE}/documentos`, { params });
  }

  getDocumento(id: number): Observable<Documento> {
    return this.http.get<Documento>(`${this.BASE}/documentos/${id}`);
  }
  crearDocumento(data: DocumentoDTO): Observable<Documento> {
    return this.http.post<Documento>(`${this.BASE}/documentos`, data);
  }
  actualizarDocumento(id: number, data: any): Observable<any> {
    return this.http.put(`${this.BASE}/documentos/${id}`, data);
  }
  eliminarDocumento(id: number): Observable<any> {
    return this.http.delete(`${this.BASE}/documentos/${id}`, this.textOpts);
  }
  subirArchivo(id: number, file: File): Observable<any> {
    const fd = new FormData();
    fd.append('archivo', file);
    // No usar textOpts aquí porque FormData necesita que Angular
    // detecte automáticamente el Content-Type multipart/form-data
    return this.http.post(`${this.BASE}/documentos/${id}/upload`, fd, this.textOpts);
  }
  descargarDocumento(id: number): Observable<Blob> {
    return this.http.get(`${this.BASE}/documentos/${id}/download`, {
      responseType: 'blob'
    });
  }
  getHistorial(id: number): Observable<HistorialDocumento[]> {
    return this.http.get<HistorialDocumento[]>(`${this.BASE}/documentos/${id}/historial`);
  }

  // ─── Papelera ──────────────────────────────────────────────────────────────

  getPapelera(): Observable<Documento[]> {
    return this.http.get<Documento[]>(`${this.BASE}/documentos/papelera`);
  }
  restaurarDocumento(id: number): Observable<any> {
    return this.http.put(`${this.BASE}/documentos/papelera/${id}/restaurar`, {}, this.textOpts);
  }
  eliminarPermanente(id: number): Observable<any> {
    return this.http.delete(`${this.BASE}/documentos/papelera/${id}`, this.textOpts);
  }

  // ─── Tareas ────────────────────────────────────────────────────────────────

  getTareasPendientes(usuarioId: number): Observable<Tarea[]> {
    return this.http.get<Tarea[]>(`${this.BASE}/tareas/pendientes/usuario/${usuarioId}`);
  }
  getTareasPorDocumento(docId: number): Observable<Tarea[]> {
    return this.http.get<Tarea[]>(`${this.BASE}/tareas/documento/${docId}`);
  }

  /**
   * Las acciones de tarea devuelven TareaDTO (JSON), no texto plano.
   * Se eliminó textOpts para que Angular parsee la respuesta como JSON.
   */
  aprobarTarea(id: number, dto: TareaAccionDTO): Observable<Tarea> {
    return this.http.patch<Tarea>(`${this.BASE}/tareas/${id}/aprobar`, dto);
  }
  rechazarTarea(id: number, dto: TareaAccionDTO): Observable<Tarea> {
    return this.http.patch<Tarea>(`${this.BASE}/tareas/${id}/rechazar`, dto);
  }
  solicitarCorreccion(id: number, dto: TareaAccionDTO): Observable<Tarea> {
    return this.http.patch<Tarea>(`${this.BASE}/tareas/${id}/correccion`, dto);
  }

  // ─── Tipos Documentales ────────────────────────────────────────────────────

  getTiposDocumento(): Observable<TipoDocumento[]> {
    return this.http.get<TipoDocumento[]>(`${this.BASE}/tipos-documentales`);
  }
  getTiposDocumentoActivos(): Observable<TipoDocumento[]> {
    return this.http.get<TipoDocumento[]>(`${this.BASE}/tipos-documentales/activos`);
  }
  crearTipoDocumento(data: any): Observable<any> {
    return this.http.post(`${this.BASE}/tipos-documentales`, data);
  }
  actualizarTipoDocumento(id: number, data: any): Observable<any> {
    return this.http.put(`${this.BASE}/tipos-documentales/${id}`, data);
  }

  /**
   * El backend no tiene DELETE para tipos documentales,
   * solo PATCH para cambiar estado (activar/desactivar).
   * Se reemplaza eliminarTipoDocumento por cambiarEstadoTipoDocumento.
   */
  cambiarEstadoTipoDocumento(id: number, activo: boolean): Observable<any> {
    const params = new HttpParams().set('activo', String(activo));
    return this.http.patch(
      `${this.BASE}/tipos-documentales/${id}/estado`,
      {},
      { ...this.textOpts, params }
    );
  }
}