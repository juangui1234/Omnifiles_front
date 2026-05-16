import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { BadgeComponent } from '../../atoms/badge/badge.component';
import { SpinnerComponent } from '../../atoms/spinner/spinner.component';
import { AlertComponent } from '../../molecules/alert/alert.component';
import { ModalComponent } from '../../molecules/modal/modal.component';
import { SelectComponent } from '../../atoms/select/select.component';
import { UsuarioResponse, SelectOption } from '../../models';

/**
 * Grave 6 — Fix 1:
 * Los roles deben coincidir con los IDs reales de la BD.
 * Según el SQL: ADMIN=1, CREADOR=2, REVISOR=3, APROBADOR=4, FIRMANTE=5
 */
const ROL_OPTIONS: SelectOption[] = [
  { value: 1, label: 'Administrador (ADMIN)'   },
  { value: 2, label: 'Creador (CREADOR)'        },
  { value: 3, label: 'Revisor (REVISOR)'        },
  { value: 4, label: 'Aprobador (APROBADOR)'    },
  { value: 5, label: 'Firmante (FIRMANTE)'      },
];

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule, BadgeComponent, SpinnerComponent, AlertComponent, ModalComponent, SelectComponent],
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.css']
})
export class UsuariosComponent implements OnInit {
  usuarios    = signal<UsuarioResponse[]>([]);
  loading     = signal(true);
  search      = '';
  alert       = signal<{type:string;message:string}|null>(null);
  modalCreate = signal(false);
  modalEdit   = signal<UsuarioResponse|null>(null);
  saving      = signal(false);
  rolOptions  = ROL_OPTIONS;

  form = { nombre:'', email:'', contrasena:'', rolId: '', cargo:'', telefono:'' };

  constructor(private api: ApiService) {}
  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading.set(true);
    this.api.getUsuarios().subscribe({
      next:  u  => { this.usuarios.set(u); this.loading.set(false); },
      error: () => { this.alert.set({type:'error',message:'Error cargando usuarios'}); this.loading.set(false); }
    });
  }

  get filtered(): UsuarioResponse[] {
    const s = this.search.toLowerCase();
    return this.usuarios().filter(u =>
      /**
       * Grave 6 — Fix 2:
       * UsuarioResponse ya no tiene campo "rol" suelto, solo "rolNombre".
       * Se elimina u.rol de la búsqueda.
       */
      !s || [u.nombre, u.email, u.rolNombre].some(v => (v||'').toLowerCase().includes(s))
    );
  }

  /**
   * Grave 6 — Fix 3:
   * El contador de "Activos" en el stat-card mostraba usuarios().length
   * para ambas tarjetas. Se agrega getter para contar solo los activos.
   */
  get totalActivos(): number {
    return this.usuarios().filter(u => u.activo !== false).length;
  }

  openCreate(): void {
    this.form = { nombre:'', email:'', contrasena:'', rolId:'', cargo:'', telefono:'' };
    this.modalCreate.set(true);
  }

  openEdit(u: UsuarioResponse): void {
    this.form = {
      nombre:     u.nombre    || '',
      email:      u.email     || '',
      contrasena: '',
      /**
       * Grave 6 — Fix 4:
       * UsuarioResponse ahora tiene rolId directamente (no hace falta el cast).
       */
      rolId:      String(u.rolId || ''),
      cargo:      u.cargo     || '',
      telefono:   u.telefono  || ''
    };
    this.modalEdit.set(u);
  }

  crear(): void {
    if (!this.form.nombre || !this.form.email || !this.form.rolId) {
      this.alert.set({type:'error',message:'Nombre, email y rol son obligatorios'});
      return;
    }
    this.saving.set(true);
    const payload = {
      nombre:     this.form.nombre,
      email:      this.form.email,
      contrasena: this.form.contrasena,
      rolId:      +this.form.rolId,
      cargo:      this.form.cargo     || undefined,
      telefono:   this.form.telefono  || undefined,
      activo:     true
    };
    this.api.crearUsuario(payload).subscribe({
      next:  () => {
        this.alert.set({type:'success',message:'Usuario creado exitosamente'});
        this.modalCreate.set(false);
        this.saving.set(false);
        this.load();
      },
      /**
       * Grave 6 — Fix 5:
       * Error lee e.error?.message en lugar de e.error?.message || e.message
       * para mostrar el mensaje real del backend (ej: "El email ya está en uso").
       */
      error: e => {
        this.alert.set({type:'error', message: e.error?.message || e.message || 'Error al crear usuario'});
        this.saving.set(false);
      }
    });
  }

  editar(): void {
    const u = this.modalEdit();
    if (!u) return;
    this.saving.set(true);
    const payload: any = {
      nombre:   this.form.nombre,
      email:    this.form.email,
      rolId:    +this.form.rolId,
      cargo:    this.form.cargo    || undefined,
      telefono: this.form.telefono || undefined,
      activo:   true
    };
    if (this.form.contrasena) payload.contrasena = this.form.contrasena;
    this.api.actualizarUsuario(u.id, payload).subscribe({
      next:  () => {
        this.alert.set({type:'success',message:'Usuario actualizado'});
        this.modalEdit.set(null);
        this.saving.set(false);
        this.load();
      },
      error: e => {
        this.alert.set({type:'error', message: e.error?.message || e.message || 'Error al actualizar usuario'});
        this.saving.set(false);
      }
    });
  }

  toggleEstado(u: UsuarioResponse): void {
    /**
     * Grave 6 — Fix 6:
     * Antes usaba (u as any).activo. Ahora UsuarioResponse tiene activo
     * tipado directamente, no hace falta el cast.
     */
    const nuevoEstado = !u.activo;
    this.api.cambiarEstadoUsuario(u.id, nuevoEstado).subscribe({
      next:  () => {
        this.alert.set({type:'success', message:`Usuario ${nuevoEstado ? 'activado' : 'desactivado'}`});
        this.load();
      },
      error: e => this.alert.set({type:'error', message: e.error?.message || e.message})
    });
  }

  inicial(u: UsuarioResponse): string      { return (u.nombre || 'U')[0].toUpperCase(); }
  estadoUsuario(u: UsuarioResponse): string { return u.activo !== false ? 'ACTIVO' : 'INACTIVO'; }
  rolLabel(u: UsuarioResponse): string      { return u.rolNombre || '—'; }
}