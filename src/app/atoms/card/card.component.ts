/** Átomo: Card contenedor */
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [class]="'card card-' + padding + (hover ? ' card-hover' : '')" (click)="clicked.emit()">
      <ng-content></ng-content>
    </div>
  `,
  styles: [`
    .card { background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-xl); box-shadow: var(--shadow-sm); transition: all var(--transition-base); }
    .card-sm  { padding: var(--space-4); }
    .card-md  { padding: var(--space-6); }
    .card-lg  { padding: var(--space-8); }
    .card-none{ padding: 0; }
    .card-hover:hover { border-color: var(--color-primary-light); box-shadow: var(--shadow-md); transform: translateY(-2px); cursor: pointer; }
  `]
})
export class CardComponent {
  @Input() padding: string  = 'md';
  @Input() hover:   boolean = false;
  @Output() clicked = new EventEmitter<void>();
}
