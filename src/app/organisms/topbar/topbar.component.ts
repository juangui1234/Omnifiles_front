/** Organismo: Topbar — barra superior de la aplicación */
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

const PAGE_TITLES: Record<string, string> = {
  dashboard:  'Panel Principal',
  documentos: 'Gestión de Documentos',
  tareas:     'Tareas Pendientes',
  usuarios:   'Gestión de Usuarios',
  auditoria:  'Auditoría del Sistema',
  papelera:   'Papelera',
};

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="topbar">
      <div class="topbar-left">
        <button class="menu-btn" (click)="toggled.emit()" aria-label="Alternar menú">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>
        <div>
          <h1 class="topbar-title">{{ pageTitle }}</h1>
          <p class="topbar-date">{{ today }}</p>
        </div>
      </div>
      <div class="topbar-right">
        <div class="system-badge">
          <span class="system-dot"></span>
          Sistema activo
        </div>
      </div>
    </header>
  `,
  styles: [`
    .topbar { height: var(--navbar-height); background: var(--color-surface); border-bottom: 1px solid var(--color-border); display: flex; align-items: center; justify-content: space-between; padding: 0 24px; position: sticky; top: 0; z-index: 50; flex-shrink: 0; }
    .topbar-left { display: flex; align-items: center; gap: 16px; }
    .menu-btn { width: 36px; height: 36px; border: 1px solid var(--color-border); background: var(--color-surface); border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; cursor: pointer; color: var(--color-secondary); transition: all var(--transition-fast); }
    .menu-btn:hover { background: var(--color-surface-2); color: var(--color-primary); }
    .topbar-title { font-size: var(--text-xl); font-weight: var(--weight-bold); color: var(--color-primary); font-family: var(--font-display); line-height: 1; margin-bottom: 2px; }
    .topbar-date  { font-size: var(--text-xs); color: #94A3B8; text-transform: capitalize; }
    .topbar-right { display: flex; align-items: center; gap: 12px; }
    .system-badge { display: flex; align-items: center; gap: 8px; padding: 4px 12px; background: var(--color-success-bg); color: var(--color-success); border-radius: var(--radius-full); font-size: var(--text-xs); font-weight: var(--weight-semibold); }
    .system-dot   { width: 7px; height: 7px; background: var(--color-success); border-radius: 50%; animation: pulse 2s infinite; }
    @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
  `]
})
export class TopbarComponent {
  @Input() set route(r: string) {
    this.pageTitle = PAGE_TITLES[r] || 'OmniFiles';
  }
  @Output() toggled = new EventEmitter<void>();

  pageTitle = 'Panel Principal';
  today = new Date().toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}
