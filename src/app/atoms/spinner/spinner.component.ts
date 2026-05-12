/** Átomo: Spinner de carga */
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-spinner',
  standalone: true,
  template: `<div class="spinner" [style.width.px]="size" [style.height.px]="size"></div>`,
  styles: [`
    .spinner { border: 3px solid var(--color-border); border-top-color: var(--color-primary-light); border-radius: 50%; animation: spin 0.7s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class SpinnerComponent {
  @Input() size: number = 32;
}
