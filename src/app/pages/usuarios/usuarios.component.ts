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

// Roles mapeados con su ID numérico según la BD
const ROL_OPTIONS: SelectOption[] = [
  { value: 1, label: 'Administrador (ADMIN)' },
  { value: 2, label: 'Usuario (USER)'        },
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
      !s || [u.nombre, u.email, u.rol, u.rolNombre].some(v => (v||'').toLowerCase().includes(s))
    );
  }

  openCreate(): void {
    this.form = { nombre:'', email:'', contrasena:'', rolId:'', cargo:'', telefono:'' };
    this.modalCreate.set(true);
  }

  openEdit(u: UsuarioResponse): void {
    this.form = {
      nombre:    u.nombre    || '',
      email:     u.email     || '',
      contrasena:'',
      rolId:     (u as any).rolId || '',
      cargo:     (u as any).cargo    || '',
      telefono:  (u as any).telefono || ''
    };
    this.modalEdit.set(u);
  }

  crear(): void {
    if (!this.form.nombre || !this.form.email || !this.form.rolId) {
      this.alert.set({type:'error',message:'Nombre, email y rol son obligatorios'}); return;
    }
    this.saving.set(true);
    // Enviar exactamente lo que el backend espera
    const payload = {
      nombre:    this.form.nombre,
      email:     this.form.email,
      contrasena:this.form.contrasena,
      rolId:     +this.form.rolId,
      activo:    true
    };
    this.api.crearUsuario(payload).subscribe({
      next:  () => { this.alert.set({type:'success',message:'Usuario creado exitosamente'}); this.modalCreate.set(false); this.saving.set(false); this.load(); },
      error: e  => { this.alert.set({type:'error',message:e.error?.message || e.message || 'Error al crear usuario'}); this.saving.set(false); }
    });
  }

  editar(): void {
    const u = this.modalEdit(); if (!u) return;
    this.saving.set(true);
    const payload: any = {
      nombre: this.form.nombre,
      email:  this.form.email,
      rolId:  +this.form.rolId,
      activo: true
    };
    if (this.form.contrasena) payload.contrasena = this.form.contrasena;
    this.api.actualizarUsuario(u.id, payload).subscribe({
      next:  () => { this.alert.set({type:'success',message:'Usuario actualizado'}); this.modalEdit.set(null); this.saving.set(false); this.load(); },
      error: e  => { this.alert.set({type:'error',message:e.error?.message || e.message}); this.saving.set(false); }
    });
  }

  toggleEstado(u: UsuarioResponse): void {
    const activo = (u as any).activo !== false;
    this.api.cambiarEstadoUsuario(u.id, !activo).subscribe({
      next:  () => { this.alert.set({type:'success',message:`Usuario ${!activo?'activado':'desactivado'}`}); this.load(); },
      error: e  => this.alert.set({type:'error',message:e.message})
    });
  }

  inicial(u: UsuarioResponse): string    { return (u.nombre||'U')[0].toUpperCase(); }
  estadoUsuario(u: UsuarioResponse): string { return (u as any).activo !== false ? 'ACTIVO' : 'INACTIVO'; }
  rolLabel(u: UsuarioResponse): string   { return u.rol || u.rolNombre || '—'; }
}
