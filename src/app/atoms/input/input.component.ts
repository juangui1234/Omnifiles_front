/** Átomo: Campo de texto con label, error e iconos */
import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, ReactiveFormsModule, FormsModule } from '@angular/forms';

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => InputComponent),
    multi: true
  }],
  template: `
    <div class="input-wrapper" [class.full]="fullWidth">
      <label *ngIf="label" [for]="inputId" class="input-label">{{ label }}</label>
      <div class="input-field" [class.has-error]="error">
        <span *ngIf="icon" class="input-icon-left" [innerHTML]="icon"></span>
        <input
          [id]="inputId"
          [type]="type"
          [placeholder]="placeholder"
          [disabled]="disabled"
          [class]="'input input-' + size + (icon ? ' with-icon-left' : '') + (iconRight ? ' with-icon-right' : '')"
          [(ngModel)]="value"
          (ngModelChange)="onChange($event)"
          (blur)="onTouched()" />
        <span *ngIf="iconRight" class="input-icon-right" [innerHTML]="iconRight"></span>
      </div>
      <span *ngIf="error" class="input-error">{{ error }}</span>
      <span *ngIf="hint && !error" class="input-hint">{{ hint }}</span>
    </div>
  `,
  styles: [`
    .input-wrapper { display: flex; flex-direction: column; gap: 4px; }
    .full { width: 100%; }
    .input-label { font-size: var(--text-sm); font-weight: var(--weight-medium); color: var(--color-secondary); }
    .input-field  { position: relative; display: flex; align-items: center; }
    .input {
      width: 100%; border: 1.5px solid var(--color-border); border-radius: var(--radius-md);
      background: var(--color-surface); color: var(--color-secondary);
      transition: all var(--transition-base); outline: none;
    }
    .input:focus { border-color: var(--color-primary-light); box-shadow: 0 0 0 3px rgba(37,99,235,0.1); }
    .input::placeholder { color: #94A3B8; }
    .input-sm { padding: 8px 12px;  font-size: var(--text-sm); }
    .input-md { padding: 10px 12px; font-size: var(--text-sm); }
    .input-lg { padding: 12px 16px; font-size: var(--text-base); }
    .with-icon-left  { padding-left: 38px; }
    .with-icon-right { padding-right: 38px; }
    .input-icon-left, .input-icon-right { position: absolute; display: flex; align-items: center; color: #94A3B8; pointer-events: none; }
    .input-icon-left  { left: 12px; }
    .input-icon-right { right: 12px; }
    .has-error .input { border-color: var(--color-error); }
    .input-error { font-size: var(--text-xs); color: var(--color-error); font-weight: var(--weight-medium); }
    .input-hint  { font-size: var(--text-xs); color: #94A3B8; }
  `]
})
export class InputComponent implements ControlValueAccessor {
  @Input() label:      string  = '';
  @Input() inputId:    string  = '';
  @Input() type:       string  = 'text';
  @Input() placeholder:string  = '';
  @Input() error:      string  = '';
  @Input() hint:       string  = '';
  @Input() icon:       string  = '';
  @Input() iconRight:  string  = '';
  @Input() size:       string  = 'md';
  @Input() fullWidth:  boolean = true;
  @Input() disabled:   boolean = false;

  value: any = '';
  onChange  = (_: any) => {};
  onTouched = () => {};

  writeValue(v: any)             { this.value = v; }
  registerOnChange(fn: any)      { this.onChange = fn; }
  registerOnTouched(fn: any)     { this.onTouched = fn; }
  setDisabledState(d: boolean)   { this.disabled = d; }
}
