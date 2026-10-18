import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

/**
 * Component d'Inici de Sessió (/login).
 * Permet a clients, professionals i administradors autenticar-se a la plataforma AVISA
 * amb les seves credencials (correu electrònic i contrasenya).
 * Gestiona missatges informatius, errors d'autenticació, redirecció posterior mitjançant returnUrl
 * i enllaç directe cap al registre (/registre) per a nous usuaris.
 */
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
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

        <p class="footer-hint">
          Encara no tens compte? <a routerLink="/registre" [queryParams]="returnUrl !== '/' ? { returnUrl: returnUrl } : null">Registra't aquí</a>
        </p>
      </form>
    </section>
  `,
  styles: [
    `
      .auth-card {
        width: min(440px, 100%);
        background: #ffffff;
        padding: 2.4rem;
        border-radius: 18px;
        border: 1px solid #e5e0d7;
        box-shadow: 0 16px 40px rgba(0, 0, 0, 0.06);
        color: #09090c;
      }
      h1 {
        margin: 0 0 0.5rem;
        font-weight: 900;
        color: #09090c;
        letter-spacing: -0.03em;
      }
      p {
        margin: 0 0 1.5rem;
        color: #57554e;
        font-weight: 600;
        font-size: 0.95rem;
      }
      .alert-message {
        background: rgba(255, 23, 68, 0.1);
        color: #ff1744;
        border: 1px solid rgba(255, 23, 68, 0.3);
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
        color: #09090c;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }
      input {
        background: #ffffff;
        color: #09090c;
        border: 1px solid #dcd7ce;
        border-radius: 10px;
        padding: 0.85rem 1rem;
        font-size: 1rem;
        font-weight: 600;
        outline: none;
        transition: all 0.2s;
      }
      input:focus {
        border-color: #ff1744;
        box-shadow: 0 0 0 3px rgba(255, 23, 68, 0.15), 0 0 14px rgba(255, 23, 68, 0.25);
      }
      button {
        margin-top: 0.75rem;
        border: none;
        background: #ff1744;
        color: #ffffff;
        padding: 0.95rem 1rem;
        border-radius: 10px;
        font-weight: 900;
        font-size: 1rem;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        cursor: pointer;
        box-shadow: 0 4px 16px rgba(255, 23, 68, 0.35);
        transition: all 0.2s ease;
      }
      button:hover:not(:disabled) {
        background: #09090c;
        color: #ffffff;
        box-shadow: 0 6px 22px rgba(0, 0, 0, 0.25);
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
      .footer-hint {
        text-align: center;
        font-size: 0.88rem;
        color: #57554e;
        margin: 0.65rem 0 0;
        font-weight: 600;
      }
      .footer-hint a {
        color: #ff1744;
        text-decoration: none;
        font-weight: 800;
        transition: all 0.15s ease;
      }
      .footer-hint a:hover {
        color: #09090c;
        text-decoration: underline;
      }
      @media (max-width: 480px) {
        .auth-card {
          padding: 1.5rem 1.25rem;
          border-radius: 14px;
        }
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
  returnUrl = '/';

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

