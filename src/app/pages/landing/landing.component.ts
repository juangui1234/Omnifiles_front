/** Página: Landing Page pública */
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NavbarComponent } from '../../organisms/navbar/navbar.component';
import { FooterComponent } from '../../organisms/navbar/navbar.component';

const FEATURES = [
  { icon: 'document', title: 'Gestión Documental',   desc: 'Crea, envía y gestiona documentos con ciclos de vida completos y trazabilidad total.' },
  { icon: 'shield',   title: 'Control de Accesos',   desc: 'Roles definidos con permisos específicos garantizan que cada usuario acceda solo a lo que le corresponde.' },
  { icon: 'audit',    title: 'Auditoría Completa',   desc: 'Cada acción queda registrada con usuario, fecha, hora y estado resultante del documento.' },
  { icon: 'zap',      title: 'Flujo Automático',     desc: 'Al enviar un documento, el sistema genera automáticamente las tareas de revisión.' },
  { icon: 'history',  title: 'Historial Detallado',  desc: 'Consulta el historial completo de cualquier documento desde su creación hasta su estado final.' },
  { icon: 'trash',    title: 'Papelera Segura',      desc: 'La eliminación lógica protege tus documentos con posibilidad de restauración.' },
];

const STATS = [
  { value: '100%', label: 'Trazabilidad' },
  { value: '3',    label: 'Roles disponibles' },
  { value: '∞',   label: 'Documentos' },
  { value: '24/7', label: 'Disponibilidad' },
];

const ICONS: Record<string, string> = {
  document: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>',
  shield:   '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
  audit:    '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
  zap:      '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',
  history:  '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v5h5"/><path d="M3.05 13A9 9 0 1 0 6 5.3L3 8"/></svg>',
  trash:    '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>',
};

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, NavbarComponent, FooterComponent],
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.css']
})
export class LandingComponent {
  features = FEATURES.map(f => ({ ...f, iconSvg: ICONS[f.icon] || '' }));
  stats    = STATS;

  constructor(private router: Router) {}

  goToLogin():    void { this.router.navigate(['/login']); }
  scrollFeatures():void { document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' }); }
}
