/**
 * app.routes.ts — Definición de rutas de la aplicación
 */
import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';

export const routes: Routes = [
  { path: '',      loadComponent: () => import('./pages/landing/landing.component').then(m => m.LandingComponent) },
  { path: 'login', loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent) },
  {
    path: 'app',
    loadComponent: () => import('./templates/app-layout/app-layout.component').then(m => m.AppLayoutComponent),
    canActivate: [authGuard],
    children: [
      { path: '',           redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard',  loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent) },
      { path: 'documentos', loadComponent: () => import('./pages/documentos/documentos.component').then(m => m.DocumentosComponent) },
      { path: 'tareas',     loadComponent: () => import('./pages/tareas/tareas.component').then(m => m.TareasComponent) },
      { path: 'papelera',   loadComponent: () => import('./pages/papelera/papelera.component').then(m => m.PapeleraComponent) },
      { path: 'auditoria',  loadComponent: () => import('./pages/auditoria/auditoria.component').then(m => m.AuditoriaComponent) },
      // Solo ADMIN
      { path: 'usuarios',   loadComponent: () => import('./pages/usuarios/usuarios.component').then(m => m.UsuariosComponent),   canActivate: [adminGuard] },
    ]
  },
  { path: '**', redirectTo: '' }
];
