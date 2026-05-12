/** Página: Dashboard */
import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { StatCardComponent } from '../../molecules/stat-card/stat-card.component';
import { BadgeComponent } from '../../atoms/badge/badge.component';
import { SpinnerComponent } from '../../atoms/spinner/spinner.component';
import { Documento, Tarea } from '../../models';

const ICONS = {
  doc:   '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>',
  check: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
  clock: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
  x:     '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
  file:  '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>',
  plus:  '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
};

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, StatCardComponent, BadgeComponent, SpinnerComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  loading  = signal(true);
  docs     = signal<Documento[]>([]);
  tareas   = signal<Tarea[]>([]);
  user     = this.auth.user;
  icons    = ICONS;

  get stats() {
    const d = this.docs();
    return {
      total:      d.length,
      aprobados:  d.filter(x => x.estado === 'APROBADO').length,
      enRevision: d.filter(x => x.estado === 'EN_REVISION').length,
      rechazados: d.filter(x => x.estado === 'RECHAZADO').length,
    };
  }

  get recent(): Documento[] {
    return [...this.docs()].sort((a,b) => new Date(b.fechaCreacion||0).getTime() - new Date(a.fechaCreacion||0).getTime()).slice(0, 5);
  }

  constructor(private api: ApiService, private auth: AuthService, private router: Router) {}

  ngOnInit(): void {
    const uid = this.user()?.id;
    Promise.all([
      this.api.getDocumentos().toPromise().catch(() => []),
      uid ? this.api.getTareasPendientes(uid).toPromise().catch(() => []) : Promise.resolve([]),
    ]).then(([d, t]) => {
      this.docs.set(Array.isArray(d) ? d : []);
      this.tareas.set(Array.isArray(t) ? t : []);
      this.loading.set(false);
    });
  }

  formatDate(d?: string): string { return d ? new Date(d).toLocaleDateString('es-CO') : '—'; }
  goDocumentos(): void { this.router.navigate(['/app/documentos']); }
  goTareas():     void { this.router.navigate(['/app/tareas']); }
}
