/** Organismo: Navbar pública de la Landing Page */
import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <nav class="navbar">
      <div class="navbar-logo">
        <div class="logo-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
        </div>
        <span class="logo-name">OmniFiles</span>
      </div>
      <button class="login-btn" (click)="loginClicked.emit()">Iniciar Sesión</button>
    </nav>
  `,
  styles: [`
    .navbar { display: flex; align-items: center; justify-content: space-between; padding: 16px 40px; background: var(--color-surface); border-bottom: 1px solid var(--color-border); position: sticky; top: 0; z-index: 100; }
    .navbar-logo { display: flex; align-items: center; gap: 8px; }
    .logo-icon   { width: 36px; height: 36px; background: var(--color-primary); border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; }
    .logo-name   { font-size: var(--text-lg); font-weight: var(--weight-bold); color: var(--color-primary); font-family: var(--font-display); }
    .login-btn   { padding: 10px 20px; background: var(--color-primary-light); color: #fff; border: none; border-radius: var(--radius-md); font-size: var(--text-sm); font-weight: var(--weight-semibold); font-family: var(--font-body); cursor: pointer; box-shadow: var(--shadow-primary); transition: all var(--transition-base); }
    .login-btn:hover { background: var(--color-primary); transform: translateY(-1px); }
  `]
})
export class NavbarComponent {
  @Output() loginClicked = new EventEmitter<void>();
}

// ─── Footer ──────────────────────────────────────────────────────────────────
/** Organismo: Footer de la Landing Page */
@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <footer class="footer">
      <div class="footer-logo">
        <div class="logo-icon">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
        </div>
        <span>OmniFiles</span>
      </div>
      <span>© {{ year }} OmniFiles — Sistema de Gestión Documental</span>
    </footer>
  `,
  styles: [`
    .footer { background: var(--color-primary-dark); border-top: 1px solid rgba(255,255,255,0.08); padding: 20px 40px; display: flex; align-items: center; justify-content: space-between; font-size: var(--text-sm); color: rgba(255,255,255,0.4); }
    .footer-logo { display: flex; align-items: center; gap: 8px; font-weight: var(--weight-semibold); color: rgba(255,255,255,0.7); }
    .logo-icon   { width: 28px; height: 28px; background: var(--color-primary-light); border-radius: var(--radius-sm); display: flex; align-items: center; justify-content: center; }
  `]
})
export class FooterComponent {
  year = new Date().getFullYear();
}
