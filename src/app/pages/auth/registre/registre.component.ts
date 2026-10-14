import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService, RegisterData } from '../../../core/services/auth.service';

/**
 * Component de Registre d'usuaris (/registre).
 * Implementa el model d'herència de JJAUX:
 * - Client: requereix email i contrasenya; pot publicar peticions i feines.
 * - Professional (fill del client): hereta tot el que fa el client, requereix a més
 *   un número de telèfon obligatori i pot resoldre peticions (presentar ofertes).
 */
@Component({
  selector: 'app-registre',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <section class="auth-card">
      <h1>Crear un compte</h1>
      <p class="subtitle">Registra't a JJAUX com a client o com a professional.</p>

      <div *ngIf="errorMessage" class="alert alert-danger">
        {{ errorMessage }}
      </div>

      <form (ngSubmit)="onRegister()">
        <!-- Selecció de Tipus de Compte (Herència) -->
        <label>
          Tipus de compte
          <div class="role-selector">
            <button
              type="button"
              class="role-btn"
              [class.active]="formData.rol === 'client'"
              (click)="onSelectRole('client')">
              <strong>Client</strong>
              <small>Publicar feines i peticions</small>
            </button>

            <button
              type="button"
              class="role-btn"
              [class.active]="formData.rol === 'professional'"
              (click)="onSelectRole('professional')">
              <strong>Professional</strong>
              <small>Client + Resoldre peticions (requereix telèfon)</small>
            </button>
          </div>
        </label>

        <!-- Informació pedagògica del rol seleccionat -->
        <div class="role-info-box" [ngClass]="formData.rol">
          <div *ngIf="formData.rol === 'client'">
            ℹ️ Com a <strong>Client</strong>, podràs publicar peticions de feina i revisar pressupostos. Només requereix correu i contrasenya.
          </div>
          <div *ngIf="formData.rol === 'professional'">
            ℹ️ Com a <strong>Professional</strong> (fill del client), podràs fer tot el que fa el client (publicar feines) i a més <strong>resoldre peticions</strong> d'altres usuaris. Requereix telèfon obligatori.
          </div>
        </div>

        <label>
          Nom complet o comercial *
          <input type="text" [(ngModel)]="formData.nom" name="nom" required placeholder="Ex: Joan Garcia" />
        </label>

        <label>
          Correu electrònic *
          <input type="email" [(ngModel)]="formData.email" name="email" required placeholder="nom@exemple.cat" />
        </label>

        <!-- Telèfon obligatori per a professionals -->
        <label *ngIf="formData.rol === 'professional'">
          Telèfon de contacte (Obligatori per a professionals) *
          <input
            type="tel"
            [(ngModel)]="formData.telefon"
            name="telefon"
            required
            placeholder="Ex: +34 600 123 456"
            class="input-required"
          />
          <small class="hint">Necessari perquè els clients et puguin contactar quan resolguis les seves peticions.</small>
        </label>

        <label>
          Contrasenya *
          <input type="password" [(ngModel)]="formData.password" name="password" required minlength="6" placeholder="Mínim 6 caràcters" />
        </label>

        <button type="submit" class="submit-btn" [disabled]="loading">
          {{ loading ? 'Creant compte...' : 'Registrar-me com a ' + (formData.rol === 'professional' ? 'Professional' : 'Client') }}
        </button>

        <p class="footer-hint">
          Ja tens compte? <a routerLink="/login">Inicia sessió aquí</a>
        </p>
      </form>
    </section>
  `,
  styles: [
    `
      .auth-card {
        width: min(520px, 100%);
        background: white;
        padding: 2.2rem;
        border-radius: 20px;
        box-shadow: 0 20px 40px rgba(15, 23, 42, 0.08);
      }

      h1 {
        margin: 0 0 0.4rem;
        font-size: 1.7rem;
        color: #0f172a;
      }

      .subtitle {
        margin: 0 0 1.25rem;
        color: #64748b;
        font-size: 0.95rem;
      }

      form {
        display: flex;
        flex-direction: column;
        gap: 1.1rem;
      }

      label {
        display: flex;
        flex-direction: column;
        gap: 0.4rem;
        font-weight: 600;
        font-size: 0.9rem;
        color: #334155;
      }

      input {
        border: 1px solid #cbd5e1;
        border-radius: 10px;
        padding: 0.8rem 0.95rem;
        font-size: 0.95rem;
        transition: border-color 0.15s ease;
      }

      input:focus {
        outline: none;
        border-color: #2563eb;
      }

      .input-required {
        border-color: #0284c7;
        background: #f0f9ff;
      }

      .hint {
        font-size: 0.78rem;
        color: #64748b;
        font-weight: 400;
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
        padding: 0.85rem 0.5rem;
        background: #f8fafc;
        border: 2px solid #e2e8f0;
        border-radius: 12px;
        cursor: pointer;
        transition: all 0.15s ease;
      }

      .role-btn strong {
        font-size: 0.95rem;
        color: #1e293b;
      }

      .role-btn small {
        font-size: 0.75rem;
        color: #64748b;
        margin-top: 0.25rem;
      }

      .role-btn.active {
        background: #eff6ff;
        border-color: #2563eb;
      }

      .role-btn.active strong {
        color: #2563eb;
      }

      .role-info-box {
        padding: 0.75rem 1rem;
        border-radius: 10px;
        font-size: 0.85rem;
        line-height: 1.45;
      }

      .role-info-box.client {
        background: #f0f9ff;
        border: 1px solid #bae6fd;
        color: #0369a1;
      }

      .role-info-box.professional {
        background: #f0fdf4;
        border: 1px solid #bbf7d0;
        color: #166534;
      }

      .submit-btn {
        margin-top: 0.6rem;
        border: none;
        background: #10b981;
        color: white;
        padding: 0.95rem 1rem;
        border-radius: 10px;
        font-weight: 700;
        font-size: 1rem;
        cursor: pointer;
        transition: background 0.15s ease;
      }

      .submit-btn:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }

      .alert-danger {
        background: #fee2e2;
        color: #991b1b;
        padding: 0.75rem 1rem;
        border-radius: 10px;
        font-size: 0.9rem;
        margin-bottom: 0.5rem;
      }

      .footer-hint {
        text-align: center;
        font-size: 0.88rem;
        color: #64748b;
        margin: 0.5rem 0 0;
      }

      .footer-hint a {
        color: #2563eb;
        text-decoration: none;
        font-weight: 600;
      }
    `
  ]
})
export class RegistreComponent {
  /** Model del formulari de registre */
  formData: RegisterData = {
    nom: '',
    email: '',
    rol: 'client',
    password: '',
    telefon: ''
  };

  /** Estat de càrrega durant la petició */
  loading = false;

  /** Missatge d'error si falla el registre */
  errorMessage = '';

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  /**
   * Canvia el rol seleccionat.
   * @param rol 'client' o 'professional'
   */
  onSelectRole(rol: 'client' | 'professional'): void {
    this.formData.rol = rol;
    this.errorMessage = '';
  }

  /**
   * Valida i envia les dades de registre al backend.
   * Els clients necessiten correu i contrasenya.
   * Els professionals necessiten a més obligatòriament el telèfon.
   */
  onRegister(): void {
    if (!this.formData.nom || !this.formData.email || !this.formData.password) {
      this.errorMessage = 'Cal emplenar tots els camps obligatoris (nom, email i contrasenya).';
      return;
    }

    if (this.formData.password.length < 6) {
      this.errorMessage = 'La contrasenya ha de tenir com a mínim 6 caràcters.';
      return;
    }

    // Validació específica del fill (Professional): requereix telèfon
    if (this.formData.rol === 'professional') {
      if (!this.formData.telefon || !this.formData.telefon.trim()) {
        this.errorMessage = 'Com a Professional, el telèfon de contacte és obligatori per poder resoldre peticions.';
        return;
      }
    }

    this.loading = true;
    this.errorMessage = '';

    this.authService.register(this.formData).subscribe({
      next: () => {
        this.loading = false;
        // Sessió iniciada directament -> tornem a l'inici
        this.router.navigate(['/']);
      },
      error: () => {
        this.loading = false;
        this.errorMessage = 'No s’ha pogut completar el registre. El correu podria estar ja en ús.';
      }
    });
  }
}
