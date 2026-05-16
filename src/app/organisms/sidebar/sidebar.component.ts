/** Organismo: Sidebar de navegación lateral */
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

interface NavItem { id: string; label: string; icon: string; route: string; roles?: string[]; }

const ICONS: Record<string, string> = {
  home:     '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
  document: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>',
  tasks:    '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>',
  audit:    '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
  trash:    '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>',
  users:    '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
  logout:   '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>',
};

const ALL_NAV_ITEMS: NavItem[] = [
  // Todos los roles
  { id: 'dashboard',  label: 'Inicio',           icon: ICONS['home'],     route: '/app/dashboard'  },
  // Todos los roles pueden crear y ver documentos
  { id: 'documentos', label: 'Documentos',        icon: ICONS['document'], route: '/app/documentos' },
  // ADMIN, REVISOR, APROBADOR, FIRMANTE
  { id: 'tareas',     label: 'Tareas Pendientes', icon: ICONS['tasks'],    route: '/app/tareas',    roles: ['ADMIN', 'REVISOR', 'APROBADOR', 'FIRMANTE'] },
  // Solo ADMIN
  { id: 'auditoria',  label: 'Auditoría',         icon: ICONS['audit'],    route: '/app/auditoria', roles: ['ADMIN'] },
  { id: 'papelera',   label: 'Papelera',          icon: ICONS['trash'],    route: '/app/papelera',  roles: ['ADMIN'] },
];

const ADMIN_ITEMS: NavItem[] = [
  { id: 'usuarios', label: 'Gestión de Usuarios', icon: ICONS['users'], route: '/app/usuarios' },
];

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <aside [class]="'sidebar' + (collapsed ? ' collapsed' : '')">
      <div class="sidebar-logo">
        <div class="logo-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
        </div>
        <div *ngIf="!collapsed" class="logo-text">
          <span class="logo-name">OmniFiles</span>
          <span class="logo-tagline">Gestión Documental</span>
        </div>
      </div>

      <nav class="sidebar-nav">
        <div class="nav-section">
          <span *ngIf="!collapsed" class="section-label">Principal</span>
          <a *ngFor="let item of visibleNavItems"
             [routerLink]="item.route"
             routerLinkActive="active"
             class="nav-item"
             [title]="collapsed ? item.label : ''">
            <span class="nav-icon" [innerHTML]="item.icon"></span>
            <span *ngIf="!collapsed" class="nav-label">{{ item.label }}</span>
          </a>
        </div>

        <div *ngIf="isAdmin()" class="nav-section">
          <span *ngIf="!collapsed" class="section-label">Administración</span>
          <a *ngFor="let item of adminItems"
             [routerLink]="item.route"
             routerLinkActive="active"
             class="nav-item"
             [title]="collapsed ? item.label : ''">
            <span class="nav-icon" [innerHTML]="item.icon"></span>
            <span *ngIf="!collapsed" class="nav-label">{{ item.label }}</span>
          </a>
        </div>
      </nav>

      <div class="sidebar-bottom">
        <div *ngIf="!collapsed" class="user-info">
          <div class="user-avatar">{{ userInitial }}</div>
          <div class="user-details">
            <span class="user-name">{{ user()?.nombre || user()?.email || 'Usuario' }}</span>
            <span class="user-role">{{ user()?.rolNombre || '' }}</span>
          </div>
        </div>
        <button class="logout-btn" (click)="onLogout()" title="Cerrar sesión">
          <span [innerHTML]="logoutIcon"></span>
          <span *ngIf="!collapsed">Salir</span>
        </button>
      </div>
    </aside>
  `,
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {
  @Input()  collapsed: boolean = false;
  @Output() loggedOut = new EventEmitter<void>();

  adminItems = ADMIN_ITEMS;
  logoutIcon = ICONS['logout'];

  user    = this.auth.user;
  isAdmin = this.auth.isAdmin;

  get visibleNavItems(): NavItem[] {
    return ALL_NAV_ITEMS.filter(item =>
      !item.roles || item.roles.some(r => this.auth.hasRole(r))
    );
  }

  get userInitial(): string {
    const u = this.auth.user();
    return (u?.nombre || u?.email || 'U')[0].toUpperCase();
  }

  constructor(private auth: AuthService) {}

  onLogout(): void {
    this.auth.logout();
    this.loggedOut.emit();
  }
}