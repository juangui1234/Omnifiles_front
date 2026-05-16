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
  logs         = signal<HistorialDocumento[]>([]);
  loading      = signal(true);
  search       = '';
  filterAccion = '';
  alert        = signal<{type:string;message:string}|null>(null);

  readonly ACCION_BADGE: Record<string, string> = {
    CREACION:       'info',
    APROBAC:        'success',
    FLUJO_COMPLETO: 'success',
    ETAPA_APROBADA: 'success',
    RECHAZO:        'danger',
    ETAPA_RECHAZADA:'danger',
    CORRECC:        'warning',
    CAMBIO_ESTADO:  'warning',
    ELIMINA:        'danger',
    RESTAURA:       'success',
    DESCARGA:       'info',
    ACTUALIZA:      'info',
  };

  constructor(private api: ApiService) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading.set(true);
    this.api.getDocumentos().subscribe({
      next: async (docs) => {
        const slice = docs.slice(0, 20);
        const results = await Promise.allSettled(
          slice.map(d =>
            this.api.getHistorial(d.id).toPromise()
              /**
               * Fix: el backend devuelve { id, documentoId, usuarioId, estado, accion, fechaCambio }
               * No existe documentoNombre ni usuarioNombre — se enriquece con documentoId
               * que ya viene en el DTO, no hace falta inyectarlo manualmente.
               */
              .then(h => (h || []))
          )
        );
        const flat: HistorialDocumento[] = [];
        results.forEach(r => {
          if (r.status === 'fulfilled') flat.push(...(r.value as HistorialDocumento[]));
        });

        /**
         * Fix: ordenar por fechaCambio, no por fechaAccion que no existe en el modelo.
         */
        flat.sort((a, b) =>
          new Date(b.fechaCambio || 0).getTime() - new Date(a.fechaCambio || 0).getTime()
        );
        this.logs.set(flat);
        this.loading.set(false);
      },
      error: () => {
        this.alert.set({type:'error', message:'Error cargando auditoría'});
        this.loading.set(false);
      }
    });
  }

  get filtered(): HistorialDocumento[] {
    const s = this.search.toLowerCase();
    const f = this.filterAccion;
    return this.logs().filter(l => {
      /**
       * Fix: documentoNombre y usuarioNombre no existen.
       * Se busca por documentoId, usuarioId y accion.
       */
      const matchS = !s || [
        String(l.documentoId || ''),
        String(l.usuarioId   || ''),
        l.accion || ''
      ].some(v => v.toLowerCase().includes(s));
      const matchF = !f || (l.accion || '').includes(f);
      return matchS && matchF;
    });
  }

  get stats() {
    const l = this.logs();
    const hoy = new Date().toDateString();
    return {
      total:        l.length,
      /**
       * Fix: usar fechaCambio en lugar de fechaAccion.
       */
      hoy:          l.filter(x => x.fechaCambio && new Date(x.fechaCambio).toDateString() === hoy).length,
      aprobaciones: l.filter(x => (x.accion || '').includes('APROBAC') || (x.accion || '').includes('FLUJO_COMPLETO')).length,
      rechazos:     l.filter(x => (x.accion || '').includes('RECHAZO') || (x.accion || '').includes('RECHAZADA')).length,
    };
  }

  badgeVariant(accion: string): string {
    const key = Object.keys(this.ACCION_BADGE).find(k => (accion || '').includes(k));
    return key ? this.ACCION_BADGE[key] : 'neutral';
  }

  formatDate(d?: string): string  { return d ? new Date(d).toLocaleDateString('es-CO') : '—'; }
  formatTime(d?: string): string  { return d ? new Date(d).toLocaleTimeString('es-CO', {hour:'2-digit', minute:'2-digit'}) : ''; }
  inicial(id?: number): string    { return id ? String(id)[0] : '?'; }
}