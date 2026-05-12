import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { BadgeComponent } from '../../atoms/badge/badge.component';
import { SpinnerComponent } from '../../atoms/spinner/spinner.component';
import { AlertComponent } from '../../molecules/alert/alert.component';
import { ModalComponent } from '../../molecules/modal/modal.component';
import { Tarea } from '../../models';

@Component({
  selector: 'app-tareas',
  standalone: true,
  imports: [CommonModule, FormsModule, BadgeComponent, SpinnerComponent, AlertComponent, ModalComponent],
  templateUrl: './tareas.component.html',
  styleUrls: ['./tareas.component.css']
})
export class TareasComponent implements OnInit {
  tareas  = signal<Tarea[]>([]);
  loading = signal(true);
  alert   = signal<{type:string;message:string}|null>(null);
  modal   = signal<{tarea:Tarea;accion:string}|null>(null);
  obs     = '';
  saving  = signal(false);
  user    = this.auth.user;

  constructor(private api: ApiService, private auth: AuthService) {}
  ngOnInit(): void { this.load(); }

  load(): void {
    const uid = this.user()?.id;
    if (!uid) return;
    this.loading.set(true);
    this.api.getTareasPendientes(uid).subscribe({
      next: t  => { this.tareas.set(t); this.loading.set(false); },
      error: () => { this.alert.set({type:'error',message:'Error cargando tareas'}); this.loading.set(false); }
    });
  }

  openModal(tarea: Tarea, accion: string): void { this.modal.set({tarea, accion}); this.obs = ''; }

  accionLabel(): string {
    const a = this.modal()?.accion;
    return a === 'aprobar' ? 'Aprobar' : a === 'rechazar' ? 'Rechazar' : 'Solicitar Corrección';
  }

  ejecutar(): void {
    const m = this.modal(); if (!m) return;
    this.saving.set(true);
    const dto = { observaciones: this.obs };
    const req = m.accion === 'aprobar'  ? this.api.aprobarTarea(m.tarea.id, dto)
              : m.accion === 'rechazar' ? this.api.rechazarTarea(m.tarea.id, dto)
              : this.api.solicitarCorreccion(m.tarea.id, dto);
    req.subscribe({
      next:  () => { this.alert.set({type:'success',message:'Acción ejecutada exitosamente'}); this.modal.set(null); this.saving.set(false); this.load(); },
      error: e  => { this.alert.set({type:'error',message:e.message}); this.saving.set(false); }
    });
  }

  formatDate(d?: string): string { return d ? new Date(d).toLocaleDateString('es-CO') : '—'; }
}
