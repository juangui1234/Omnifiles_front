/**
 * app.routes.ts — Definición de rutas de la aplicación
 */
import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';
import { roleGuard } from './guards/role.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/landing/landing.component').then(m => m.LandingComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'app',
    loadComponent: () => import('./templates/app-layout/app-layout.component').then(m => m.AppLayoutComponent),
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

      // Todos los roles autenticados
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },

      // Todos los roles pueden crear y ver documentos
      {
        path: 'documentos',
        loadComponent: () => import('./pages/documentos/documentos.component').then(m => m.DocumentosComponent),
        canActivate: [authGuard]
      },

      // ADMIN, REVISOR, APROBADOR, FIRMANTE — resuelven tareas
      {
        path: 'tareas',
        loadComponent: () => import('./pages/tareas/tareas.component').then(m => m.TareasComponent),
        canActivate: [roleGuard('ADMIN', 'REVISOR', 'APROBADOR', 'FIRMANTE')]
      },

      // Solo ADMIN
      {
        path: 'papelera',
        loadComponent: () => import('./pages/papelera/papelera.component').then(m => m.PapeleraComponent),
        canActivate: [adminGuard]
      },

      // Solo ADMIN
      {
        path: 'auditoria',
        loadComponent: () => import('./pages/auditoria/auditoria.component').then(m => m.AuditoriaComponent),
        canActivate: [adminGuard]
      },

      // Solo ADMIN
      {
        path: 'usuarios',
        loadComponent: () => import('./pages/usuarios/usuarios.component').then(m => m.UsuariosComponent),
        canActivate: [adminGuard]
      },
    ]
  },
  { path: '**', redirectTo: '' }
];