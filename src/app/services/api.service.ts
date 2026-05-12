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
  cambiarEstadoUsuario(id: number, activo: boolean): Observable<any> {
    return this.http.patch(`${this.BASE}/usuarios/${id}/estado?activo=${activo}`, {}, this.textOpts);
  }
  eliminarUsuario(id: number): Observable<any> {
    return this.http.delete(`${this.BASE}/usuarios/${id}`, this.textOpts);
  }

  getDocumentos(filtros?: { estado?: string; usuarioId?: number; tipoDocumentoId?: number }): Observable<Documento[]> {
    let params = new HttpParams();
    if (filtros?.estado)          params = params.set('estado',          filtros.estado);
    if (filtros?.usuarioId)       params = params.set('usuarioId',       filtros.usuarioId);
    if (filtros?.tipoDocumentoId) params = params.set('tipoDocumentoId', filtros.tipoDocumentoId);
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
    return this.http.post(`${this.BASE}/documentos/${id}/upload`, fd, this.textOpts);
  }
  getHistorial(id: number): Observable<HistorialDocumento[]> {
    return this.http.get<HistorialDocumento[]>(`${this.BASE}/documentos/${id}/historial`);
  }

  getPapelera(): Observable<Documento[]> {
    return this.http.get<Documento[]>(`${this.BASE}/documentos/papelera`);
  }
  restaurarDocumento(id: number): Observable<any> {
    return this.http.put(`${this.BASE}/documentos/papelera/${id}/restaurar`, {}, this.textOpts);
  }
  eliminarPermanente(id: number): Observable<any> {
    return this.http.delete(`${this.BASE}/documentos/papelera/${id}`, this.textOpts);
  }

  getTareasPendientes(usuarioId: number): Observable<Tarea[]> {
    return this.http.get<Tarea[]>(`${this.BASE}/tareas/pendientes/usuario/${usuarioId}`);
  }
  getTareasPorDocumento(docId: number): Observable<Tarea[]> {
    return this.http.get<Tarea[]>(`${this.BASE}/tareas/documento/${docId}`);
  }
  aprobarTarea(id: number, dto: TareaAccionDTO): Observable<any> {
    return this.http.patch(`${this.BASE}/tareas/${id}/aprobar`, dto, this.textOpts);
  }
  rechazarTarea(id: number, dto: TareaAccionDTO): Observable<any> {
    return this.http.patch(`${this.BASE}/tareas/${id}/rechazar`, dto, this.textOpts);
  }
  solicitarCorreccion(id: number, dto: TareaAccionDTO): Observable<any> {
    return this.http.patch(`${this.BASE}/tareas/${id}/correccion`, dto, this.textOpts);
  }

  getTiposDocumento(): Observable<TipoDocumento[]> {
    return this.http.get<TipoDocumento[]>(`${this.BASE}/tipos-documentales`);
  }
  crearTipoDocumento(data: any): Observable<any> {
    return this.http.post(`${this.BASE}/tipos-documentales`, data);
  }
  actualizarTipoDocumento(id: number, data: any): Observable<any> {
    return this.http.put(`${this.BASE}/tipos-documentales/${id}`, data);
  }
  eliminarTipoDocumento(id: number): Observable<any> {
    return this.http.delete(`${this.BASE}/tipos-documentales/${id}`, this.textOpts);
  }
}
