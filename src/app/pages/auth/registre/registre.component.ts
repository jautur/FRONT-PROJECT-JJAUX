import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService, RegisterData } from '../../../core/services/auth.service';
import { TermesModalComponent } from '../termes-modal/termes-modal.component';

import { TranslatePipe } from '../../../core/pipes/translate.pipe';

/**
 * Component de Registre d'usuaris (/registre).
 * Implementa el model d'herència de AVISA:
 * - Client: requereix email i contrasenya; pot publicar peticions i feines.
 * - Professional (fill del client): hereta tot el que fa el client, requereix a més
 *   un número de telèfon obligatori i pot resoldre peticions (presentar ofertes).
 * 
 * Inclou formulari reactiu (ReactiveFormsModule) amb dues caselles obligatòries
 * no marcades per defecte (Validators.requiredTrue):
 * - acceptedTerms: Termes i Condicions d'Ús d'AVISA.
 * - acceptedPrivacy: Política de Privacitat i protecció de dades.
 * 
 * Permet obrir el modal amb el text legal complet sense sortir del formulari.
 */
@Component({
  selector: 'app-registre',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, TermesModalComponent, TranslatePipe],
  template: `
    <section class="auth-card">
      <h1>{{ 'AUTH.REGISTER.TITLE' | translate }}</h1>
      <p class="subtitle">{{ 'AUTH.REGISTER.SUBTITLE' | translate }}</p>

      <div *ngIf="errorMessage" class="alert alert-danger" role="alert">
        {{ errorMessage | translate }}
      </div>

      <form [formGroup]="registerForm" (ngSubmit)="onRegister()">
        <!-- Selecció de Tipus de Compte (Herència) -->
        <div class="field-wrap">
          <span class="field-label">{{ 'AUTH.REGISTER.ACCOUNT_TYPE' | translate }}</span>
          <div class="role-selector">
            <button
              type="button"
              class="role-btn"
              [class.active]="registerForm.get('rol')?.value === 'client'"
              (click)="onSelectRole('client')">
              <strong>{{ 'AUTH.REGISTER.ROLE_CLIENT_TITLE' | translate }}</strong>
              <small>{{ 'AUTH.REGISTER.ROLE_CLIENT_SUB' | translate }}</small>
            </button>

            <button
              type="button"
              class="role-btn"
              [class.active]="registerForm.get('rol')?.value === 'professional'"
              (click)="onSelectRole('professional')">
              <strong>{{ 'AUTH.REGISTER.ROLE_PRO_TITLE' | translate }}</strong>
              <small>{{ 'AUTH.REGISTER.ROLE_PRO_SUB' | translate }}</small>
            </button>
          </div>
        </div>

        <!-- Informació pedagògica del rol seleccionat -->
        <div class="role-info-box" [ngClass]="registerForm.get('rol')?.value">
          <div *ngIf="registerForm.get('rol')?.value === 'client'">
            {{ 'AUTH.REGISTER.CLIENT_INFO' | translate }}
          </div>
          <div *ngIf="registerForm.get('rol')?.value === 'professional'">
            {{ 'AUTH.REGISTER.PRO_INFO' | translate }}
            <div style="margin-top: 0.5rem; color: #166534; font-weight: 600; display: flex; align-items: flex-start; gap: 0.35rem; line-height: 1.45;">
              <span>🎉</span>
              <span><strong>{{ 'AUTH.REGISTER.PRO_PROMO_TITLE' | translate }}</strong> {{ 'AUTH.REGISTER.PRO_PROMO_DESC' | translate }}</span>
            </div>
          </div>
        </div>

        <!-- Nom complet -->
        <label>
          {{ 'AUTH.REGISTER.NAME_LABEL' | translate }}
          <input
            type="text"
            formControlName="nom"
            required
            [placeholder]="'AUTH.REGISTER.NAME_PLACEHOLDER' | translate"
            [class.input-error]="submitted && registerForm.get('nom')?.invalid"
          />
          <small *ngIf="submitted && registerForm.get('nom')?.hasError('required')" class="field-error-text">
            {{ 'AUTH.REGISTER.NAME_REQUIRED' | translate }}
          </small>
        </label>

        <!-- Correu electrònic -->
        <label>
          {{ 'AUTH.REGISTER.EMAIL_LABEL' | translate }}
          <input
            type="email"
            formControlName="email"
            required
            placeholder="nom@exemple.cat"
            autocapitalize="none"
            spellcheck="false"
            [class.input-error]="submitted && registerForm.get('email')?.invalid"
          />
          <small *ngIf="submitted && registerForm.get('email')?.hasError('required')" class="field-error-text">
            {{ 'AUTH.REGISTER.EMAIL_REQUIRED' | translate }}
          </small>
          <small *ngIf="submitted && registerForm.get('email')?.hasError('email')" class="field-error-text">
            {{ 'AUTH.REGISTER.EMAIL_INVALID' | translate }}
          </small>
        </label>

        <!-- Telèfon obligatori per a professionals -->
        <label *ngIf="registerForm.get('rol')?.value === 'professional'">
          {{ 'AUTH.REGISTER.PHONE_LABEL' | translate }}
          <input
            type="tel"
            formControlName="telefon"
            required
            placeholder="Ex: +34 600 123 456"
            class="input-required"
            [class.input-error]="submitted && registerForm.get('rol')?.value === 'professional' && !registerForm.get('telefon')?.value"
          />
          <small class="hint">{{ 'AUTH.REGISTER.PHONE_HINT' | translate }}</small>
          <small *ngIf="submitted && registerForm.get('rol')?.value === 'professional' && !registerForm.get('telefon')?.value" class="field-error-text">
            {{ 'AUTH.REGISTER.PHONE_REQUIRED' | translate }}
          </small>
        </label>

        <!-- Contrasenya -->
        <label>
          {{ 'AUTH.REGISTER.PASSWORD_LABEL' | translate }}
          <input
            type="password"
            formControlName="password"
            required
            minlength="6"
            placeholder="Mínim 6 caràcters"
            [class.input-error]="submitted && registerForm.get('password')?.invalid"
          />
          <small *ngIf="submitted && registerForm.get('password')?.hasError('required')" class="field-error-text">
            {{ 'AUTH.REGISTER.PASSWORD_REQUIRED' | translate }}
          </small>
          <small *ngIf="submitted && registerForm.get('password')?.hasError('minlength')" class="field-error-text">
            {{ 'AUTH.REGISTER.PASSWORD_MINLENGTH' | translate }}
          </small>
        </label>

        <!-- Caselles de verificació obligatòries (Termes i Privacitat) -->
        <div class="legal-checkboxes-block">
          <!-- Checkbox 1: Termes i Condicions d'Ús -->
          <div class="legal-checkbox-item">
            <label class="checkbox-container" [class.field-error]="submitted && registerForm.get('acceptedTerms')?.invalid">
              <input
                type="checkbox"
                formControlName="acceptedTerms"
                id="acceptedTerms"
                class="native-checkbox"
              />
              <span class="checkbox-label-text">
                {{ 'AUTH.REGISTER.TERMS_READ' | translate }}
                <button
                  type="button"
                  class="link-terms-btn"
                  (click)="obrirModalTermes('termes')">
                  {{ 'AUTH.REGISTER.TERMS_LINK' | translate }}
                </button> *
              </span>
            </label>
            <div *ngIf="submitted && registerForm.get('acceptedTerms')?.hasError('required')" class="checkbox-error-msg">
              {{ 'AUTH.REGISTER.TERMS_REQUIRED' | translate }}
            </div>
          </div>

          <!-- Checkbox 2: Política de Privacitat -->
          <div class="legal-checkbox-item">
            <label class="checkbox-container" [class.field-error]="submitted && registerForm.get('acceptedPrivacy')?.invalid">
              <input
                type="checkbox"
                formControlName="acceptedPrivacy"
                id="acceptedPrivacy"
                class="native-checkbox"
              />
              <span class="checkbox-label-text">
                {{ 'AUTH.REGISTER.PRIVACY_READ' | translate }}
                <button
                  type="button"
                  class="link-terms-btn"
                  (click)="obrirModalTermes('privacitat')">
                  {{ 'AUTH.REGISTER.PRIVACY_LINK' | translate }}
                </button> *
              </span>
            </label>
            <div *ngIf="submitted && registerForm.get('acceptedPrivacy')?.hasError('required')" class="checkbox-error-msg">
              {{ 'AUTH.REGISTER.PRIVACY_REQUIRED' | translate }}
            </div>
          </div>
        </div>

        <button type="submit" class="submit-btn" [disabled]="loading">
          {{ loading ? ('AUTH.REGISTER.SUBMITTING' | translate) : ('AUTH.REGISTER.SUBMIT_PREFIX' | translate) + (registerForm.get('rol')?.value === 'professional' ? ('AUTH.REGISTER.ROLE_PRO_TITLE' | translate) : ('AUTH.REGISTER.ROLE_CLIENT_TITLE' | translate)) }}
        </button>

        <p class="footer-hint">
          {{ 'AUTH.REGISTER.ALREADY_ACCOUNT' | translate }} <a routerLink="/login">{{ 'AUTH.REGISTER.LOGIN_HERE' | translate }}</a>
        </p>
      </form>

      <!-- Modal emergent amb el text legal complet -->
      <app-termes-modal
        *ngIf="showTermsModal"
        [isModal]="true"
        [activeTab]="modalActiveTab"
        (close)="tancarModalTermes()"
        (accept)="onAcceptLegal($event)">
      </app-termes-modal>
    </section>
  `,
  styles: [
    `
      .auth-card {
        width: min(540px, 100%);
        background: #ffffff;
        padding: 2.4rem;
        border-radius: 20px;
        border: 1px solid #e5e0d7;
        box-shadow: 0 16px 40px rgba(0, 0, 0, 0.06);
        color: #09090c;
        box-sizing: border-box;
      }

      h1 {
        margin: 0 0 0.4rem;
        font-size: 1.85rem;
        font-weight: 900;
        color: #09090c;
        letter-spacing: -0.03em;
      }

      .subtitle {
        margin: 0 0 1.4rem;
        color: #57554e;
        font-size: 0.95rem;
        font-weight: 600;
      }

      form {
        display: flex;
        flex-direction: column;
        gap: 1.15rem;
      }

      .field-wrap {
        display: flex;
        flex-direction: column;
        gap: 0.4rem;
      }

      .field-label,
      label {
        display: flex;
        flex-direction: column;
        gap: 0.4rem;
        font-weight: 800;
        font-size: 0.82rem;
        color: #09090c;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      input[type="text"],
      input[type="email"],
      input[type="tel"],
      input[type="password"] {
        background: #ffffff;
        color: #09090c;
        border: 1px solid #dcd7ce;
        border-radius: 10px;
        padding: 0.85rem 1rem;
        font-size: 0.95rem;
        font-weight: 600;
        outline: none;
        box-sizing: border-box;
        width: 100%;
        transition: border-color 0.15s ease, box-shadow 0.15s ease;
      }

      input:focus {
        border-color: #ff1744;
        box-shadow: 0 0 0 3px rgba(255, 23, 68, 0.15), 0 0 14px rgba(255, 23, 68, 0.25);
      }

      .input-required {
        border-color: #ff1744;
        background: rgba(255, 23, 68, 0.02);
      }

      .input-error {
        border-color: #ef4444 !important;
        background: #fef2f2 !important;
      }

      .field-error-text {
        font-size: 0.78rem;
        font-weight: 700;
        color: #dc2626;
        text-transform: none;
        letter-spacing: normal;
        margin-top: 0.15rem;
      }

      .hint {
        font-size: 0.78rem;
        color: #7d7a72;
        font-weight: 600;
        text-transform: none;
        letter-spacing: normal;
      }

      .role-selector {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 0.75rem;
        margin-top: 0.2rem;
      }

      .role-btn {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        padding: 0.95rem 0.6rem;
        background: #faf8f4;
        border: 2px solid #e5e0d7;
        border-radius: 12px;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .role-btn strong {
        font-size: 0.95rem;
        font-weight: 900;
        color: #09090c;
      }

      .role-btn small {
        font-size: 0.75rem;
        color: #57554e;
        margin-top: 0.25rem;
        font-weight: 600;
      }

      .role-btn.active {
        background: rgba(255, 23, 68, 0.08);
        border-color: #ff1744;
        box-shadow: 0 0 16px rgba(255, 23, 68, 0.25);
      }

      .role-btn.active strong {
        color: #ff1744;
      }

      .role-info-box {
        padding: 0.85rem 1.1rem;
        border-radius: 10px;
        font-size: 0.88rem;
        line-height: 1.45;
        font-weight: 600;
        background: #faf8f4;
        border: 1px solid #e5e0d7;
        color: #09090c;
      }

      .role-info-box.client {
        border-left: 4px solid #09090c;
      }

      .role-info-box.professional {
        border-left: 4px solid #ff1744;
        color: #09090c;
      }

      /* Bloc de caselles de verificació legal */
      .legal-checkboxes-block {
        background: #faf8f4;
        border: 1px solid #e5e0d7;
        border-radius: 14px;
        padding: 1.15rem;
        display: flex;
        flex-direction: column;
        gap: 0.85rem;
        margin: 0.35rem 0;
      }

      .legal-checkbox-item {
        display: flex;
        flex-direction: column;
      }

      .checkbox-container {
        display: flex;
        flex-direction: row;
        align-items: flex-start;
        gap: 0.75rem;
        cursor: pointer;
        font-weight: 600;
        font-size: 0.88rem;
        color: #2b2a26;
        text-transform: none;
        letter-spacing: normal;
        user-select: none;
      }

      .native-checkbox {
        width: 19px;
        height: 19px;
        accent-color: #ff1744;
        cursor: pointer;
        margin-top: 2px;
        flex-shrink: 0;
      }

      .checkbox-label-text {
        line-height: 1.4;
      }

      .link-terms-btn {
        background: transparent;
        border: none;
        padding: 0;
        font-family: inherit;
        font-size: inherit;
        font-weight: 800;
        color: #ff1744;
        text-decoration: underline;
        cursor: pointer;
        display: inline;
        transition: color 0.15s ease;
      }

      .link-terms-btn:hover {
        color: #09090c;
      }

      .checkbox-error-msg {
        font-size: 0.78rem;
        font-weight: 700;
        color: #dc2626;
        margin-top: 0.3rem;
        margin-left: 1.9rem;
      }

      .submit-btn {
        margin-top: 0.5rem;
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

      .submit-btn:hover:not(:disabled) {
        background: #09090c;
        color: #ffffff;
        box-shadow: 0 6px 22px rgba(0, 0, 0, 0.25);
        transform: translateY(-2px);
      }

      .submit-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .alert-danger {
        background: #fee2e2;
        border: 1px solid rgba(239, 68, 68, 0.4);
        color: #991b1b;
        padding: 0.75rem 1rem;
        border-radius: 10px;
        font-size: 0.9rem;
        font-weight: 700;
        margin-bottom: 0.5rem;
      }

      .footer-hint {
        text-align: center;
        font-size: 0.88rem;
        color: #57554e;
        margin: 0.5rem 0 0;
        font-weight: 600;
      }

      .footer-hint a {
        color: #ff1744;
        text-decoration: none;
        font-weight: 800;
      }

      @media (max-width: 520px) {
        .auth-card {
          padding: 1.5rem 1.15rem;
          border-radius: 14px;
        }
        .role-selector {
          grid-template-columns: 1fr;
        }
        .legal-checkboxes-block {
          padding: 0.85rem;
        }
      }
    `
  ]
})
export class RegistreComponent implements OnInit {
  /** Formulari reactiu de registre */
  registerForm!: FormGroup;

  /** Estat d'enviament per mostrar errors visuals */
  submitted = false;

  /** Estat de càrrega durant la petició HTTP */
  loading = false;

  /** Missatge d'error general o del servidor */
  errorMessage = '';

  /** Control de visibilitat del modal legal */
  showTermsModal = false;

  /** Pestanya activa del modal ('termes' o 'privacitat') */
  modalActiveTab: 'termes' | 'privacitat' = 'termes';

  constructor(
    private readonly fb: FormBuilder,
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    // Inicialització del formulari reactiu amb les dues caselles obligatòries no marcades per defecte
    this.registerForm = this.fb.group({
      rol: ['client', [Validators.required]],
      nom: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      telefon: [''],
      password: ['', [Validators.required, Validators.minLength(6)]],
      acceptedTerms: [false, [Validators.requiredTrue]],
      acceptedPrivacy: [false, [Validators.requiredTrue]]
    });
  }

  /**
   * Canvia el rol seleccionat al formulari reactiu.
   * @param rol 'client' o 'professional'
   */
  onSelectRole(rol: 'client' | 'professional'): void {
    this.registerForm.patchValue({ rol });
    this.errorMessage = '';
  }

  /**
   * Obre el modal legal a la pestanya de termes o de privacitat.
   */
  obrirModalTermes(tab: 'termes' | 'privacitat'): void {
    this.modalActiveTab = tab;
    this.showTermsModal = true;
  }

  /**
   * Tanca el modal legal.
   */
  tancarModalTermes(): void {
    this.showTermsModal = false;
  }

  /**
   * Gestiona l'acceptació del document des del botó d'acció del propi modal.
   * Marca automàticament la casella corresponent.
   */
  onAcceptLegal(tab: 'termes' | 'privacitat'): void {
    if (tab === 'termes') {
      this.registerForm.patchValue({ acceptedTerms: true });
      this.registerForm.get('acceptedTerms')?.markAsTouched();
    } else {
      this.registerForm.patchValue({ acceptedPrivacy: true });
      this.registerForm.get('acceptedPrivacy')?.markAsTouched();
    }
  }

  /**
   * Valida i envia les dades de registre al backend Spring Boot.
   * Comprova requisits del client, requisits del professional (telèfon)
   * i l'acceptació obligatòria de termes i privacitat.
   */
  onRegister(): void {
    this.submitted = true;
    this.errorMessage = '';

    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();

      if (this.registerForm.get('acceptedTerms')?.hasError('required')) {
        this.errorMessage = 'Cal acceptar els termes i condicions per poder registrar-se.';
        return;
      }
      if (this.registerForm.get('acceptedPrivacy')?.hasError('required')) {
        this.errorMessage = 'Cal acceptar la política de privacitat per poder registrar-se.';
        return;
      }
      this.errorMessage = 'Si us plau, revisa els camps obligatoris del formulari.';
      return;
    }

    const formVal = this.registerForm.value;

    // Validació específica del fill (Professional): requereix telèfon obligatori
    if (formVal.rol === 'professional') {
      if (!formVal.telefon || !formVal.telefon.trim()) {
        this.errorMessage = 'Com a Professional, el telèfon de contacte és obligatori per poder resoldre peticions.';
        return;
      }
    }

    this.loading = true;

    const registerData: RegisterData = {
      nom: (formVal.nom || '').trim(),
      email: (formVal.email || '').trim(),
      rol: formVal.rol,
      telefon: formVal.telefon ? formVal.telefon.trim() : '',
      password: formVal.password,
      acceptedTerms: !!formVal.acceptedTerms,
      acceptedPrivacy: !!formVal.acceptedPrivacy
    };

    this.authService.register(registerData).subscribe({
      next: () => {
        this.loading = false;
        // Sessió iniciada directament -> tornem a la pàgina principal
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.loading = false;
        if (err.status === 400 && err.error?.missatges) {
          const msgs = Object.values(err.error.missatges).join(' ');
          this.errorMessage = msgs || 'Dades de registre incorrectes.';
        } else if (err.error?.error && typeof err.error.error === 'string') {
          this.errorMessage = err.error.error;
        } else if (err.status === 0 || err.status === 502 || err.status === 504) {
          this.errorMessage = 'El servidor no respon. Comprova que el backend estigui actiu al port 8080.';
        } else {
          this.errorMessage = 'No s’ha pogut completar el registre. El correu podria estar ja en ús o el servidor no respon.';
        }
      }
    });
  }
}
