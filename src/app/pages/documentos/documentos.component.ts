import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { BadgeComponent } from '../../atoms/badge/badge.component';
import { SpinnerComponent } from '../../atoms/spinner/spinner.component';
import { AlertComponent } from '../../molecules/alert/alert.component';
import { ModalComponent } from '../../molecules/modal/modal.component';
import { SearchBarComponent } from '../../molecules/search-bar/search-bar.component';
import { SelectComponent } from '../../atoms/select/select.component';
import { InputComponent } from '../../atoms/input/input.component';
import { Documento, SelectOption } from '../../models';

@Component({
  selector: 'app-documentos',
  standalone: true,
  imports: [CommonModule, FormsModule, BadgeComponent, SpinnerComponent, AlertComponent, ModalComponent, SearchBarComponent, SelectComponent, InputComponent],
  templateUrl: './documentos.component.html',
  styleUrls: ['./documentos.component.css']
})
export class DocumentosComponent implements OnInit {
  docs         = signal<Documento[]>([]);
  loading      = signal(true);
  search       = '';
  filterEstado = '';
  alert        = signal<{type:string; message:string}|null>(null);
  modalCreate  = signal(false);
  modalHistorial = signal<Documento|null>(null);
  historial    = signal<any[]>([]);
  saving       = signal(false);
  file: File|null = null;

  form = { nombre: '', tipoDocumentoId: '', usuarioId: '', observaciones: '' };
  tipos    = signal<SelectOption[]>([]);
  usuarios = signal<SelectOption[]>([]);

  estadoOptions: SelectOption[] = [
    { value: 'CREADO',      label: 'Creado'      },
    { value: 'EN_REVISION', label: 'En revisión' },
    { value: 'APROBADO',    label: 'Aprobado'    },
    { value: 'RECHAZADO',   label: 'Rechazado'   },
  ];

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loadDocs();
    this.api.getTiposDocumento().subscribe(t => this.tipos.set(t.map(x => ({ value: x.id, label: x.nombre }))));
    this.api.getUsuarios().subscribe(u => this.usuarios.set(u.map(x => ({ value: x.id, label: x.nombre || x.email }))));
  }

  loadDocs(): void {
    this.loading.set(true);
    this.api.getDocumentos(this.filterEstado ? { estado: this.filterEstado } : {}).subscribe({
      next:  d  => { this.docs.set(d); this.loading.set(false); },
      error: () => { this.alert.set({ type: 'error', message: 'Error cargando documentos' }); this.loading.set(false); }
    });
  }

  get filtered(): Documento[] {
    return this.docs().filter(d => !this.search || (d.nombre||'').toLowerCase().includes(this.search.toLowerCase()));
  }

  onFileChange(e: Event): void {
    this.file = (e.target as HTMLInputElement).files?.[0] || null;
  }

  crearDocumento(): void {
    if (!this.form.nombre || !this.form.tipoDocumentoId || !this.form.usuarioId) {
      this.alert.set({ type: 'error', message: 'Completa los campos obligatorios' }); return;
    }
    this.saving.set(true);
    this.api.crearDocumento({
      nombre: this.form.nombre,
      tipoDocumentoId: +this.form.tipoDocumentoId,
      usuarioId: +this.form.usuarioId,
      observaciones: this.form.observaciones
    }).subscribe({
      next: (doc) => {
        if (this.file) {
          this.api.subirArchivo(doc.id, this.file).subscribe(() => this.afterCreate());
        } else { this.afterCreate(); }
      },
      error: (e) => { this.alert.set({ type: 'error', message: e.message }); this.saving.set(false); }
    });
  }

  afterCreate(): void {
    this.saving.set(false);
    this.modalCreate.set(false);
    this.form = { nombre: '', tipoDocumentoId: '', usuarioId: '', observaciones: '' };
    this.file = null;
    this.alert.set({ type: 'success', message: 'Documento creado exitosamente' });
    this.loadDocs();
  }

  eliminar(id: number): void {
    if (!confirm('¿Enviar a papelera?')) return;
    this.api.eliminarDocumento(id).subscribe({
      next:  () => { this.alert.set({ type: 'success', message: 'Enviado a papelera' }); this.loadDocs(); },
      error: e  => this.alert.set({ type: 'error', message: e.message })
    });
  }

  verHistorial(doc: Documento): void {
    this.modalHistorial.set(doc);
    this.api.getHistorial(doc.id).subscribe({
      next:  h  => this.historial.set(h),
      error: () => this.historial.set([])
    });
  }

  formatDate(d?: string): string { return d ? new Date(d).toLocaleDateString('es-CO') : '—'; }
}
