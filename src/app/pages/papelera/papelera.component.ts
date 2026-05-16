/** Página: Papelera de documentos eliminados */
import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { SpinnerComponent } from '../../atoms/spinner/spinner.component';
import { AlertComponent } from '../../molecules/alert/alert.component';
import { ModalComponent } from '../../molecules/modal/modal.component';
import { Documento } from '../../models';

@Component({
  selector: 'app-papelera',
  standalone: true,
  imports: [CommonModule, FormsModule, SpinnerComponent, AlertComponent, ModalComponent],
  templateUrl: './papelera.component.html',
  styleUrls: ['./papelera.component.css']
})
export class PapeleraComponent implements OnInit {
  items         = signal<Documento[]>([]);
  loading       = signal(true);
  search        = '';
  alert         = signal<{type:string;message:string}|null>(null);
  confirmDelete = signal<Documento|null>(null);
  saving        = signal(false);

  constructor(private api: ApiService) {}
  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading.set(true);
    this.api.getPapelera().subscribe({
      // Fix: backend devuelve 204 (null) cuando la papelera está vacía
      next:  d  => { this.items.set(d ?? []); this.loading.set(false); },
      error: () => { this.items.set([]); this.alert.set({type:'error', message:'Error cargando papelera'}); this.loading.set(false); }
    });
  }

  get filtered(): Documento[] {
    const s = this.search.toLowerCase();
    // Fix: null safety por si items() es null momentáneamente
    return (this.items() ?? []).filter(d => !s || (d.nombre||'').toLowerCase().includes(s));
  }

  restaurar(id: number): void {
    this.api.restaurarDocumento(id).subscribe({
      next:  () => { this.alert.set({type:'success', message:'Documento restaurado exitosamente'}); this.load(); },
      // Fix: e.error?.message para mostrar el mensaje real del backend
      error: e  => this.alert.set({type:'error', message: e.error?.message || e.message})
    });
  }

  eliminarPermanente(): void {
    const doc = this.confirmDelete();
    if (!doc) return;
    this.saving.set(true);
    this.api.eliminarPermanente(doc.id).subscribe({
      next: () => {
        this.alert.set({type:'success', message:'Documento eliminado permanentemente'});
        this.confirmDelete.set(null);
        this.saving.set(false);
        this.load();
      },
      // Fix: e.error?.message para mostrar el mensaje real del backend
      error: e => {
        this.alert.set({type:'error', message: e.error?.message || e.message});
        this.saving.set(false);
      }
    });
  }

  formatDate(d?: string): string { return d ? new Date(d).toLocaleDateString('es-CO') : '—'; }
  inicial(nombre?: string): string { return (nombre || '?')[0].toUpperCase(); }
}