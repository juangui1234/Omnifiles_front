/**
 * auth.service.ts — Servicio de autenticación
 * Maneja login, logout y persistencia de sesión en sessionStorage
 */
import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { LoginRequest, LoginResponse, UsuarioResponse } from '../models';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private readonly API = '/omnifiles/auth';

  // Signal reactivo con el usuario actual
  private _user = signal<UsuarioResponse | null>(this.loadUser());
  private _token = signal<string | null>(sessionStorage.getItem('omnifiles_token'));

  readonly user   = this._user.asReadonly();
  readonly token  = this._token.asReadonly();
  readonly isAuth = computed(() => !!this._user());
  readonly isAdmin = computed(() =>
    this._user()?.rol === 'ADMIN' || this._user()?.rolNombre === 'ADMIN'
  );

  constructor(private http: HttpClient) {}

  /**
   * Inicia sesión y persiste el token y usuario en sessionStorage
   */
  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.API}/login`, { email, password }).pipe(
      tap(res => {
        const usuario = res.usuario || (res as any);
        this._user.set(usuario);
        this._token.set(res.token);
        sessionStorage.setItem('omnifiles_user',  JSON.stringify(usuario));
        sessionStorage.setItem('omnifiles_token', res.token);
      })
    );
  }

  /**
   * Cierra sesión limpiando estado y sessionStorage
   */
  logout(): void {
    this._user.set(null);
    this._token.set(null);
    sessionStorage.removeItem('omnifiles_user');
    sessionStorage.removeItem('omnifiles_token');
  }

  private loadUser(): UsuarioResponse | null {
    try {
      const s = sessionStorage.getItem('omnifiles_user');
      return s ? JSON.parse(s) : null;
    } catch { return null; }
  }
}
