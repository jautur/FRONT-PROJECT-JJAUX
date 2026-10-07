import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="auth-card">
      <h1>Inici de sessió</h1>
      <p *ngIf="message" class="alert-message">{{ message }}</p>
      <p *ngIf="!message">Introdueix les teves credencials per continuar.</p>
      <form (ngSubmit)="onSubmit()">
        <label>
          Correu
          <input type="email" [(ngModel)]="email" name="email" required placeholder="nom@empresa.com" />
        </label>
        <label>
          Contrasenya
          <input type="password" [(ngModel)]="password" name="password" placeholder="••••••••" />
        </label>
        <button type="submit" [disabled]="loading">
          {{ loading ? 'Entrant...' : 'Entrar' }}
        </button>
        <p *ngIf="error" class="error">{{ error }}</p>
      </form>
    </section>
  `,
  styles: [
    `
      .auth-card {
        width: min(440px, 100%);
        background: white;
        padding: 2rem;
        border-radius: 18px;
        box-shadow: 0 20px 40px rgba(15, 23, 42, 0.08);
      }
      h1 {
        margin: 0 0 0.5rem;
      }
      p {
        margin: 0 0 1.5rem;
        color: #4b5563;
      }
      .alert-message {
        background: #fef3c7;
        color: #92400e;
        padding: 0.75rem 1rem;
        border-radius: 8px;
        font-weight: 500;
        font-size: 0.9rem;
      }
      form {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }
      label {
        display: flex;
        flex-direction: column;
        gap: 0.45rem;
        font-weight: 600;
      }
      input {
        border: 1px solid #d1d5db;
        border-radius: 10px;
        padding: 0.8rem 0.9rem;
        font-size: 1rem;
      }
      button {
        margin-top: 0.5rem;
        border: none;
        background: #2563eb;
        color: white;
        padding: 0.9rem 1rem;
        border-radius: 10px;
        font-weight: 700;
        cursor: pointer;
      }
      button:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
      .error {
        color: #dc2626;
        font-size: 0.875rem;
        margin: 0;
      }
    `
  ]
})
export class LoginComponent implements OnInit {
  email = '';
  password = '';
  loading = false;
  error = '';
  message = '';
  private returnUrl = '/';

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      if (params['message']) {
        this.message = params['message'];
      }
      if (params['returnUrl']) {
        this.returnUrl = params['returnUrl'];
      }
    });
  }

  onSubmit(): void {
    if (!this.email) {
      this.error = 'Cal indicar un correu electrònic';
      return;
    }
    this.loading = true;
    this.error = '';

    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: (user) => {
        this.loading = false;
        this.router.navigateByUrl(this.returnUrl);
      },
      error: () => {
        this.loading = false;
        this.error = 'Error en iniciar sessió. Comprova les dades o el servidor.';
      }
    });
  }
}

