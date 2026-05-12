/** Molécula: Tabla de datos genérica */
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SpinnerComponent } from '../../atoms/spinner/spinner.component';

export interface TableColumn {
  key:      string;
  label:    string;
  style?:   Record<string, string>;
  template?: string; // se usa cuando el padre proyecta contenido custom
}

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [CommonModule, SpinnerComponent],
  template: `
    <div class="table-wrapper">
      <table class="table">
        <thead>
          <tr>
            <th *ngFor="let col of columns" class="th" [ngStyle]="col.style">{{ col.label }}</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngIf="loading">
            <td [colSpan]="columns.length" class="td-center">
              <app-spinner [size]="28"></app-spinner>
            </td>
          </tr>
          <tr *ngIf="!loading && data.length === 0">
            <td [colSpan]="columns.length" class="td-empty">{{ emptyMessage }}</td>
          </tr>
          <ng-content></ng-content>
        </tbody>
      </table>
    </div>
  `,
  styles: [`
    .table-wrapper { width: 100%; overflow-x: auto; border-radius: var(--radius-xl); border: 1px solid var(--color-border); }
    .table { width: 100%; border-collapse: collapse; font-size: var(--text-sm); }
    .th { padding: 12px 16px; text-align: left; font-size: 12px; font-weight: var(--weight-semibold); color: var(--color-primary); text-transform: uppercase; letter-spacing: 0.06em; background: var(--color-surface-2); border-bottom: 1px solid var(--color-border); white-space: nowrap; }
    .td-center { padding: 40px; text-align: center; }
    .td-empty  { padding: 40px; text-align: center; color: #94A3B8; }
  `]
})
export class DataTableComponent {
  @Input() columns:      TableColumn[] = [];
  @Input() data:         any[]         = [];
  @Input() loading:      boolean       = false;
  @Input() emptyMessage: string        = 'No hay datos disponibles';
}
