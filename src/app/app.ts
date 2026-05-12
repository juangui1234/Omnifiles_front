/**
 * app.ts — Componente raíz de OmniFiles
 * Renderiza el router-outlet; el enrutamiento lo maneja app.routes.ts
 */
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector:    'app-root',
  standalone:  true,
  imports:     [RouterOutlet],
  templateUrl: './app.html',
  styleUrl:    './app.css'
})
export class AppComponent {
  title = 'OmniFiles';
}
