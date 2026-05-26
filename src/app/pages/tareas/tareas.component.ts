import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { BadgeComponent } from '../../atoms/badge/badge.component';
import { SpinnerComponent } from '../../atoms/spinner/spinner.component';
import { AlertComponent } from '../../molecules/alert/alert.component';
import { ModalComponent } from '../../molecules/modal/modal.component';
import { Tarea, Documento } from '../../models';

@Component({
  selector: 'app-tareas',
  standalone: true,
  imports: [CommonModule, FormsModule, BadgeComponent, SpinnerComponent, AlertComponent, ModalComponent],
  templateUrl: './tareas.component.html',
  styleUrls: ['./tareas.component.css']
})
export class TareasComponent implements OnInit {
  tareas      = signal<Tarea[]>([]);
  documentos  = signal<Map<number, Documento>>(new Map());
  loading     = signal(true);
  alert       = signal<{type:string;message:string}|null>(null);
  modal       = signal<{tarea:Tarea;accion:string}|null>(null);
  obs         = '';
  saving      = signal(false);
  downloading = signal<number|null>(null);

  constructor(private api: ApiService, private auth: AuthService) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    const usuarioId = this.auth.user()?.id ?? 0;

    if (usuarioId > 0) {
      // Id ya disponible — cargar tareas directamente
      this.cargarTareasPor(usuarioId);
    } else {
      // Id no disponible — solo ADMIN puede listar /usuarios
      // Para otros roles intentamos con /usuarios y si falla mostramos error claro
      const email = this.auth.user()?.email;
      this.loading.set(true);
      this.api.getUsuarios().subscribe({
        next: usuarios => {
          const encontrado = usuarios.find(u => u.email === email);
          if (encontrado) {
            // Actualizar el signal con el id real para futuras llamadas
            (this.auth as any)._user.set(encontrado);
            sessionStorage.setItem('omnifiles_user', JSON.stringify(encontrado));
            this.cargarTareasPor(encontrado.id);
          } else {
            this.alert.set({ type: 'error', message: 'No se encontró el usuario en el sistema' });
            this.loading.set(false);
          }
        },
        error: () => {
          // No es ADMIN — no puede listar usuarios
          // Pedirle al encargado del backend que agregue el id en la respuesta del login
          this.alert.set({
            type: 'error',
            message: 'No se pudo obtener el ID del usuario. Cierra sesión e inicia de nuevo.'
          });
          this.loading.set(false);
        }
      });
    }
  }

  private cargarTareasPor(usuarioId: number): void {
    this.loading.set(true);
    this.api.getTareasPendientes(usuarioId).subscribe({
      next: t => {
        const lista = t ?? [];
        this.tareas.set(lista);
        this.cargarDocumentos(lista);
        this.loading.set(false);
      },
      error: () => {
        this.alert.set({ type: 'error', message: 'Error cargando tareas' });
        this.loading.set(false);
      }
    });
  }

  private cargarDocumentos(tareas: Tarea[]): void {
    const mapa = new Map<number, Documento>();
    const ids  = [...new Set(tareas.map(t => t.documentoId))];
    ids.forEach(id => {
      this.api.getDocumento(id).subscribe({
        next: doc => { mapa.set(id, doc); this.documentos.set(new Map(mapa)); },
        error: () => {}
      });
    });
  }

  nombreDocumento(documentoId: number): string {
    return this.documentos().get(documentoId)?.nombre || 'Documento #' + documentoId;
  }

  tieneArchivo(documentoId: number): boolean {
    return !!this.documentos().get(documentoId)?.rutaArchivo;
  }

  openModal(tarea: Tarea, accion: string): void {
    this.modal.set({ tarea, accion });
    this.obs = '';
  }

  accionLabel(): string {
    const a = this.modal()?.accion;
    return a === 'aprobar' ? 'Aprobar' : a === 'rechazar' ? 'Rechazar' : 'Solicitar Corrección';
  }

  descargarArchivo(tarea: Tarea): void {
    if (!this.tieneArchivo(tarea.documentoId)) {
      this.alert.set({ type: 'error', message: 'Este documento no tiene archivo adjunto' });
      return;
    }
    this.downloading.set(tarea.id);
    this.api.descargarDocumento(tarea.documentoId).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a   = document.createElement('a');
        a.href    = url;
        const rutaArchivo = this.documentos().get(tarea.documentoId)?.rutaArchivo || '';
        const ext = rutaArchivo.toLowerCase().includes('.pdf')  ? '.pdf'
                  : rutaArchivo.toLowerCase().includes('.docx') ? '.docx'
                  : rutaArchivo.toLowerCase().includes('.txt')  ? '.txt' : '';
        a.download = this.nombreDocumento(tarea.documentoId) + ext;
        a.click();
        window.URL.revokeObjectURL(url);
        this.downloading.set(null);
      },
      error: e => {
        this.alert.set({ type: 'error', message: e.error?.message || 'Error al descargar' });
        this.downloading.set(null);
      }
    });
  }

  ejecutar(): void {
    const m = this.modal();
    if (!m) return;
    this.saving.set(true);
    const dto    = { observaciones: this.obs };
    const nombre = this.nombreDocumento(m.tarea.documentoId);
    const accion = m.accion === 'aprobar' ? 'aprobado'
                 : m.accion === 'rechazar' ? 'rechazado'
                 : 'devuelto para corrección';

    const req = m.accion === 'aprobar'  ? this.api.aprobarTarea(m.tarea.id, dto)
              : m.accion === 'rechazar' ? this.api.rechazarTarea(m.tarea.id, dto)
              : this.api.solicitarCorreccion(m.tarea.id, dto);

    req.subscribe({
      next: () => {
        this.alert.set({ type: 'success', message: `"${nombre}" ${accion} exitosamente` });
        this.modal.set(null);
        this.saving.set(false);
        this.load();
      },
      error: e => {
        this.alert.set({ type: 'error', message: e.error?.message || 'Error al ejecutar la acción' });
        this.saving.set(false);
      }
    });
  }

  formatDate(d?: string): string {
    return d ? new Date(d).toLocaleDateString('es-CO') : '—';
  }
}