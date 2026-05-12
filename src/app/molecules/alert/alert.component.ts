/** Molécula: Notificación de estado (success, error, warning, info) */
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-alert',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [class]="'alert alert-' + type" role="alert">
      <span class="alert-icon" [innerHTML]="icons[type]"></span>
      <div class="alert-content">
        <span *ngIf="title"   class="alert-title">{{ title }}</span>
        <span *ngIf="message" class="alert-msg">{{ message }}</span>
      </div>
      <button *ngIf="closable" class="alert-close" (click)="closed.emit()">✕</button>
    </div>
  `,
  styles: [`
    .alert { display: flex; align-items: flex-start; gap: 12px; padding: 12px 16px; border-radius: var(--radius-lg); border: 1px solid; animation: fadeIn 0.2s ease; }
    .alert-success { background: var(--color-success-bg); border-color: #bbf7d0; color: var(--color-success); }
    .alert-error   { background: var(--color-error-bg);   border-color: #fecaca; color: var(--color-error);   }
    .alert-warning { background: var(--color-warning-bg); border-color: #fde68a; color: var(--color-warning); }
    .alert-info    { background: var(--color-info-bg);    border-color: #bae6fd; color: var(--color-info);    }
    .alert-icon    { display: flex; align-items: center; flex-shrink: 0; margin-top: 1px; }
    .alert-content { flex: 1; display: flex; flex-direction: column; gap: 2px; }
    .alert-title   { font-weight: var(--weight-semibold); font-size: var(--text-sm); }
    .alert-msg     { font-size: var(--text-sm); opacity: 0.85; }
    .alert-close   { border: none; background: none; cursor: pointer; color: currentColor; opacity: 0.6; font-size: 14px; padding: 2px; border-radius: 4px; }
    .alert-close:hover { opacity: 1; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: none; } }
  `]
})
export class AlertComponent {
  @Input() type:     string  = 'info';
  @Input() title:    string  = '';
  @Input() message:  string  = '';
  @Input() closable: boolean = true;
  @Output() closed = new EventEmitter<void>();

  icons: Record<string, string> = {
    success: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
    error:   '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
    warning: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
    info:    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
  };
}
