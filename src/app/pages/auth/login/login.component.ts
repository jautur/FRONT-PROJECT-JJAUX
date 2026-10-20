import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';

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
  imports: [CommonModule, FormsModule, RouterLink, TranslatePipe],
  template: `
    <section class="auth-card">
      <h1>{{ 'AUTH.LOGIN.TITLE' | translate }}</h1>
      <p *ngIf="message" class="alert-message">{{ message }}</p>
      <p *ngIf="!message">{{ 'AUTH.LOGIN.SUBTITLE' | translate }}</p>
      <form (ngSubmit)="onSubmit()">
        <label>
          {{ 'AUTH.LOGIN.EMAIL_LABEL' | translate }}
          <input
            type="text"
            [(ngModel)]="email"
            name="email"
            required
            [placeholder]="'AUTH.LOGIN.EMAIL_PLACEHOLDER' | translate"
            autocapitalize="none"
            autocorrect="off"
            spellcheck="false"
            autocomplete="username"
          />
        </label>
        <label>
          {{ 'AUTH.LOGIN.PASSWORD_LABEL' | translate }}
          <input
            type="password"
            [(ngModel)]="password"
            name="password"
            placeholder="••••••••"
            autocapitalize="none"
            autocorrect="off"
            spellcheck="false"
            autocomplete="current-password"
          />
        </label>
        <button type="submit" [disabled]="loading">
          {{ loading ? ('AUTH.LOGIN.SUBMITTING' | translate) : ('AUTH.LOGIN.SUBMIT_BTN' | translate) }}
        </button>
        <p *ngIf="error" class="error">{{ error | translate }}</p>

        <!-- Botons d'accés ràpid per a proves des de mòbil o PC -->
        <div class="quick-test-section">
          <span class="quick-test-title">{{ 'AUTH.LOGIN.QUICK_TEST_TITLE' | translate }}</span>
          <div class="quick-test-buttons">
            <button type="button" class="btn-quick-user" (click)="omplirCredencials('cli', 'clicli')">
              {{ 'AUTH.LOGIN.QUICK_CLIENT' | translate }}
            </button>
            <button type="button" class="btn-quick-user" (click)="omplirCredencials('pro', 'propro')">
              {{ 'AUTH.LOGIN.QUICK_PRO' | translate }}
            </button>
            <button type="button" class="btn-quick-user" (click)="omplirCredencials('admin@admin.es', 'adminadmin')">
              {{ 'AUTH.LOGIN.QUICK_ADMIN' | translate }}
            </button>
          </div>
        </div>

        <p class="footer-hint">
          {{ 'AUTH.LOGIN.NO_ACCOUNT' | translate }} <a [routerLink]="getNavUrl('/registre')" [queryParams]="returnUrl !== '/' ? { returnUrl: returnUrl } : null">{{ 'AUTH.LOGIN.REGISTER_HERE' | translate }}</a>
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
      .quick-test-section {
        margin-top: 1rem;
        padding-top: 1rem;
        border-top: 1px dashed #dcd6cb;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }
      .quick-test-title {
        font-size: 0.78rem;
        font-weight: 800;
        color: #78756c;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }
      .quick-test-buttons {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 0.45rem;
      }
      .btn-quick-user {
        margin: 0;
        background: #faf8f4;
        border: 1px solid #dcd7ce;
        color: #09090c;
        padding: 0.55rem 0.4rem;
        border-radius: 8px;
        font-size: 0.78rem;
        font-weight: 800;
        text-transform: none;
        letter-spacing: 0;
        box-shadow: none;
        cursor: pointer;
        transition: all 0.15s ease;
      }
      .btn-quick-user:hover {
        background: #09090c;
        color: #ffffff;
        border-color: #09090c;
        transform: translateY(-1px);
      }
      @media (max-width: 480px) {
        .auth-card {
          padding: 1.5rem 1.15rem;
          border-radius: 14px;
        }
        .quick-test-buttons {
          grid-template-columns: 1fr;
          gap: 0.35rem;
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

  omplirCredencials(u: string, p: string): void {
    this.email = u;
    this.password = p;
    this.error = '';
    this.onSubmit();
  }

  get isAppPage(): boolean {
    const url = this.router.url || '';
    return url.startsWith('/app');
  }

  getNavUrl(path: string): string {
    if (this.isAppPage) {
      if (path === '/' || path === '/inici' || path === '/app') return '/app';
      if (path.startsWith('/app/')) return path;
      return path.startsWith('/') ? `/app${path}` : `/app/${path}`;
    }
    return path;
  }

  onSubmit(): void {
    const cleanEmail = (this.email || '').trim();
    const cleanPassword = (this.password || '').trim();

    if (!cleanEmail) {
      this.error = 'AUTH.LOGIN.ERROR_REQUIRED';
      return;
    }
    this.loading = true;
    this.error = '';

    this.authService.login({ email: cleanEmail, password: cleanPassword }).subscribe({
      next: () => {
        this.loading = false;
        const target = (this.isAppPage && (this.returnUrl === '/' || this.returnUrl === '/inici')) ? '/app' : this.returnUrl;
        this.router.navigateByUrl(target);
      },
      error: (err) => {
        this.loading = false;
        if (err.status === 401) {
          this.error = 'AUTH.LOGIN.ERROR_INVALID';
        } else if (err.status === 0) {
          this.error = 'AUTH.LOGIN.ERROR_SERVER';
        } else {
          this.error = 'AUTH.LOGIN.ERROR_GENERIC';
        }
      }
    });
  }
}

