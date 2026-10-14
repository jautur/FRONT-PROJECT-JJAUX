import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService, RegisterData } from '../../../core/services/auth.service';

/**
 * Component de Registre d'usuaris (/registre).
 * Permet a nous usuaris crear un compte a la plataforma JJAUX escollint
 * si volen actuar com a Clients (publicar tasques), Professionals (enviar ofertes)
 * o Ambdós (funcionalitat híbrida completa: client i professional a la vegada).
 */
@Component({
  selector: 'app-registre',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <section class="auth-card">
      <h1>Crear un compte</h1>
      <p class="subtitle">Uneix-te a la comunitat JJAUX de clients i professionals.</p>

      <div *ngIf="errorMessage" class="alert alert-danger">
        {{ errorMessage }}
      </div>

      <form (ngSubmit)="onRegister()">
        <label>
          Nom complet o comercial
          <input type="text" [(ngModel)]="formData.nom" name="nom" required placeholder="Ex: Joan Garcia" />
        </label>

        <label>
          Correu electrònic
          <input type="email" [(ngModel)]="formData.email" name="email" required placeholder="nom@exemple.cat" />
        </label>

        <label>
          Tipus de compte (Rol)
          <div class="role-selector">
            <button
              type="button"
              class="role-btn"
              [class.active]="formData.rol === 'client'"
              (click)="formData.rol = 'client'">
              <strong>Client</strong>
              <small>Publicar feines</small>
            </button>
            <button
              type="button"
              class="role-btn"
              [class.active]="formData.rol === 'professional'"
              (click)="formData.rol = 'professional'">
              <strong>Professional</strong>
              <small>Oferir serveis</small>
            </button>
            <button
              type="button"
              class="role-btn"
              [class.active]="formData.rol === 'ambdos'"
              (click)="formData.rol = 'ambdos'">
              <strong>Ambdós</strong>
              <small>Client & Professional</small>
            </button>
          </div>
        </label>

        <label>
          Contrasenya
          <input type="password" [(ngModel)]="formData.password" name="password" required minlength="6" placeholder="Mínim 6 caràcters" />
        </label>

        <button type="submit" class="submit-btn" [disabled]="loading">
          {{ loading ? 'Creant compte...' : 'Registrar-me' }}
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
        margin: 0 0 1.5rem;
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

      .role-selector {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 0.5rem;
        margin-top: 0.2rem;
      }

      .role-btn {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        padding: 0.75rem 0.35rem;
        background: #f8fafc;
        border: 2px solid #e2e8f0;
        border-radius: 12px;
        cursor: pointer;
        transition: all 0.15s ease;
      }

      .role-btn strong {
        font-size: 0.88rem;
        color: #1e293b;
      }

      .role-btn small {
        font-size: 0.72rem;
        color: #64748b;
        margin-top: 0.2rem;
      }

      .role-btn.active {
        background: #eff6ff;
        border-color: #2563eb;
      }

      .role-btn.active strong {
        color: #2563eb;
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
    password: ''
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
   * Envia les dades de registre al backend per crear l'usuari a PostgreSQL.
   */
  onRegister(): void {
    if (!this.formData.nom || !this.formData.email || !this.formData.password) {
      this.errorMessage = 'Cal emplenar tots els camps obligatoris.';
      return;
    }

    if (this.formData.password.length < 6) {
      this.errorMessage = 'La contrasenya ha de tenir com a mínim 6 caràcters.';
      return;
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
