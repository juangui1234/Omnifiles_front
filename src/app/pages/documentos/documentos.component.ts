import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { BadgeComponent } from '../../atoms/badge/badge.component';
import { SpinnerComponent } from '../../atoms/spinner/spinner.component';
import { AlertComponent } from '../../molecules/alert/alert.component';
import { ModalComponent } from '../../molecules/modal/modal.component';
import { SearchBarComponent } from '../../molecules/search-bar/search-bar.component';
import { SelectComponent } from '../../atoms/select/select.component';
import { Documento, SelectOption } from '../../models';

const EXTENSIONES_PERMITIDAS = ['.pdf', '.docx', '.txt'];

interface TipoDocumento  { id: number; nombre: string; descripcion?: string; flujoConfigurado?: boolean; }
interface EtapaFlujo     { id?: number; orden: number; nombre: string; rolNombre?: string; usuarioId?: number; usuarioNombre?: string; }
interface Flujo          { id: number; nombre: string; tipoDocumentoId?: number; etapas?: EtapaFlujo[]; }

@Component({
  selector: 'app-documentos',
  standalone: true,
  imports: [CommonModule, FormsModule, BadgeComponent, SpinnerComponent, AlertComponent, ModalComponent, SearchBarComponent, SelectComponent],
  templateUrl: './documentos.component.html',
  styleUrls: ['./documentos.component.css']
})
export class DocumentosComponent implements OnInit {

  // — Lista —
  docs         = signal<Documento[]>([]);
  loading      = signal(true);
  search       = '';
  filterEstado = '';
  alert        = signal<{type:string; message:string}|null>(null);

  // — Historial —
  modalHistorial = signal<Documento|null>(null);
  historial      = signal<any[]>([]);

  // — Crear documento —
  modalCreate  = signal(false);
  saving       = signal(false);
  file: File|null = null;

  // Step 1: tipo
  tiposRaw   = signal<TipoDocumento[]>([]);
  tipoSelId  = signal<number|null>(null);
  get tipoSel() { return this.tiposRaw().find(t => t.id === this.tipoSelId()); }

  // Step 2: subtipo
  subtipos   = signal<string[]>([]);
  subtipoSel = signal<string|null>(null);

  // Step 3: flujo
  flujos        = signal<Flujo[]>([]);
  flujoSelId    = signal<number|null>(null);
  etapasFlujo   = signal<EtapaFlujo[]>([]);
  loadingFlujo  = signal(false);
  get flujoSel() { return this.flujos().find(f => f.id === this.flujoSelId()); }

  // Step 4: datos
  form = { nombre: '' };

  // — Corregir documento —
  modalCorregir  = signal<Documento|null>(null);
  fileCorre: File|null = null;
  savingCorreccion = signal(false);

  esCreador(doc: Documento): boolean {
    const userId = this.auth.user()?.id ?? 0;
    return doc.usuarioId === userId || this.auth.isAdmin();
  }

  abrirModalCorregir(doc: Documento): void {
    this.fileCorre = null;
    this.modalCorregir.set(doc);
  }

  onFileCorreccionChange(e: Event): void {
    const selected = (e.target as HTMLInputElement).files?.[0] || null;
    if (selected) {
      const valida = EXTENSIONES_PERMITIDAS.some(ext => selected.name.toLowerCase().endsWith(ext));
      if (!valida) {
        this.alert.set({ type: 'error', message: 'Solo se permiten archivos PDF, DOCX o TXT' });
        (e.target as HTMLInputElement).value = '';
        this.fileCorre = null;
        return;
      }
    }
    this.fileCorre = selected;
  }

  reenviarAlFlujo(): void {
    const doc = this.modalCorregir();
    if (!doc || !this.fileCorre) {
      this.alert.set({ type: 'error', message: 'Debes adjuntar el archivo corregido' });
      return;
    }
    this.savingCorreccion.set(true);
    this.api.subirArchivo(doc.id, this.fileCorre).subscribe({
      next: () => {
        this.api.reenviarAlFlujo(doc.id).subscribe({
          next: () => {
            this.savingCorreccion.set(false);
            this.modalCorregir.set(null);
            this.fileCorre = null;
            this.loadDocs();
            this.alert.set({ type: 'success', message: 'Documento reenviado al flujo de aprobación' });
          },
          error: (e: any) => {
            this.alert.set({ type: 'error', message: e.error?.message || 'Error al reenviar al flujo' });
            this.savingCorreccion.set(false);
          }
        });
      },
      error: (e: any) => {
        this.alert.set({ type: 'error', message: e.error?.message || 'Error al subir el archivo' });
        this.savingCorreccion.set(false);
      }
    });
  }

  // — Crear flujo —
  modalFlujo   = signal(false);
  savingFlujo  = signal(false);
  flujoForm    = { nombre: '' };
  etapasNuevas: {nombre: string; rolId: number; usuarioId: number}[] = [];
  usuarios     = signal<any[]>([]);
  roles        = [
    { id: 3, nombre: 'REVISOR'   },
    { id: 4, nombre: 'APROBADOR' },
    { id: 5, nombre: 'FIRMANTE'  },
  ];

  estadoOptions: SelectOption[] = [
    { value: 'CREADO',      label: 'Creado'      },
    { value: 'EN_REVISION', label: 'En revisión' },
    { value: 'APROBADO',    label: 'Aprobado'    },
    { value: 'RECHAZADO',   label: 'Rechazado'   },
  ];

  private readonly SUBTIPOS: Record<number, string[]> = {
    2: ['Contrato laboral', 'Contrato comercial', 'Contrato de arriendo'],
  };

  canCreate = false;

  constructor(private api: ApiService, public auth: AuthService) {}

  ngOnInit(): void {
    this.loadDocs();
    this.api.getTiposDocumentoActivos().subscribe(t => this.tiposRaw.set(t));
    this.cargarFlujos();
    this.api.getUsuarios().subscribe(u => this.usuarios.set(u));
    const roles = this.auth.user() ? (this.auth as any)._roles() : [];
    this.canCreate = this.auth.isAdmin() || roles.includes('ROLE_CREADOR');
  }

  // ── Lista ──────────────────────────────────────────
  loadDocs(): void {
    this.loading.set(true);
    this.api.getDocumentos(this.filterEstado ? { estado: this.filterEstado } : {}).subscribe({
      next:  d  => { this.docs.set(d ?? []); this.loading.set(false); },
      error: () => { this.docs.set([]); this.alert.set({ type: 'error', message: 'Error cargando documentos' }); this.loading.set(false); }
    });
  }

  get filtered(): Documento[] {
    return (this.docs() ?? []).filter(d =>
      !this.search || (d.nombre || '').toLowerCase().includes(this.search.toLowerCase())
    );
  }

  tipoNombre(id?: number): string {
    return this.tiposRaw().find(t => t.id === id)?.nombre || (id ? 'Tipo #' + id : '—');
  }

  flujoNombre(doc: Documento): string {
    return '—';
  }

  // ── Flujos ─────────────────────────────────────────
  cargarFlujos(): void {
    this.api.getFlujos().subscribe({
      next:  (f: Flujo[]) => this.flujos.set(f ?? []),
      error: () => {}
    });
  }

  seleccionarFlujo(flujoId: number): void {
    this.flujoSelId.set(flujoId);
    this.loadingFlujo.set(true);
    this.api.getEtapasFlujo(flujoId).subscribe({
      next:  e => { this.etapasFlujo.set(e ?? []); this.loadingFlujo.set(false); },
      error: () => { this.etapasFlujo.set([]); this.loadingFlujo.set(false); }
    });
  }

  // ── Step 1 ─────────────────────────────────────────
  seleccionarTipo(tipo: TipoDocumento): void {
    this.tipoSelId.set(tipo.id);
    this.subtipoSel.set(null);
    this.flujoSelId.set(null);
    this.etapasFlujo.set([]);
    this.subtipos.set(this.SUBTIPOS[tipo.id] ?? []);
  }

  // ── Step 2 ─────────────────────────────────────────
  seleccionarSubtipo(sub: string): void {
    this.subtipoSel.set(sub);
  }

  // ── Crear documento ────────────────────────────────
  onFileChange(e: Event): void {
    const selected = (e.target as HTMLInputElement).files?.[0] || null;
    if (selected) {
      const valida = EXTENSIONES_PERMITIDAS.some(ext => selected.name.toLowerCase().endsWith(ext));
      if (!valida) {
        this.alert.set({ type: 'error', message: 'Solo se permiten archivos PDF, DOCX o TXT' });
        (e.target as HTMLInputElement).value = '';
        this.file = null;
        return;
      }
    }
    this.file = selected;
  }

  get puedeCrear(): boolean {
    const tieneSubtipo = this.subtipos().length === 0 || !!this.subtipoSel();
    return !!this.tipoSelId() && tieneSubtipo && !!this.flujoSelId() && !!this.form.nombre.trim();
  }

  abrirModal(): void {
    this.resetForm();
    const usuarioId = this.auth.user()?.id ?? 0;
    if (usuarioId === 0) {
      const email = this.auth.user()?.email;
      this.api.getUsuarios().subscribe({
        next: (usuarios) => {
          const encontrado = usuarios.find((u: any) => u.email === email);
          if (encontrado) {
            (this.auth as any)._user.set(encontrado);
            sessionStorage.setItem('omnifiles_user', JSON.stringify(encontrado));
          }
          this.modalCreate.set(true);
        },
        error: () => this.modalCreate.set(true)
      });
    } else {
      this.modalCreate.set(true);
    }
  }

  crearDocumento(): void {
    if (!this.puedeCrear) {
      this.alert.set({ type: 'error', message: 'Completa todos los pasos antes de continuar' });
      return;
    }
    this.saving.set(true);
    const nombreFinal = this.subtipoSel()
      ? `[${this.subtipoSel()}] ${this.form.nombre}`
      : this.form.nombre;
    const usuarioId = this.auth.user()?.id ?? 0;
    this.enviarCrearDocumento(nombreFinal, usuarioId);
  }

  private enviarCrearDocumento(nombreFinal: string, usuarioId: number): void {
    this.api.crearDocumento({
      nombre:          nombreFinal,
      tipoDocumentoId: this.tipoSelId()!,
      flujoId:         this.flujoSelId()!,
      usuarioId,
    }).subscribe({
      next: (doc) => {
        if (this.file) {
          this.api.subirArchivo(doc.id, this.file).subscribe({
            next:  () => this.afterCreate(),
            error: e  => {
              this.alert.set({ type: 'error', message: e.error?.message || 'Documento creado pero falló la subida del archivo' });
              this.saving.set(false);
              this.modalCreate.set(false);
              this.loadDocs();
            }
          });
        } else {
          this.afterCreate();
        }
      },
      error: (e) => {
        this.alert.set({ type: 'error', message: e.error?.message || 'Error al crear documento' });
        this.saving.set(false);
      }
    });
  }

  afterCreate(): void {
    this.saving.set(false);
    this.modalCreate.set(false);
    this.resetForm();
    this.loadDocs();
    this.alert.set({ type: 'success', message: 'Documento creado y enviado al flujo de aprobación' });
  }

  resetForm(): void {
    this.form = { nombre: '' };
    this.file = null;
    this.tipoSelId.set(null);
    this.subtipoSel.set(null);
    this.subtipos.set([]);
    this.flujoSelId.set(null);
    this.etapasFlujo.set([]);
  }

  // ── Eliminar ───────────────────────────────────────
  eliminar(id: number): void {
    if (!confirm('¿Enviar a papelera?')) return;
    this.api.eliminarDocumento(id).subscribe({
      next:  () => { this.alert.set({ type: 'success', message: 'Enviado a papelera' }); this.loadDocs(); },
      error: e  => this.alert.set({ type: 'error', message: e.error?.message || e.message })
    });
  }

  // ── Historial ──────────────────────────────────────
  verHistorial(doc: Documento): void {
    this.modalHistorial.set(doc);
    this.api.getHistorial(doc.id).subscribe({
      next:  h  => this.historial.set(h),
      error: () => this.historial.set([])
    });
  }

  // ── Crear flujo ────────────────────────────────────
  abrirModalFlujo(): void {
    this.flujoForm = { nombre: '' };
    this.etapasNuevas = [{ nombre: '', rolId: 3, usuarioId: 0 }];
    this.modalFlujo.set(true);
  }

  agregarEtapa(): void {
    this.etapasNuevas = [...this.etapasNuevas, { nombre: '', rolId: 3, usuarioId: 0 }];
  }

  eliminarEtapa(i: number): void {
    this.etapasNuevas = this.etapasNuevas.filter((_, idx) => idx !== i);
  }

  actualizarEtapa(i: number, campo: string, valor: any): void {
    (this.etapasNuevas[i] as any)[campo] = valor;
  }

  usuariosDelRol(rolId: number): any[] {
    const rolNombre = this.roles.find(r => r.id === +rolId)?.nombre || '';
    return this.usuarios().filter((u: any) =>
      (u.rolNombre || '').toUpperCase() === rolNombre.toUpperCase()
    );
  }

  guardarFlujo(): void {
    if (!this.flujoForm.nombre.trim()) {
      this.alert.set({ type: 'error', message: 'El nombre del flujo es obligatorio' });
      return;
    }
    if (this.etapasNuevas.length === 0) {
      this.alert.set({ type: 'error', message: 'Agrega al menos una etapa' });
      return;
    }
    this.savingFlujo.set(true);

    this.api.crearFlujo({ nombre: this.flujoForm.nombre }).subscribe({
      next: (flujo: any) => {
        const etapas = this.etapasNuevas;
        let completadas = 0;
        etapas.forEach((etapa, i) => {
          this.api.agregarEtapaFlujo(flujo.id, {
            nombre:    etapa.nombre || `Etapa ${i + 1}`,
            orden:     i + 1,
            rolId:     etapa.rolId,
            usuarioId: etapa.usuarioId || null,
          }).subscribe({
            next: () => {
              completadas++;
              if (completadas === etapas.length) {
                this.savingFlujo.set(false);
                this.modalFlujo.set(false);
                this.cargarFlujos();
                this.alert.set({ type: 'success', message: 'Flujo creado exitosamente' });
              }
            },
            error: () => { completadas++; }
          });
        });
      },
      error: (e: any) => {
        this.alert.set({ type: 'error', message: e.error?.message || 'Error al crear flujo' });
        this.savingFlujo.set(false);
      }
    });
  }

  formatDate(d?: string): string {
    return d ? new Date(d).toLocaleDateString('es-CO') : '—';
  }

  get pasoFlujo(): number { return this.subtipos().length > 0 ? 3 : 2; }
  get pasoDatos(): number { return this.pasoFlujo + 1; }
  get pasoArchivo(): number { return this.pasoDatos + 1; }
}