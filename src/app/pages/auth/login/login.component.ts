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
 * Inclou suport complet per al flux de recuperació de contrasenya (modal interactiu en 2 passos),
 * gestió d'errors d'autenticació, redirecció returnUrl i enllaç cap al registre (/registre).
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
          <div class="label-with-action">
            <span>{{ 'AUTH.LOGIN.PASSWORD_LABEL' | translate }}</span>
            <button
              type="button"
              class="link-forgot"
              (click)="obrirModalRecuperacio()"
              tabindex="0"
            >
              {{ 'AUTH.LOGIN.FORGOT_PASSWORD_LINK' | translate }}
            </button>
          </div>
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

    <!-- MODAL DE RECUPERACIÓ DE CONTRASENYA -->
    <div
      *ngIf="mostrarModalRecuperacio"
      class="modal-backdrop"
      (click)="tancarModalRecuperacio()"
      role="dialog"
      aria-modal="true"
    >
      <div class="modal-card" (click)="$event.stopPropagation()">
        <!-- Header del Modal -->
        <div class="modal-header">
          <div class="modal-title-wrap">
            <span class="modal-icon">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
            </span>
            <h2>{{ 'AUTH.LOGIN.RECOVERY_MODAL_TITLE' | translate }}</h2>
          </div>
          <button
            type="button"
            class="btn-close-modal"
            (click)="tancarModalRecuperacio()"
            aria-label="Tancar"
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <!-- PAS 1: Sol·licitar codi temporal -->
        <div *ngIf="pasRecuperacio === 1" class="modal-body">
          <p class="modal-desc">{{ 'AUTH.LOGIN.RECOVERY_STEP1_DESC' | translate }}</p>

          <label class="modal-field">
            <span>{{ 'AUTH.LOGIN.RECOVERY_EMAIL_LABEL' | translate }}</span>
            <input
              type="text"
              [(ngModel)]="recuperarEmail"
              name="recuperarEmail"
              [placeholder]="'AUTH.LOGIN.RECOVERY_EMAIL_PLACEHOLDER' | translate"
              autocapitalize="none"
              autocorrect="off"
              spellcheck="false"
              (keyup.enter)="sollicitarCodi()"
            />
          </label>

          <p *ngIf="recuperarError" class="modal-error">{{ recuperarError | translate }}</p>

          <div class="modal-actions">
            <button
              type="button"
              class="btn-modal-cancel"
              (click)="tancarModalRecuperacio()"
            >
              {{ 'AUTH.LOGIN.RECOVERY_CANCEL_BTN' | translate }}
            </button>
            <button
              type="button"
              class="btn-modal-submit"
              [disabled]="recuperarLoading || !recuperarEmail.trim()"
              (click)="sollicitarCodi()"
            >
              {{ recuperarLoading ? ('AUTH.LOGIN.RECOVERY_SENDING' | translate) : ('AUTH.LOGIN.RECOVERY_SEND_BTN' | translate) }}
            </button>
          </div>
        </div>

        <!-- PAS 2: Introduir codi de verificació i nova contrasenya -->
        <div *ngIf="pasRecuperacio === 2" class="modal-body">
          <p class="modal-desc">{{ 'AUTH.LOGIN.RECOVERY_STEP2_DESC' | translate }}</p>

          <!-- Banner informatiu en mode desenvolupament / local -->
          <div *ngIf="recuperarCodiDev" class="dev-code-banner">
            <span class="dev-badge">DEV CODE</span>
            <span class="dev-code-text">{{ 'AUTH.LOGIN.RECOVERY_DEV_HINT' | translate }}<strong>{{ recuperarCodiDev }}</strong></span>
            <button
              type="button"
              class="btn-autofill"
              (click)="autoOmplirCodiDev()"
              title="Copiar al camp"
            >
              Auto-omplir
            </button>
          </div>

          <label class="modal-field">
            <span>{{ 'AUTH.LOGIN.RECOVERY_CODE_LABEL' | translate }}</span>
            <input
              type="text"
              [(ngModel)]="recuperarCodi"
              name="recuperarCodi"
              maxlength="6"
              [placeholder]="'AUTH.LOGIN.RECOVERY_CODE_PLACEHOLDER' | translate"
              class="code-input"
              autocapitalize="none"
              autocorrect="off"
            />
          </label>

          <label class="modal-field">
            <span>{{ 'AUTH.LOGIN.RECOVERY_NEW_PWD_LABEL' | translate }}</span>
            <input
              type="password"
              [(ngModel)]="novaContrasenya"
              name="novaContrasenya"
              placeholder="••••••••"
              autocapitalize="none"
              autocorrect="off"
            />
          </label>

          <label class="modal-field">
            <span>{{ 'AUTH.LOGIN.RECOVERY_CONFIRM_PWD_LABEL' | translate }}</span>
            <input
              type="password"
              [(ngModel)]="confirmarContrasenya"
              name="confirmarContrasenya"
              placeholder="••••••••"
              autocapitalize="none"
              autocorrect="off"
              (keyup.enter)="aplicarNovaContrasenya()"
            />
          </label>

          <p *ngIf="recuperarError" class="modal-error">{{ recuperarError | translate }}</p>

          <button
            type="button"
            class="btn-back-step"
            (click)="tornarPas1()"
          >
            {{ 'AUTH.LOGIN.RECOVERY_BACK_STEP1' | translate }}
          </button>

          <div class="modal-actions">
            <button
              type="button"
              class="btn-modal-cancel"
              (click)="tancarModalRecuperacio()"
            >
              {{ 'AUTH.LOGIN.RECOVERY_CANCEL_BTN' | translate }}
            </button>
            <button
              type="button"
              class="btn-modal-submit"
              [disabled]="recuperarLoading || !recuperarCodi.trim() || !novaContrasenya.trim() || !confirmarContrasenya.trim()"
              (click)="aplicarNovaContrasenya()"
            >
              {{ recuperarLoading ? ('AUTH.LOGIN.RECOVERY_SUBMITTING' | translate) : ('AUTH.LOGIN.RECOVERY_SUBMIT_BTN' | translate) }}
            </button>
          </div>
        </div>

        <!-- PAS 3: Èxit confirmació -->
        <div *ngIf="pasRecuperacio === 3" class="modal-body success-body">
          <div class="success-icon-wrap">
            <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
          <h3>{{ 'AUTH.LOGIN.RECOVERY_SUCCESS_TITLE' | translate }}</h3>
          <p class="success-desc">{{ 'AUTH.LOGIN.RECOVERY_SUCCESS_DESC' | translate }}</p>

          <button
            type="button"
            class="btn-modal-submit btn-full"
            (click)="tancarModalAmbExit()"
          >
            {{ 'AUTH.LOGIN.RECOVERY_CLOSE_BTN' | translate }}
          </button>
        </div>
      </div>
    </div>
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
        position: relative;
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
      .label-with-action {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 0.5rem;
      }
      .link-forgot {
        background: transparent;
        border: none;
        box-shadow: none;
        padding: 0;
        margin: 0;
        color: #ff1744;
        font-size: 0.78rem;
        font-weight: 800;
        text-transform: none;
        letter-spacing: normal;
        cursor: pointer;
        text-decoration: underline;
        transition: color 0.15s ease;
      }
      .link-forgot:hover {
        background: transparent;
        color: #09090c;
        box-shadow: none;
        transform: none;
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
      button[type='submit'] {
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
      button[type='submit']:hover:not(:disabled) {
        background: #09090c;
        color: #ffffff;
        box-shadow: 0 6px 22px rgba(0, 0, 0, 0.25);
        transform: translateY(-2px);
      }
      button[type='submit']:disabled {
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

      /* ESTILS DEL MODAL DE RECUPERACIÓ */
      .modal-backdrop {
        position: fixed;
        inset: 0;
        background: rgba(9, 9, 12, 0.65);
        backdrop-filter: blur(4px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        padding: 1rem;
        animation: fadeIn 0.18s ease-out;
      }
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      .modal-card {
        background: #ffffff;
        width: min(440px, 100%);
        max-height: 90vh;
        overflow-y: auto;
        border-radius: 18px;
        box-shadow: 0 24px 60px rgba(0, 0, 0, 0.25);
        border: 1px solid #e5e0d7;
        display: flex;
        flex-direction: column;
        animation: scaleUp 0.18s ease-out;
      }
      @keyframes scaleUp {
        from { transform: scale(0.96); opacity: 0; }
        to { transform: scale(1); opacity: 1; }
      }
      .modal-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 1.25rem 1.4rem;
        border-bottom: 1px solid #eee9e0;
      }
      .modal-title-wrap {
        display: flex;
        align-items: center;
        gap: 0.6rem;
      }
      .modal-icon {
        font-size: 1.3rem;
      }
      .modal-header h2 {
        margin: 0;
        font-size: 1.15rem;
        font-weight: 900;
        color: #09090c;
        letter-spacing: -0.02em;
      }
      .btn-close-modal {
        background: transparent;
        border: none;
        box-shadow: none;
        padding: 0.3rem 0.5rem;
        margin: 0;
        color: #78756c;
        font-size: 1.1rem;
        font-weight: 700;
        cursor: pointer;
        border-radius: 6px;
        transition: all 0.15s ease;
      }
      .btn-close-modal:hover {
        background: #f0ece3;
        color: #09090c;
        transform: none;
      }
      .modal-body {
        padding: 1.4rem;
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }
      .modal-desc {
        margin: 0;
        font-size: 0.92rem;
        color: #57554e;
        line-height: 1.45;
        font-weight: 600;
      }
      .modal-field {
        display: flex;
        flex-direction: column;
        gap: 0.4rem;
        font-size: 0.8rem;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        color: #09090c;
      }
      .code-input {
        letter-spacing: 0.25em;
        font-weight: 800;
        font-size: 1.15rem;
        text-align: center;
      }
      .dev-code-banner {
        background: #fff8e1;
        border: 1px dashed #ffd54f;
        border-radius: 8px;
        padding: 0.6rem 0.8rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.82rem;
        color: #6d4c41;
      }
      .dev-badge {
        background: #ffb300;
        color: #000;
        font-size: 0.65rem;
        font-weight: 900;
        padding: 0.2rem 0.4rem;
        border-radius: 4px;
        letter-spacing: 0.05em;
      }
      .dev-code-text {
        flex: 1;
      }
      .btn-autofill {
        background: #09090c;
        color: #fff;
        border: none;
        padding: 0.25rem 0.6rem;
        border-radius: 6px;
        font-size: 0.72rem;
        font-weight: 800;
        cursor: pointer;
        box-shadow: none;
        margin: 0;
        transition: opacity 0.15s ease;
      }
      .btn-autofill:hover {
        opacity: 0.85;
      }
      .modal-error {
        color: #ff1744;
        font-size: 0.84rem;
        font-weight: 700;
        background: rgba(255, 23, 68, 0.08);
        border: 1px solid rgba(255, 23, 68, 0.25);
        padding: 0.55rem 0.8rem;
        border-radius: 6px;
        margin: 0;
      }
      .btn-back-step {
        background: transparent;
        border: none;
        box-shadow: none;
        color: #78756c;
        font-size: 0.82rem;
        font-weight: 700;
        cursor: pointer;
        align-self: flex-start;
        padding: 0;
        margin: 0;
      }
      .btn-back-step:hover {
        background: transparent;
        color: #09090c;
        text-decoration: underline;
        transform: none;
        box-shadow: none;
      }
      .modal-actions {
        display: flex;
        justify-content: flex-end;
        align-items: center;
        gap: 0.65rem;
        margin-top: 0.5rem;
      }
      .btn-modal-cancel {
        background: #f0ece3;
        color: #09090c;
        border: none;
        padding: 0.75rem 1rem;
        border-radius: 8px;
        font-size: 0.88rem;
        font-weight: 800;
        cursor: pointer;
        box-shadow: none;
        margin: 0;
        transition: all 0.15s ease;
      }
      .btn-modal-cancel:hover {
        background: #e2ddd3;
        transform: none;
        box-shadow: none;
      }
      .btn-modal-submit {
        background: #ff1744;
        color: #ffffff;
        border: none;
        padding: 0.75rem 1.25rem;
        border-radius: 8px;
        font-size: 0.88rem;
        font-weight: 800;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(255, 23, 68, 0.3);
        margin: 0;
        transition: all 0.15s ease;
      }
      .btn-modal-submit:hover:not(:disabled) {
        background: #09090c;
        transform: translateY(-1px);
        box-shadow: 0 4px 14px rgba(0, 0, 0, 0.2);
      }
      .btn-modal-submit:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
      .btn-full {
        width: 100%;
        padding: 0.9rem 1rem;
        font-size: 0.95rem;
      }
      .success-body {
        align-items: center;
        text-align: center;
        padding: 2rem 1.4rem;
        gap: 0.8rem;
      }
      .success-icon-wrap {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background: #2e7d32;
        color: #ffffff;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 2rem;
        font-weight: 900;
        margin-bottom: 0.5rem;
        box-shadow: 0 8px 24px rgba(46, 125, 50, 0.3);
      }
      .success-body h3 {
        margin: 0;
        font-size: 1.25rem;
        font-weight: 900;
        color: #09090c;
      }
      .success-desc {
        margin: 0 0 1rem;
        color: #57554e;
        font-size: 0.92rem;
        line-height: 1.45;
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
        .modal-card {
          border-radius: 14px;
        }
        .modal-body {
          padding: 1.1rem;
        }
        .modal-actions {
          flex-direction: column-reverse;
          gap: 0.5rem;
        }
        .btn-modal-cancel, .btn-modal-submit {
          width: 100%;
          text-align: center;
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

  // Estat del modal de recuperació
  mostrarModalRecuperacio = false;
  pasRecuperacio: 1 | 2 | 3 = 1;
  recuperarEmail = '';
  recuperarCodi = '';
  recuperarCodiDev = '';
  novaContrasenya = '';
  confirmarContrasenya = '';
  recuperarLoading = false;
  recuperarError = '';

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

  // --- MÈTODES DE RECUPERACIÓ DE CONTRASENYA ---

  obrirModalRecuperacio(): void {
    this.mostrarModalRecuperacio = true;
    this.pasRecuperacio = 1;
    this.recuperarEmail = this.email.trim();
    this.recuperarCodi = '';
    this.recuperarCodiDev = '';
    this.novaContrasenya = '';
    this.confirmarContrasenya = '';
    this.recuperarError = '';
  }

  tancarModalRecuperacio(): void {
    this.mostrarModalRecuperacio = false;
    this.recuperarLoading = false;
  }

  tornarPas1(): void {
    this.pasRecuperacio = 1;
    this.recuperarError = '';
  }

  autoOmplirCodiDev(): void {
    if (this.recuperarCodiDev) {
      this.recuperarCodi = this.recuperarCodiDev;
    }
  }

  sollicitarCodi(): void {
    const mail = this.recuperarEmail.trim();
    if (!mail) {
      this.recuperarError = 'AUTH.LOGIN.ERROR_REQUIRED';
      return;
    }
    this.recuperarLoading = true;
    this.recuperarError = '';

    this.authService.demanarRecuperacio(mail).subscribe({
      next: (resp) => {
        this.recuperarLoading = false;
        if (resp && resp.codiDev) {
          this.recuperarCodiDev = resp.codiDev;
          this.recuperarCodi = resp.codiDev; // Auto-omplim de conveniència per facilitar el test ràpid
        }
        this.pasRecuperacio = 2;
      },
      error: (err) => {
        this.recuperarLoading = false;
        if (err.status === 0) {
          this.recuperarError = 'AUTH.LOGIN.ERROR_SERVER';
        } else {
          this.recuperarError = err?.error?.message || 'AUTH.LOGIN.ERROR_GENERIC';
        }
      }
    });
  }

  aplicarNovaContrasenya(): void {
    const codi = this.recuperarCodi.trim();
    const p1 = this.novaContrasenya.trim();
    const p2 = this.confirmarContrasenya.trim();

    if (!codi) {
      this.recuperarError = 'AUTH.LOGIN.RECOVERY_CODE_LABEL';
      return;
    }
    if (p1.length < 6) {
      this.recuperarError = 'AUTH.LOGIN.RECOVERY_PWD_LENGTH';
      return;
    }
    if (p1 !== p2) {
      this.recuperarError = 'AUTH.LOGIN.RECOVERY_PWD_MISMATCH';
      return;
    }

    this.recuperarLoading = true;
    this.recuperarError = '';

    this.authService.restablirContrasenya(this.recuperarEmail.trim(), codi, p1).subscribe({
      next: () => {
        this.recuperarLoading = false;
        this.pasRecuperacio = 3;
      },
      error: (err) => {
        this.recuperarLoading = false;
        if (err.status === 0) {
          this.recuperarError = 'AUTH.LOGIN.ERROR_SERVER';
        } else {
          this.recuperarError = err?.error?.message || 'AUTH.LOGIN.ERROR_GENERIC';
        }
      }
    });
  }

  tancarModalAmbExit(): void {
    this.email = this.recuperarEmail.trim();
    this.password = this.novaContrasenya.trim();
    this.tancarModalRecuperacio();
  }
}
