/** Template: Layout principal de páginas protegidas */
import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { filter, map } from 'rxjs';
import { SidebarComponent } from '../../organisms/sidebar/sidebar.component';
import { TopbarComponent } from '../../organisms/topbar/topbar.component';

@Component({
  selector: 'app-app-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent, TopbarComponent],
  template: `
    <div class="layout">
      <app-sidebar
        [collapsed]="collapsed()"
        (loggedOut)="onLogout()">
      </app-sidebar>
      <div class="layout-main">
        <app-topbar
          [route]="currentRoute()"
          (toggled)="collapsed.set(!collapsed())">
        </app-topbar>
        <main class="layout-content">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
  styles: [`
    .layout { display: flex; min-height: 100vh; background: var(--color-bg); }
    .layout-main { flex: 1; display: flex; flex-direction: column; min-width: 0; overflow: hidden; }
    .layout-content { flex: 1; padding: 24px; overflow-y: auto; animation: fadeIn 0.2s ease; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
  `]
})
export class AppLayoutComponent {
  collapsed    = signal(false);
  currentRoute = signal('dashboard');

  constructor(private router: Router) {
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd),
      map(e => (e as NavigationEnd).urlAfterRedirects.split('/').pop() || 'dashboard')
    ).subscribe(r => this.currentRoute.set(r));
  }

  onLogout(): void {
    this.router.navigate(['/login']);
  }
}
