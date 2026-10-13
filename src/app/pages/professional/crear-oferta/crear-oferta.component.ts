import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { OfertaService, CreateOfertaDto } from '../../../services/oferta.service';
import { TascaService } from '../../../services/tasca.service';
import { Tasca } from '../../../models/tasca.model';
import { AuthService } from '../../../core/services/auth.service';

/**
 * Component per presentar una oferta econòmica (/professional/crear-oferta).
 * Permet als professionals enviar pressupostos i propostes de treball
 * per a les tasques que es troben en estat 'Oberta'.
 */
@Component({
  selector: 'app-crear-oferta',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <section class="offer-form-container">
      <header class="form-header">
        <h1>Presentar una oferta econòmica</h1>
        <p class="subtitle">Envia la teva proposta i pressupost al client per optar a la tasca.</p>
      </header>

      <div *ngIf="errorMessage" class="alert alert-danger">
        {{ errorMessage }}
      </div>
      <div *ngIf="successMessage" class="alert alert-success">
        {{ successMessage }}
      </div>

      <form (ngSubmit)="onSubmit()" class="card">
        <label>
          Tasca a la qual presentes candidatura
          <select [(ngModel)]="formData.tascaId" name="tascaId" required>
            <option value="" disabled>Selecciona una tasca oberta</option>
            <option *ngFor="let task of availableTasks" [value]="task.id">
              [{{ task.id }}] {{ task.titol }} — Pressupost client: {{ task.budget }}
            </option>
          </select>
        </label>

        <label>
          El teu pressupost proposat (€)
          <input
            type="text"
            [(ngModel)]="formData.price"
            name="price"
            required
            placeholder="Ex: €380" />
        </label>

        <label>
          Descripció de la teva proposta i terminis
          <textarea
            [(ngModel)]="formData.note"
            name="note"
            rows="5"
            required
            placeholder="Explica què inclou el teu servei, la teva experiència prèvia i el temps estimat de lliurament..."></textarea>
        </label>

        <div class="form-actions">
          <button type="submit" class="btn btn-primary" [disabled]="submitting || availableTasks.length === 0">
            {{ submitting ? 'Enviant oferta...' : 'Enviar oferta al client' }}
          </button>
          <a routerLink="/" class="btn btn-cancel">Cancel·lar</a>
        </div>
      </form>
    </section>
  `,
  styles: [
    `
      .offer-form-container {
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
        border-color: #16a34a;
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
        background: #16a34a;
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
export class CrearOfertaComponent implements OnInit {
  /** Llista de tasques obertes disponibles per a ofertar */
  availableTasks: Tasca[] = [];

  /** Model de dades per al formulari */
  formData: CreateOfertaDto = {
    tascaId: '',
    professional: '',
    price: '',
    note: '',
    estat: 'Pendent'
  };

  /** Estat de la petició */
  submitting = false;

  /** Missatges informatius */
  successMessage = '';
  errorMessage = '';

  constructor(
    private readonly ofertaService: OfertaService,
    private readonly tascaService: TascaService,
    private readonly authService: AuthService,
    private readonly route: ActivatedRoute,
    private readonly router: Router
  ) {}

  /**
   * Càrrega de tasques obertes i comprovació de paràmetres d'URL.
   */
  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.formData.professional = user.nom;
    }

    // Carreguem les tasques obertes
    this.tascaService.getAvailable().subscribe({
      next: (tasks) => {
        this.availableTasks = tasks;
        // Si s'ha passat una tasca concreta per paràmetre de consulta:
        this.route.queryParams.subscribe((params) => {
          if (params['taskId']) {
            this.formData.tascaId = params['taskId'];
          } else if (tasks.length > 0) {
            this.formData.tascaId = tasks[0].id;
          }
        });
      },
      error: () => {
        this.errorMessage = 'No s’han pogut carregar les tasques disponibles.';
      }
    });
  }

  /**
   * Envia l'oferta al backend per desar-la a PostgreSQL.
   */
  onSubmit(): void {
    if (!this.formData.tascaId || !this.formData.price || !this.formData.note) {
      this.errorMessage = 'Cal emplenar tots els camps obligatoris.';
      return;
    }

    this.submitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.ofertaService.create(this.formData).subscribe({
      next: () => {
        this.submitting = false;
        this.successMessage = 'Oferta enviada correctament! El client la podrà revisar.';
        setTimeout(() => {
          this.router.navigate(['/']);
        }, 1200);
      },
      error: () => {
        this.submitting = false;
        this.errorMessage = 'S’ha produït un error en registrar l’oferta al servidor.';
      }
    });
  }
}

