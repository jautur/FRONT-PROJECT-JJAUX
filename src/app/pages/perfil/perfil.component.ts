import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Usuari } from '../../models/usuari.model';
import { UsuariService } from '../../services/usuari.service';
import { AuthService } from '../../core/services/auth.service';

/**
 * Component de Perfil d'Usuari (/perfil).
 * Permet a l'usuari autenticat:
 * 1. Consultar la seva informació actual (nom, correu, rol, telèfon, biografia).
 * 2. Editar i desar canvis a la base de dades PostgreSQL mitjançant UsuariService.
 * 3. Canviar la seva contrasenya d'accés de forma segura.
 * 4. Visualitzar l'estat del seu compte i els permisos segons el seu rol.
 */
@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="perfil-container">
      <!-- Capçalera del Perfil -->
      <header class="perfil-header">
        <div class="avatar-badge">
          {{ userInitial }}
        </div>
        <div class="header-info">
          <h1>{{ usuari?.nom || 'El meu perfil' }}</h1>
          <p class="email">{{ usuari?.email }}</p>
          <span class="role-badge" [ngClass]="usuari?.rol">
            {{ usuari?.rol | uppercase }}
          </span>
        </div>
      </header>

      <!-- Missatges d'alerta o notificació -->
      <div *ngIf="successMessage" class="alert alert-success">
        {{ successMessage }}
      </div>
      <div *ngIf="errorMessage" class="alert alert-danger">
        {{ errorMessage }}
      </div>

      <div class="perfil-grid">
        <!-- Formulari d'edició de dades bàsiques -->
        <article class="card">
          <h2>Dades personals</h2>
          <p class="subtitle">Actualitza la teva informació de contacte i presentació.</p>

          <form (ngSubmit)="onSaveProfile()">
            <label>
              Nom complet o comercial
              <input type="text" [(ngModel)]="formData.nom" name="nom" required placeholder="El teu nom" />
            </label>

            <label>
              Correu electrònic
              <input type="email" [value]="usuari?.email" disabled class="input-disabled" />
              <small class="hint">El correu s'utilitza per identificar el compte i no es pot canviar directament.</small>
            </label>

            <label>
              Telèfon de contacte
              <input type="tel" [(ngModel)]="formData.telefon" name="telefon" placeholder="+34 600 000 000" />
            </label>

            <label>
              Biografia / Presentació
              <textarea [(ngModel)]="formData.bio" name="bio" rows="4" placeholder="Explica breument la teva experiència o serveis..."></textarea>
            </label>

            <button type="submit" class="btn btn-primary" [disabled]="saving">
              {{ saving ? 'Desant...' : 'Desar canvis' }}
            </button>
          </form>
        </article>

        <!-- Secció de Seguretat i Canvi de contrasenya -->
        <div class="side-column">
          <article class="card">
            <h2>Seguretat del compte</h2>
            <p class="subtitle">Canvia la contrasenya d'accés a la plataforma.</p>

            <form (ngSubmit)="onChangePassword()">
              <label>
                Nova contrasenya
                <input type="password" [(ngModel)]="passwordData.newPassword" name="newPassword" required minlength="6" placeholder="Mínim 6 caràcters" />
              </label>

              <label>
                Repeteix la nova contrasenya
                <input type="password" [(ngModel)]="passwordData.confirmPassword" name="confirmPassword" required placeholder="Repeteix la contrasenya" />
              </label>

              <button type="submit" class="btn btn-secondary" [disabled]="changingPassword">
                {{ changingPassword ? 'Actualitzant...' : 'Actualitzar contrasenya' }}
              </button>
            </form>
          </article>

          <!-- Targeta informativa de rol -->
          <article class="card info-card">
            <h3>Informació del Rol</h3>
            <div *ngIf="usuari?.rol === 'client'">
              <p>Com a <strong>Client</strong>, pots publicar peticions i feines, rebre pressupostos i contractar serveis. Només necessites correu i contrasenya.</p>
            </div>
            <div *ngIf="usuari?.rol === 'professional'">
              <p>Com a <strong>Professional</strong> (fill del client), disposes de totes les funcions del client (publicar feines) i a més disposes de telèfon per <strong>resoldre peticions</strong> i enviar pressupostos a altres usuaris.</p>
            </div>
            <div *ngIf="usuari?.rol === 'admin'">
              <p>Com a <strong>Administrador</strong>, tens accés global de gestió d'usuaris, supervisió de tasques i configuració d'avisos.</p>
            </div>
          </article>
        </div>
      </div>
    </section>
  `,
  styles: [
    `
      .perfil-container {
        width: min(1000px, 100%);
        display: flex;
        flex-direction: column;
        gap: 1.75rem;
      }

      .perfil-header {
        background: #ffffff;
        color: #09090c;
        padding: 2.2rem;
        border-radius: 20px;
        border: 1px solid #e5e0d7;
        display: flex;
        align-items: center;
        gap: 1.75rem;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
      }

      .avatar-badge {
        width: 76px;
        height: 76px;
        background: #09090c;
        color: #ffffff;
        border: 3px solid var(--neon, #ff1744);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 2.2rem;
        font-weight: 900;
        box-shadow: 0 0 16px rgba(255, 23, 68, 0.35);
      }

      .header-info h1 {
        margin: 0;
        font-size: 2rem;
        font-weight: 900;
        color: #09090c;
        letter-spacing: -0.03em;
      }

      .header-info .email {
        margin: 0.35rem 0 0.65rem;
        color: #636058;
        font-size: 0.95rem;
        font-weight: 600;
      }

      .role-badge {
        display: inline-block;
        padding: 0.3rem 0.85rem;
        border-radius: 6px;
        font-size: 0.75rem;
        font-weight: 900;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        border: 1px solid transparent;
      }

      .role-badge.client {
        background: #f0ece3;
        color: #09090c;
        border-color: #dcd6cb;
      }

      .role-badge.professional {
        background: rgba(255, 23, 68, 0.08);
        color: var(--neon, #ff1744);
        border-color: rgba(255, 23, 68, 0.3);
      }

      .role-badge.admin {
        background: #09090c;
        color: #ffffff;
        border-color: var(--neon, #ff1744);
        box-shadow: 0 0 10px rgba(255, 23, 68, 0.3);
      }

      .perfil-grid {
        display: grid;
        grid-template-columns: 3fr 2fr;
        gap: 1.75rem;
      }

      @media (max-width: 850px) {
        .perfil-grid {
          grid-template-columns: 1fr;
        }
      }

      .side-column {
        display: flex;
        flex-direction: column;
        gap: 1.75rem;
      }

      .card {
        background: #ffffff;
        padding: 2rem;
        border-radius: 18px;
        border: 1px solid #e5e0d7;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
      }

      .card h2 {
        margin: 0 0 0.35rem;
        font-size: 1.35rem;
        font-weight: 900;
        color: #09090c;
      }

      .subtitle {
        margin: 0 0 1.4rem;
        color: #636058;
        font-size: 0.9rem;
        font-weight: 600;
      }

      form {
        display: flex;
        flex-direction: column;
        gap: 1.15rem;
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

      input, textarea {
        background: #ffffff;
        color: #09090c;
        border: 1.5px solid #d6d0c4;
        border-radius: 10px;
        padding: 0.85rem 1rem;
        font-size: 0.95rem;
        font-weight: 600;
        font-family: inherit;
        outline: none;
        transition: border-color 0.15s ease, box-shadow 0.15s ease;
      }

      input:focus, textarea:focus {
        border-color: var(--neon, #ff1744);
        box-shadow: 0 0 12px rgba(255, 23, 68, 0.25);
      }

      .input-disabled {
        background: #f5f2eb;
        color: #8c887e;
        border-color: #e5e0d7;
        cursor: not-allowed;
      }

      .hint {
        font-size: 0.78rem;
        color: #7d796f;
        font-weight: 600;
      }

      .btn {
        padding: 0.85rem 1.4rem;
        border: none;
        border-radius: 10px;
        font-weight: 900;
        font-size: 0.95rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .btn-primary {
        background: var(--neon, #ff1744);
        color: #ffffff;
        margin-top: 0.6rem;
        box-shadow: 0 4px 16px rgba(255, 23, 68, 0.35);
      }

      .btn-primary:hover:not(:disabled) {
        background: #09090c;
        color: #ffffff;
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
        transform: translateY(-2px);
      }

      .btn-secondary {
        background: #f0ece3;
        color: #09090c;
        border: 1px solid #dcd6cb;
        margin-top: 0.6rem;
      }

      .btn-secondary:hover:not(:disabled) {
        border-color: #09090c;
        background: #09090c;
        color: #ffffff;
      }

      .info-card h3 {
        margin: 0 0 0.5rem;
        font-size: 1.15rem;
        font-weight: 900;
        color: #09090c;
      }

      .info-card p {
        margin: 0;
        color: #57554e;
        line-height: 1.55;
        font-size: 0.92rem;
        font-weight: 600;
      }

      .alert {
        padding: 0.95rem 1.35rem;
        border-radius: 12px;
        font-weight: 700;
        font-size: 0.95rem;
      }

      .alert-success {
        background: rgba(255, 23, 68, 0.08);
        color: var(--neon, #ff1744);
        border: 1px solid rgba(255, 23, 68, 0.25);
      }

      .alert-danger {
        background: #fef2f2;
        border: 1px solid #fecaca;
        color: #991b1b;
      }

      @media (max-width: 800px) {
        .perfil-grid {
          grid-template-columns: 1fr;
        }

        .perfil-header {
          flex-direction: column;
          text-align: center;
        }
      }
    `
  ]
})
export class PerfilComponent implements OnInit {
  /** Dades de l'usuari actual */
  usuari: Usuari | null = null;

  /** Camps del formulari d'edició del perfil */
  formData: { nom: string; telefon: string; bio: string } = {
    nom: '',
    telefon: '',
    bio: ''
  };

  /** Camps del formulari de canvi de contrasenya */
  passwordData = {
    newPassword: '',
    confirmPassword: ''
  };

  /** Estats de càrrega per a les peticions */
  saving = false;
  changingPassword = false;

  /** Missatges informatius per a l'usuari */
  successMessage = '';
  errorMessage = '';

  constructor(
    private readonly authService: AuthService,
    private readonly usuariService: UsuariService,
    private readonly router: Router
  ) {}

  /**
   * Cicle de vida OnInit:
   * Comprova l'autenticació i carrega les dades actuals des de PostgreSQL.
   */
  ngOnInit(): void {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.router.navigate(['/login']);
      return;
    }

    this.usuari = currentUser;
    this.formData.nom = currentUser.nom || '';
    this.formData.telefon = currentUser.telefon || '';
    this.formData.bio = currentUser.bio || '';

    // Consultem el backend per tenir la versió més recent des de la base de dades
    this.usuariService.getById(currentUser.id).subscribe({
      next: (freshUser) => {
        if (freshUser) {
          this.usuari = freshUser;
          this.formData.nom = freshUser.nom || '';
          this.formData.telefon = freshUser.telefon || '';
          this.formData.bio = freshUser.bio || '';
          this.authService.setCurrentUser(freshUser);
        }
      },
      error: () => {
        // Mantenim les dades en memòria/localStorage si falla la connexió
      }
    });
  }

  /**
   * Obté la inicial de l'usuari per dibuixar l'avatar.
   */
  get userInitial(): string {
    return this.usuari?.nom ? this.usuari.nom.charAt(0).toUpperCase() : 'U';
  }

  /**
   * Guarda els canvis del formulari de perfil al backend PostgreSQL.
   */
  onSaveProfile(): void {
    if (!this.usuari) return;

    if (this.usuari.rol === 'professional' && (!this.formData.telefon || !this.formData.telefon.trim())) {
      this.errorMessage = 'Com a Professional, el telèfon de contacte és obligatori per resoldre peticions.';
      return;
    }

    this.saving = true;
    this.clearAlerts();

    const updatedData: Partial<Usuari> = {
      nom: this.formData.nom,
      telefon: this.formData.telefon,
      bio: this.formData.bio
    };

    this.usuariService.updateProfile(this.usuari.id, updatedData).subscribe({
      next: (savedUser) => {
        this.saving = false;
        this.usuari = savedUser;
        this.authService.setCurrentUser(savedUser);
        this.successMessage = 'Les dades del teu perfil s’han desat correctament a la base de dades.';
      },
      error: () => {
        this.saving = false;
        this.errorMessage = 'S’ha produït un error en desar el perfil. Torna-ho a provar.';
      }
    });
  }

  /**
   * Canvia la contrasenya de l'usuari a la base de dades.
   */
  onChangePassword(): void {
    if (!this.usuari) return;

    this.clearAlerts();

    if (this.passwordData.newPassword.length < 6) {
      this.errorMessage = 'La contrasenya ha de tenir com a mínim 6 caràcters.';
      return;
    }

    if (this.passwordData.newPassword !== this.passwordData.confirmPassword) {
      this.errorMessage = 'Les contrasenyes introduïdes no coincideixen.';
      return;
    }

    this.changingPassword = true;

    this.usuariService.changePassword(this.usuari.id, this.passwordData.newPassword).subscribe({
      next: () => {
        this.changingPassword = false;
        this.successMessage = 'La contrasenya s’ha canviat satisfactòriament.';
        this.passwordData.newPassword = '';
        this.passwordData.confirmPassword = '';
      },
      error: () => {
        this.changingPassword = false;
        this.errorMessage = 'No s’ha pogut actualitzar la contrasenya. Comprova la connexió amb el servidor.';
      }
    });
  }

  /**
   * Neteja els missatges d'alerta previs.
   */
  private clearAlerts(): void {
    this.successMessage = '';
    this.errorMessage = '';
  }
}

