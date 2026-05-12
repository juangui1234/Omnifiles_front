/** Página: Auditoría del Sistema */
import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { BadgeComponent } from '../../atoms/badge/badge.component';
import { SpinnerComponent } from '../../atoms/spinner/spinner.component';
import { AlertComponent } from '../../molecules/alert/alert.component';
import { HistorialDocumento } from '../../models';

@Component({
  selector: 'app-auditoria',
  standalone: true,
  imports: [CommonModule, FormsModule, BadgeComponent, SpinnerComponent, AlertComponent],
  templateUrl: './auditoria.component.html',
  styleUrls: ['./auditoria.component.css']
})
export class AuditoriaComponent implements OnInit {
  logs        = signal<HistorialDocumento[]>([]);
  loading     = signal(true);
  search      = '';
  filterAccion = '';
  alert       = signal<{type:string;message:string}|null>(null);

  readonly ACCION_BADGE: Record<string, string> = {
    CREACION: 'info', APROBAC: 'success', RECHAZO: 'danger',
    CORRECC: 'warning', ELIMINA: 'danger', RESTAURA: 'success',
  };

  constructor(private api: ApiService) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading.set(true);
    this.api.getDocumentos().subscribe({
      next: async (docs) => {
        const slice = docs.slice(0, 20);
        const results = await Promise.allSettled(
          slice.map(d => this.api.getHistorial(d.id).toPromise().then(h => (h||[]).map((x:any) => ({ ...x, documentoId: d.id, documentoNombre: d.nombre }))))
        );
        const flat: HistorialDocumento[] = [];
        results.forEach(r => { if (r.status === 'fulfilled') flat.push(...(r.value as any[])); });
        flat.sort((a,b) => new Date(b.fechaAccion||0).getTime() - new Date(a.fechaAccion||0).getTime());
        this.logs.set(flat);
        this.loading.set(false);
      },
      error: () => { this.alert.set({type:'error',message:'Error cargando auditoría'}); this.loading.set(false); }
    });
  }

  get filtered(): HistorialDocumento[] {
    const s = this.search.toLowerCase();
    const f = this.filterAccion;
    return this.logs().filter(l => {
      const matchS = !s || [l.documentoNombre, l.usuarioNombre, l.accion].some(v => (v||'').toLowerCase().includes(s));
      const matchF = !f || (l.accion||'').includes(f);
      return matchS && matchF;
    });
  }

  get stats() {
    const l = this.logs();
    const hoy = new Date().toDateString();
    return {
      total:       l.length,
      hoy:         l.filter(x => x.fechaAccion && new Date(x.fechaAccion).toDateString() === hoy).length,
      aprobaciones:l.filter(x => (x.accion||'').includes('APROBAC')).length,
      rechazos:    l.filter(x => (x.accion||'').includes('RECHAZO')).length,
    };
  }

  badgeVariant(accion: string): string {
    const key = Object.keys(this.ACCION_BADGE).find(k => (accion||'').includes(k));
    return key ? this.ACCION_BADGE[key] : 'neutral';
  }

  formatDate(d?: string): string  { return d ? new Date(d).toLocaleDateString('es-CO') : '—'; }
  formatTime(d?: string): string  { return d ? new Date(d).toLocaleTimeString('es-CO', {hour:'2-digit',minute:'2-digit'}) : ''; }
  inicial(nombre?: string): string{ return (nombre||'?')[0].toUpperCase(); }
}
