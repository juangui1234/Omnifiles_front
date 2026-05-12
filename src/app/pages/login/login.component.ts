/** Página: Login */
import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AlertComponent } from '../../molecules/alert/alert.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, AlertComponent],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  email    = '';
  password = '';
  loading  = signal(false);
  error    = signal('');

  // Array para el @for del panel izquierdo
  features = [
    'Flujos automáticos de aprobación',
    'Auditoría en tiempo real',
    'Control de accesos por rol'
  ];

  constructor(private auth: AuthService, private router: Router) {}

  goBack(): void { this.router.navigate(['/']); }

  onSubmit(): void {
    if (!this.email || !this.password) {
      this.error.set('Completa todos los campos');
      return;
    }
    this.loading.set(true);
    this.error.set('');
    this.auth.login(this.email, this.password).subscribe({
      next: () => this.router.navigate(['/app/dashboard']),
      error: (e) => {
        this.error.set(e.error?.message || 'Credenciales inválidas');
        this.loading.set(false);
      }
    });
  }
}
