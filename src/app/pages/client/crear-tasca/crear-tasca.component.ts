import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TascaService, CreateTascaDto } from '../../../services/tasca.service';
import { AuthService } from '../../../core/services/auth.service';

/**
 * Component per a la creació i publicació de noves tasques (/client/crear-tasca).
 * Permet als usuaris amb rol de Client detallar una necessitat, seleccionar una categoria
 * i establir un pressupost orientatiu per rebre ofertes de professionals.
 */
@Component({
  selector: 'app-crear-tasca',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <section class="task-form-container">
      <header class="form-header">
        <h1>Publicar una nova tasca</h1>
        <p class="subtitle">Descriu el teu projecte o necessitat per rebre pressupostos de professionals.</p>
      </header>

      <div *ngIf="errorMessage" class="alert alert-danger">
        {{ errorMessage }}
      </div>
      <div *ngIf="successMessage" class="alert alert-success">
        {{ successMessage }}
      </div>

      <form (ngSubmit)="onSubmit()" class="card">
        <label>
          Títol del projecte / tasca
          <input
            type="text"
            [(ngModel)]="formData.titol"
            name="titol"
            required
            placeholder="Ex: Desenvolupament d'una botiga online en Shopify" />
        </label>

        <label>
          Categoria del servei
          <select [(ngModel)]="formData.categoria" name="categoria" required>
            <option value="" disabled>Selecciona una categoria</option>
            <option value="Web">Desenvolupament Web & Apps</option>
            <option value="Branding">Disseny Gràfic & Branding</option>
            <option value="Multimèdia">Multimèdia, Vídeo & Àudio</option>
            <option value="Informàtica">Sistemes, Xarxes & Suport IT</option>
            <option value="Altres">Altres serveis professionals</option>
          </select>
        </label>

        <label>
          Descripció detallada dels requeriments
          <textarea
            [(ngModel)]="formData.descripcio"
            name="descripcio"
            rows="6"
            required
            placeholder="Detalla què necessites, objectius, terminis o especificacions tècniques..."></textarea>
        </label>

        <label>
          Pressupost orientatiu (€)
          <input
            type="text"
            [(ngModel)]="formData.budget"
            name="budget"
            required
            placeholder="Ex: €450" />
        </label>

        <div class="form-actions">
          <button type="submit" class="btn btn-primary" [disabled]="submitting">
            {{ submitting ? 'Publicant tasca...' : 'Publicar tasca' }}
          </button>
          <a routerLink="/" class="btn btn-cancel">Cancel·lar</a>
        </div>
      </form>
    </section>
  `,
  styles: [
    `
      .task-form-container {
        width: min(700px, 100%);
        margin: 0 auto;
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .form-header h1 {
        margin: 0 0 0.4rem;
        font-size: 2rem;
        font-weight: 900;
        color: #f5f4ef;
        letter-spacing: -0.02em;
      }

      .subtitle {
        margin: 0;
        color: #bab8ae;
        font-size: 0.95rem;
        font-weight: 500;
      }

      .card {
        background: #111116;
        padding: 2.2rem;
        border-radius: 18px;
        border: 1px solid #1e1e28;
        box-shadow: 0 10px 35px rgba(0, 0, 0, 0.5);
        display: flex;
        flex-direction: column;
        gap: 1.35rem;
      }

      label {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        font-weight: 800;
        font-size: 0.9rem;
        color: #f5f4ef;
      }

      input, select, textarea {
        background: #181822;
        border: 1px solid #282836;
        border-radius: 10px;
        padding: 0.85rem 1rem;
        font-size: 0.95rem;
        color: #f5f4ef;
        font-family: inherit;
        font-weight: 600;
        transition: border-color 0.2s ease, box-shadow 0.2s ease;
      }

      input:focus, select:focus, textarea:focus {
        outline: none;
        border-color: #00ff66;
        box-shadow: 0 0 12px rgba(0, 255, 102, 0.2);
      }

      .form-actions {
        display: flex;
        gap: 1rem;
        align-items: center;
        margin-top: 0.75rem;
      }

      .btn {
        padding: 0.85rem 1.6rem;
        border-radius: 10px;
        font-weight: 900;
        font-size: 0.95rem;
        text-decoration: none;
        cursor: pointer;
        border: none;
        transition: all 0.2s ease;
      }

      .btn-primary {
        background: #00ff66;
        color: #08080a;
      }

      .btn-primary:hover:not(:disabled) {
        background: #00dd55;
        box-shadow: 0 0 15px rgba(0, 255, 102, 0.4);
      }

      .btn-cancel {
        background: #1e1e2a;
        color: #bab8ae;
        border: 1px solid #2c2c3e;
      }

      .btn-cancel:hover {
        border-color: #bab8ae;
        color: #f5f4ef;
      }

      .btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .alert {
        padding: 0.9rem 1.25rem;
        border-radius: 12px;
        font-weight: 700;
        font-size: 0.95rem;
      }

      .alert-success {
        background: rgba(0, 255, 102, 0.1);
        color: #00ff66;
        border: 1px solid rgba(0, 255, 102, 0.3);
      }

      .alert-danger {
        background: rgba(239, 68, 68, 0.1);
        color: #ef4444;
        border: 1px solid rgba(239, 68, 68, 0.3);
      }
    `
  ]
})
export class CrearTascaComponent implements OnInit {
  /** Model del formulari */
  formData: CreateTascaDto = {
    titol: '',
    descripcio: '',
    categoria: '',
    client: '',
    budget: '',
    estat: 'Oberta'
  };

  /** Estat del procés d'enviament */
  submitting = false;

  /** Missatges d'èxit o error */
  successMessage = '';
  errorMessage = '';

  constructor(
    private readonly tascaService: TascaService,
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  /**
   * Inicialització: assigna automàticament el client a partir de l'usuari connectat.
   */
  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.formData.client = user.nom;
    }
  }

  /**
   * Envia el formulari al servei per crear la tasca a PostgreSQL.
   */
  onSubmit(): void {
    if (!this.formData.titol || !this.formData.descripcio || !this.formData.categoria || !this.formData.budget) {
      this.errorMessage = 'Cal emplenar tots els camps obligatoris.';
      return;
    }

    this.submitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.tascaService.create(this.formData).subscribe({
      next: (created) => {
        this.submitting = false;
        this.successMessage = 'Tasca publicada amb èxit! Redirigint al panell principal...';
        setTimeout(() => {
          this.router.navigate(['/']);
        }, 1200);
      },
      error: () => {
        this.submitting = false;
        this.errorMessage = 'S’ha produït un error en desar la tasca a la base de dades.';
      }
    });
  }
}

