/** Átomo: Select dropdown */
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SelectOption } from '../../models';

@Component({
  selector: 'app-select',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="sel-wrapper" [class.full]="fullWidth">
      <label *ngIf="label" class="sel-label">{{ label }}</label>
      <div class="sel-field">
        <select class="sel" [(ngModel)]="value" (ngModelChange)="changed.emit($event)">
          <option value="">{{ placeholder }}</option>
          <option *ngFor="let o of options" [value]="o.value">{{ o.label }}</option>
        </select>
        <span class="sel-arrow">▾</span>
      </div>
      <span *ngIf="error" class="sel-error">{{ error }}</span>
    </div>
  `,
  styles: [`
    .sel-wrapper { display: flex; flex-direction: column; gap: 4px; }
    .full { width: 100%; }
    .sel-label { font-size: var(--text-sm); font-weight: var(--weight-medium); color: var(--color-secondary); }
    .sel-field  { position: relative; }
    .sel {
      width: 100%; padding: 10px 32px 10px 12px;
      border: 1.5px solid var(--color-border); border-radius: var(--radius-md);
      background: var(--color-surface); color: var(--color-secondary);
      font-size: var(--text-sm); font-family: var(--font-body);
      appearance: none; cursor: pointer; outline: none;
      transition: all var(--transition-base);
    }
    .sel:focus { border-color: var(--color-primary-light); box-shadow: 0 0 0 3px rgba(37,99,235,0.1); }
    .sel-arrow  { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); color: #94A3B8; pointer-events: none; font-size: 11px; }
    .sel-error  { font-size: var(--text-xs); color: var(--color-error); font-weight: var(--weight-medium); }
  `]
})
export class SelectComponent {
  @Input() label:       string = '';
  @Input() placeholder: string = 'Seleccionar...';
  @Input() options:     SelectOption[] = [];
  @Input() error:       string = '';
  @Input() fullWidth:   boolean = true;
  @Input() value:       any = '';
  @Output() changed = new EventEmitter<any>();
}
