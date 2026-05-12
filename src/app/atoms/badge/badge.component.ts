/** Átomo: Badge de estado — mapea estados del backend a colores */
import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

const STATE_MAP: Record<string, { label: string; variant: string }> = {
  CREADO:      { label: 'Creado',      variant: 'info'    },
  EN_REVISION: { label: 'En revisión', variant: 'warning' },
  APROBADO:    { label: 'Aprobado',    variant: 'success' },
  RECHAZADO:   { label: 'Rechazado',   variant: 'danger'  },
  PENDIENTE:   { label: 'Pendiente',   variant: 'warning' },
  COMPLETADA:  { label: 'Completada',  variant: 'success' },
  ACTIVO:      { label: 'Activo',      variant: 'success' },
  INACTIVO:    { label: 'Inactivo',    variant: 'neutral' },
};

@Component({
  selector: 'app-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span [class]="'badge badge-' + resolvedVariant + ' badge-' + size">
      <span *ngIf="dot" class="badge-dot"></span>
      {{ resolvedLabel }}
    </span>
  `,
  styles: [`
    .badge { display: inline-flex; align-items: center; gap: 4px; border-radius: var(--radius-full); font-weight: var(--weight-semibold); letter-spacing: 0.02em; }
    .badge-sm { padding: 2px 10px; font-size: 11px; }
    .badge-md { padding: 4px 12px; font-size: var(--text-xs); }
    .badge-lg { padding: 4px 12px; font-size: var(--text-sm); }
    .badge-success { background: var(--color-success-bg); color: var(--color-success); }
    .badge-warning { background: var(--color-warning-bg); color: var(--color-warning); }
    .badge-danger  { background: var(--color-error-bg);   color: var(--color-error);   }
    .badge-info    { background: var(--color-info-bg);    color: var(--color-info);     }
    .badge-primary { background: #DBEAFE;                 color: var(--color-primary);  }
    .badge-neutral { background: var(--color-surface-2);  color: var(--color-secondary);}
    .badge-dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; flex-shrink: 0; }
  `]
})
export class BadgeComponent implements OnChanges {
  @Input() estado:  string = '';
  @Input() label:   string = '';
  @Input() variant: string = 'neutral';
  @Input() size:    string = 'sm';
  @Input() dot:     boolean = false;

  resolvedLabel   = '';
  resolvedVariant = '';

  ngOnChanges(): void {
    if (this.estado && STATE_MAP[this.estado]) {
      this.resolvedLabel   = STATE_MAP[this.estado].label;
      this.resolvedVariant = STATE_MAP[this.estado].variant;
    } else {
      this.resolvedLabel   = this.label   || this.estado;
      this.resolvedVariant = this.variant || 'neutral';
    }
  }
}
