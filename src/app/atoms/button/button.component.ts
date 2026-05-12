/** Átomo: Botón reutilizable con variantes y estados */
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      [type]="type"
      [disabled]="disabled || loading"
      [class]="'btn btn-' + variant + ' btn-' + size + (fullWidth ? ' btn-full' : '') + (loading ? ' btn-loading' : '')"
      (click)="clicked.emit($event)">
      <span *ngIf="loading" class="btn-spinner"></span>
      <span *ngIf="!loading && icon" class="btn-icon-left" [innerHTML]="icon"></span>
      <ng-content></ng-content>
      <span *ngIf="!loading && iconRight" class="btn-icon-right" [innerHTML]="iconRight"></span>
    </button>
  `,
  styles: [`
    .btn {
      display: inline-flex; align-items: center; justify-content: center;
      gap: 8px; border: none; border-radius: var(--radius-md);
      font-weight: var(--weight-semibold); font-family: var(--font-body);
      transition: all var(--transition-base); white-space: nowrap;
      cursor: pointer; letter-spacing: -0.01em;
    }
    .btn-sm  { padding: 8px 12px;  font-size: var(--text-sm); }
    .btn-md  { padding: 10px 16px; font-size: var(--text-sm); }
    .btn-lg  { padding: 12px 24px; font-size: var(--text-base); }
    .btn-full { width: 100%; }

    .btn-primary  { background: var(--color-primary-light); color: #fff; box-shadow: var(--shadow-primary); }
    .btn-primary:hover:not(:disabled)  { background: var(--color-primary); transform: translateY(-1px); }
    .btn-secondary { background: var(--color-surface); color: var(--color-primary-light); border: 1.5px solid var(--color-border); }
    .btn-secondary:hover:not(:disabled){ border-color: var(--color-primary-light); background: var(--color-surface-2); }
    .btn-ghost    { background: transparent; color: var(--color-secondary); }
    .btn-ghost:hover:not(:disabled)    { background: var(--color-surface-2); color: var(--color-primary); }
    .btn-danger   { background: var(--color-error);   color: #fff; }
    .btn-danger:hover:not(:disabled)   { background: #991b1b; transform: translateY(-1px); }
    .btn-success  { background: var(--color-success); color: #fff; }
    .btn-success:hover:not(:disabled)  { background: #15803d; transform: translateY(-1px); }
    .btn-warning  { background: var(--color-warning); color: #fff; }
    .btn-warning:hover:not(:disabled)  { background: #b45309; }

    .btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none !important; }
    .btn:active:not(:disabled) { transform: translateY(0); }

    .btn-spinner {
      width: 16px; height: 16px;
      border: 2px solid rgba(255,255,255,0.3);
      border-top-color: #fff; border-radius: 50%;
      animation: spin 0.7s linear infinite;
    }
    .btn-icon-left, .btn-icon-right { display: flex; align-items: center; flex-shrink: 0; }
    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class ButtonComponent {
  @Input() variant:   string  = 'primary';
  @Input() size:      string  = 'md';
  @Input() type:      string  = 'button';
  @Input() loading:   boolean = false;
  @Input() disabled:  boolean = false;
  @Input() fullWidth: boolean = false;
  @Input() icon:      string  = '';
  @Input() iconRight: string  = '';
  @Output() clicked = new EventEmitter<Event>();
}
