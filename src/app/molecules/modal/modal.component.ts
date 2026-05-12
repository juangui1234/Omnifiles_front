/** Molécula: Modal dialog con overlay */
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="open" class="overlay" (click)="onOverlayClick($event)">
      <div [class]="'modal modal-' + size">
        <div class="modal-header">
          <h3 class="modal-title">{{ title }}</h3>
          <button class="modal-close" (click)="closed.emit()">✕</button>
        </div>
        <div class="modal-body"><ng-content></ng-content></div>
        <div *ngIf="hasFooter" class="modal-footer"><ng-content select="[footer]"></ng-content></div>
      </div>
    </div>
  `,
  styles: [`
    .overlay { position: fixed; inset: 0; background: rgba(15,23,42,0.5); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 16px; animation: fadeIn 0.15s ease; }
    .modal { background: var(--color-surface); border-radius: var(--radius-2xl); box-shadow: var(--shadow-xl); display: flex; flex-direction: column; max-height: 90vh; width: 100%; animation: scaleIn 0.15s ease; }
    .modal-sm { max-width: 400px; }
    .modal-md { max-width: 560px; }
    .modal-lg { max-width: 720px; }
    .modal-xl { max-width: 900px; }
    .modal-header { display: flex; align-items: center; justify-content: space-between; padding: 20px 24px; border-bottom: 1px solid var(--color-border); }
    .modal-title  { font-size: var(--text-lg); font-weight: var(--weight-bold); color: var(--color-primary); font-family: var(--font-display); }
    .modal-close  { width: 32px; height: 32px; border: none; background: var(--color-surface-2); border-radius: var(--radius-md); cursor: pointer; color: var(--color-secondary); font-size: 16px; transition: all var(--transition-fast); }
    .modal-close:hover { background: var(--color-border); color: var(--color-error); }
    .modal-body   { padding: 24px; overflow-y: auto; flex: 1; }
    .modal-footer { padding: 16px 24px; border-top: 1px solid var(--color-border); display: flex; justify-content: flex-end; gap: 12px; }
    @keyframes fadeIn  { from { opacity: 0; } to { opacity: 1; } }
    @keyframes scaleIn { from { opacity: 0; transform: scale(0.96); } to { opacity: 1; transform: scale(1); } }
  `]
})
export class ModalComponent {
  @Input() open:      boolean = false;
  @Input() title:     string  = '';
  @Input() size:      string  = 'md';
  @Input() hasFooter: boolean = true;
  @Output() closed = new EventEmitter<void>();

  onOverlayClick(e: MouseEvent): void {
    if ((e.target as HTMLElement).classList.contains('overlay')) this.closed.emit();
  }
}
