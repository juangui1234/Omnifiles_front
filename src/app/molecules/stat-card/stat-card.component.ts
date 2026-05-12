import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [class]="'stat-card stat-' + color">
      <div class="stat-top">
        <div class="stat-icon" [innerHTML]="iconSvg"></div>
        <span *ngIf="trend !== undefined" [class]="'stat-trend ' + (trend >= 0 ? 'up' : 'down')">
          {{ trend >= 0 ? '↑' : '↓' }} {{ abs(trend) }}%
        </span>
      </div>
      <div class="stat-value">{{ value }}</div>
      <div class="stat-label">{{ label }}</div>
    </div>
  `,
  styles: [`
    .stat-card { background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-xl); padding: 20px; display: flex; flex-direction: column; gap: 8px; transition: all 200ms ease; }
    .stat-card:hover { transform: translateY(-2px); box-shadow: var(--shadow-md); }
    .stat-top  { display: flex; align-items: flex-start; justify-content: space-between; }
    .stat-icon { width: 44px; height: 44px; border-radius: var(--radius-lg); display: flex; align-items: center; justify-content: center; }
    .stat-primary .stat-icon { background: #DBEAFE; color: var(--color-primary); }
    .stat-success .stat-icon { background: var(--color-success-bg); color: var(--color-success); }
    .stat-warning .stat-icon { background: var(--color-warning-bg); color: var(--color-warning); }
    .stat-danger  .stat-icon { background: var(--color-error-bg); color: var(--color-error); }
    .stat-info    .stat-icon { background: var(--color-info-bg); color: var(--color-info); }
    .stat-value { font-size: 28px; font-weight: 700; font-family: var(--font-display); color: var(--color-primary); line-height: 1; }
    .stat-label { font-size: 14px; color: #94A3B8; font-weight: 500; }
    .stat-trend { font-size: 12px; font-weight: 600; padding: 2px 8px; border-radius: 9999px; }
    .up   { background: var(--color-success-bg); color: var(--color-success); }
    .down { background: var(--color-error-bg); color: var(--color-error); }
  `]
})
export class StatCardComponent {
  @Input() label:   string = '';
  @Input() value:   any    = 0;
  @Input() color:   string = 'primary';
  @Input() trend?:  number;
  @Input() iconSvg: string = '';
  abs = Math.abs;
}
