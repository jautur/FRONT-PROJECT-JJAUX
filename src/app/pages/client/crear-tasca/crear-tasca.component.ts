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
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .form-header h1 {
        margin: 0 0 0.4rem;
        font-size: 1.8rem;
        color: #0f172a;
      }

      .subtitle {
        margin: 0;
        color: #64748b;
        font-size: 0.95rem;
      }

      .card {
        background: white;
        padding: 2rem;
        border-radius: 18px;
        border: 1px solid #e2e8f0;
        box-shadow: 0 10px 25px rgba(15, 23, 42, 0.05);
        display: flex;
        flex-direction: column;
        gap: 1.25rem;
      }

      label {
        display: flex;
        flex-direction: column;
        gap: 0.45rem;
        font-weight: 600;
        font-size: 0.9rem;
        color: #334155;
      }

      input, select, textarea {
        border: 1px solid #cbd5e1;
        border-radius: 10px;
        padding: 0.8rem 0.95rem;
        font-size: 0.95rem;
        font-family: inherit;
        transition: border-color 0.15s ease;
      }

      input:focus, select:focus, textarea:focus {
        outline: none;
        border-color: #2563eb;
      }

      .form-actions {
        display: flex;
        gap: 1rem;
        align-items: center;
        margin-top: 0.5rem;
      }

      .btn {
        padding: 0.85rem 1.4rem;
        border-radius: 10px;
        font-weight: 700;
        font-size: 0.95rem;
        text-decoration: none;
        cursor: pointer;
        border: none;
        transition: opacity 0.15s ease;
      }

      .btn-primary {
        background: #2563eb;
        color: white;
      }

      .btn-cancel {
        background: #f1f5f9;
        color: #475569;
      }

      .btn:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }

      .alert {
        padding: 0.9rem 1.25rem;
        border-radius: 12px;
        font-weight: 500;
        font-size: 0.95rem;
      }

      .alert-success {
        background: #dcfce7;
        color: #166534;
        border: 1px solid #86efac;
      }

      .alert-danger {
        background: #fee2e2;
        color: #991b1b;
        border: 1px solid #fca5a5;
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

