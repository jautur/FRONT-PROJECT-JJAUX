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
        background: #111116;
        padding: 2.2rem;
        border-radius: 18px;
        border: 1px solid #23232f;
        box-shadow: 0 24px 60px rgba(0, 0, 0, 0.7);
        color: var(--color-bone, #f5f4ef);
      }
      h1 {
        margin: 0 0 0.5rem;
        font-weight: 900;
        color: var(--color-bone, #f5f4ef);
        letter-spacing: -0.03em;
      }
      p {
        margin: 0 0 1.5rem;
        color: var(--color-bone-muted, #bab8ae);
        font-weight: 600;
        font-size: 0.95rem;
      }
      .alert-message {
        background: rgba(0, 255, 102, 0.1);
        color: var(--neon, #00ff66);
        border: 1px solid rgba(0, 255, 102, 0.3);
        padding: 0.8rem 1rem;
        border-radius: 8px;
        font-weight: 700;
        font-size: 0.9rem;
      }
      form {
        display: flex;
        flex-direction: column;
        gap: 1.1rem;
      }
      label {
        display: flex;
        flex-direction: column;
        gap: 0.45rem;
        font-weight: 800;
        font-size: 0.85rem;
        color: var(--color-bone, #f5f4ef);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }
      input {
        background: #181822;
        color: var(--color-bone, #f5f4ef);
        border: 1px solid #2a2a3a;
        border-radius: 10px;
        padding: 0.85rem 1rem;
        font-size: 1rem;
        font-weight: 600;
        outline: none;
        transition: all 0.2s;
      }
      input:focus {
        border-color: var(--neon, #00ff66);
        box-shadow: 0 0 14px rgba(0, 255, 102, 0.25);
      }
      button {
        margin-top: 0.75rem;
        border: none;
        background: var(--neon, #00ff66);
        color: #08080a;
        padding: 0.95rem 1rem;
        border-radius: 10px;
        font-weight: 900;
        font-size: 1rem;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        cursor: pointer;
        box-shadow: 0 0 16px rgba(0, 255, 102, 0.35);
        transition: all 0.2s ease;
      }
      button:hover:not(:disabled) {
        background: #ffffff;
        box-shadow: 0 0 24px rgba(0, 255, 102, 0.6);
        transform: translateY(-2px);
      }
      button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
      .error {
        color: #ff5c5c;
        font-weight: 700;
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

