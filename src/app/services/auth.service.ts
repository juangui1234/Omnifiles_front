/**
 * auth.service.ts — Servicio de autenticación
 * Maneja login, logout y persistencia de sesión en sessionStorage
 */
import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { LoginRequest, LoginResponse, UsuarioResponse } from '../models';

const ROLE_PREFIX = 'ROLE_';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private readonly API = '/omnifiles/auth';

  private _user  = signal<UsuarioResponse | null>(this.loadUser());
  private _token = signal<string | null>(sessionStorage.getItem('omnifiles_token'));
  // Fix: roles en signal para que isAdmin y hasRole sean reactivos
  private _roles = signal<string[]>(this.loadRoles());

  readonly user   = this._user.asReadonly();
  readonly token  = this._token.asReadonly();
  readonly isAuth = computed(() => !!this._token());

  // Fix: ahora depende del signal _roles — se recalcula sin necesitar Ctrl+R
  readonly isAdmin = computed(() =>
    this._roles().includes(`${ROLE_PREFIX}ADMIN`)
  );

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.API}/login`, { email, password }).pipe(
      tap(res => {
        const usuario: UsuarioResponse = {
          id:        0,
          nombre:    res.email,
          email:     res.email,
          rolId:     0,
          rolNombre: this.extractRolNombre(res.roles),
          activo:    true
        };

        this._token.set(res.accessToken);
        this._user.set(usuario);
        this._roles.set(res.roles); // Fix: actualizar signal de roles

        sessionStorage.setItem('omnifiles_token', res.accessToken);
        sessionStorage.setItem('omnifiles_roles', JSON.stringify(res.roles));
        sessionStorage.setItem('omnifiles_user',  JSON.stringify(usuario));
      })
    );
  }

  logout(): void {
    this._user.set(null);
    this._token.set(null);
    this._roles.set([]); // Fix: limpiar signal de roles al salir
    sessionStorage.removeItem('omnifiles_token');
    sessionStorage.removeItem('omnifiles_roles');
    sessionStorage.removeItem('omnifiles_user');
  }

  /**
   * Verifica si el usuario tiene un rol específico.
   * Acepta con o sin prefijo: hasRole('ADMIN') o hasRole('ROLE_ADMIN')
   * Fix: ahora lee del signal _roles en lugar del sessionStorage directamente
   */
  hasRole(rol: string): boolean {
    const normalized = rol.startsWith(ROLE_PREFIX) ? rol : `${ROLE_PREFIX}${rol}`;
    return this._roles().includes(normalized);
  }

  private extractRolNombre(roles: string[]): string {
    if (!roles || roles.length === 0) return '';
    return roles[0].replace(ROLE_PREFIX, '');
  }

  private loadUser(): UsuarioResponse | null {
    try {
      const s = sessionStorage.getItem('omnifiles_user');
      return s ? JSON.parse(s) : null;
    } catch { return null; }
  }

  private loadRoles(): string[] {
    try {
      const s = sessionStorage.getItem('omnifiles_roles');
      return s ? JSON.parse(s) : [];
    } catch { return []; }
  }
}