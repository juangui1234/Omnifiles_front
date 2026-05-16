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
import { Documento, SelectOption } from '../../models';

// Extensiones permitidas por el backend
const EXTENSIONES_PERMITIDAS = ['.pdf', '.docx', '.txt'];

@Component({
  selector: 'app-documentos',
  standalone: true,
  imports: [CommonModule, FormsModule, BadgeComponent, SpinnerComponent, AlertComponent, ModalComponent, SearchBarComponent, SelectComponent],
  templateUrl: './documentos.component.html',
  styleUrls: ['./documentos.component.css']
})
export class DocumentosComponent implements OnInit {
  docs           = signal<Documento[]>([]);
  loading        = signal(true);
  search         = '';
  filterEstado   = '';
  alert          = signal<{type:string; message:string}|null>(null);
  modalCreate    = signal(false);
  modalHistorial = signal<Documento|null>(null);
  historial      = signal<any[]>([]);
  saving         = signal(false);
  file: File|null = null;

  form = { nombre: '', tipoDocumentoId: '', usuarioId: '' };
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
    /**
     * Grave 5 — Fix 1:
     * Se usa getTiposDocumentoActivos() en lugar de getTiposDocumento()
     * para mostrar solo los tipos habilitados en el selector de creación.
     */
    this.api.getTiposDocumentoActivos().subscribe(t =>
      this.tipos.set(t.map(x => ({ value: x.id, label: x.nombre })))
    );
    this.api.getUsuarios().subscribe(u =>
      this.usuarios.set(u.map(x => ({ value: x.id, label: x.nombre || x.email })))
    );
  }

  loadDocs(): void {
    this.loading.set(true);
    this.api.getDocumentos(this.filterEstado ? { estado: this.filterEstado } : {}).subscribe({
      // Fix: backend devuelve 204 (null) cuando no hay documentos
      next:  d  => { this.docs.set(d ?? []); this.loading.set(false); },
      error: () => { this.docs.set([]); this.alert.set({ type: 'error', message: 'Error cargando documentos' }); this.loading.set(false); }
    });
  }

  get filtered(): Documento[] {
    // Fix: null safety por si docs() es null momentáneamente
    return (this.docs() ?? []).filter(d =>
      !this.search || (d.nombre || '').toLowerCase().includes(this.search.toLowerCase())
    );
  }

  onFileChange(e: Event): void {
    const selected = (e.target as HTMLInputElement).files?.[0] || null;

    /**
     * Grave 5 — Fix 2:
     * Validar extensión en el frontend antes de enviar.
     * El backend solo acepta .pdf, .docx, .txt — si se manda otro
     * formato devuelve 400 sin mensaje claro al usuario.
     */
    if (selected) {
      const nombre = selected.name.toLowerCase();
      const valida = EXTENSIONES_PERMITIDAS.some(ext => nombre.endsWith(ext));
      if (!valida) {
        this.alert.set({ type: 'error', message: 'Solo se permiten archivos PDF, DOCX o TXT' });
        (e.target as HTMLInputElement).value = '';
        this.file = null;
        return;
      }
    }
    this.file = selected;
  }

  crearDocumento(): void {
    if (!this.form.nombre || !this.form.tipoDocumentoId || !this.form.usuarioId) {
      this.alert.set({ type: 'error', message: 'Completa los campos obligatorios' });
      return;
    }
    this.saving.set(true);

    /**
     * Grave 5 — Fix 3:
     * DocumentoDTO del backend no tiene campo "observaciones".
     * Se elimina del payload para evitar campos ignorados silenciosamente.
     */
    this.api.crearDocumento({
      nombre:          this.form.nombre,
      tipoDocumentoId: +this.form.tipoDocumentoId,
      usuarioId:       +this.form.usuarioId
    }).subscribe({
      next: (doc) => {
        if (this.file) {
          this.api.subirArchivo(doc.id, this.file).subscribe({
            next:  () => this.afterCreate(),
            /**
             * Grave 5 — Fix 4:
             * Si el upload falla, el documento ya fue creado.
             * Se notifica el error pero igual se refresca la lista
             * para que el documento aparezca (sin archivo).
             */
            error: e  => {
              this.alert.set({ type: 'error', message: e.error?.message || 'El documento se creó pero hubo un error al subir el archivo' });
              this.saving.set(false);
              this.modalCreate.set(false);
              this.loadDocs();
            }
          });
        } else {
          this.afterCreate();
        }
      },
      /**
       * Grave 5 — Fix 5:
       * Error al crear lee e.error?.message (mensaje real del backend)
       * en lugar de e.message (error genérico de JS).
       */
      error: (e) => {
        this.alert.set({ type: 'error', message: e.error?.message || e.message || 'Error al crear documento' });
        this.saving.set(false);
      }
    });
  }

  afterCreate(): void {
    this.saving.set(false);
    this.modalCreate.set(false);
    this.form = { nombre: '', tipoDocumentoId: '', usuarioId: '' };
    this.file = null;
    /**
     * Grave 5 — Fix 6:
     * Se recarga la lista después de crear para reflejar el estado real
     * del documento. Si tenía flujo configurado el backend lo pone en
     * EN_REVISION automáticamente, no en CREADO.
     */
    this.loadDocs();
    this.alert.set({ type: 'success', message: 'Documento creado exitosamente' });
  }

  eliminar(id: number): void {
    if (!confirm('¿Enviar a papelera?')) return;
    this.api.eliminarDocumento(id).subscribe({
      next:  () => { this.alert.set({ type: 'success', message: 'Enviado a papelera' }); this.loadDocs(); },
      error: e  => this.alert.set({ type: 'error', message: e.error?.message || e.message })
    });
  }

  verHistorial(doc: Documento): void {
    this.modalHistorial.set(doc);
    this.api.getHistorial(doc.id).subscribe({
      next:  h  => this.historial.set(h),
      error: () => this.historial.set([])
    });
  }

  formatDate(d?: string): string {
    return d ? new Date(d).toLocaleDateString('es-CO') : '—';
  }
}