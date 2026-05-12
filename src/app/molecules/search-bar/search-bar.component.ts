import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="search-wrapper">
      <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
      <input class="search-input" type="search" [placeholder]="placeholder" [ngModel]="value" (ngModelChange)="value=$event; searched.emit($event)" />
    </div>
  `,
  styles: [`
    .search-wrapper { position: relative; display: flex; align-items: center; }
    .search-icon    { position: absolute; left: 12px; color: #94A3B8; pointer-events: none; }
    .search-input   { padding: 9px 12px 9px 38px; border: 1.5px solid var(--color-border); border-radius: var(--radius-md); background: var(--color-surface); font-size: var(--text-sm); font-family: var(--font-body); color: var(--color-secondary); outline: none; transition: all 200ms ease; min-width: 240px; }
    .search-input:focus { border-color: var(--color-primary-light); box-shadow: 0 0 0 3px rgba(37,99,235,0.1); }
    .search-input::placeholder { color: #94A3B8; }
  `]
})
export class SearchBarComponent {
  @Input()  placeholder: string = 'Buscar...';
  @Input()  value:       string = '';
  @Output() searched = new EventEmitter<string>();
}
