/**
 * auditoria.component.ts
 *
 * Muestra el log de trazabilidad generado por el auditInterceptor.
 * Solo accesible para ADMIN.
 */
import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SearchBarComponent } from '../../molecules/search-bar/search-bar.component';
import { SelectComponent } from '../../atoms/select/select.component';
import { AuditEntry, getAuditLog, clearAuditLog } from '../../interceptors/audit.interceptor';
import { SelectOption } from '../../models';

@Component({
  selector: 'app-auditoria',
  standalone: true,
  imports: [CommonModule, FormsModule, SearchBarComponent, SelectComponent],
  templateUrl: './auditoria.component.html',
  styleUrls: ['./auditoria.component.css']
})
export class AuditoriaComponent implements OnInit {

  entries  = signal<AuditEntry[]>([]);
  search   = '';
  filtroResultado = '';

  resultadoOptions: SelectOption[] = [
    { value: 'EXITOSO', label: 'Exitoso' },
    { value: 'FALLIDO', label: 'Fallido' },
  ];

  ngOnInit(): void {
    this.entries.set(getAuditLog());
  }

  get filtered(): AuditEntry[] {
    return this.entries().filter(e => {
      const coincideBusqueda = !this.search ||
        e.accion.toLowerCase().includes(this.search.toLowerCase()) ||
        e.usuario.toLowerCase().includes(this.search.toLowerCase());
      const coincideResultado = !this.filtroResultado || e.resultado === this.filtroResultado;
      return coincideBusqueda && coincideResultado;
    });
  }

  limpiarLog(): void {
    if (!confirm('¿Limpiar todo el registro de auditoría de esta sesión?')) return;
    clearAuditLog();
    this.entries.set([]);
  }

  formatDate(iso: string): string {
    return new Date(iso).toLocaleString('es-CO', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    });
  }
}