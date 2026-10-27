import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TascaService, CreateTascaDto } from '../../../services/tasca.service';
import { IncidenciaService } from '../../../services/incidencia.service';
import { CrearIncidenciaDTO } from '../../../models/incidencia.model';
import { AuthService } from '../../../core/services/auth.service';

import { TranslatePipe } from '../../../core/pipes/translate.pipe';

/**
 * Component per a la creació i publicació de noves tasques (/client/crear-tasca).
 * Permet als usuaris amb rol de Client detallar una necessitat, seleccionar una categoria
 * i establir un pressupost orientatiu per rebre ofertes de professionals.
 * Disseny net i directe sense barres de desplaçament horitzontals.
 */
@Component({
  selector: 'app-crear-tasca',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TranslatePipe],
  template: `
    <section class="task-form-container">
      <div class="app-back-nav">
        <button type="button" class="btn-app-back" (click)="goBack()" [title]="'COMMON.TORNAR' | translate">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
          <span>{{ 'COMMON.TORNAR' | translate }}</span>
        </button>
      </div>

      <header class="form-header">
        <div class="role-badge-tag">{{ 'CREAR_TASCA.BADGE' | translate }}</div>
        <h1>{{ 'CREAR_TASCA.TITLE' | translate }}</h1>
        <p class="subtitle">
          {{ 'CREAR_TASCA.SUBTITLE' | translate }}
        </p>
      </header>

      <div *ngIf="errorMessage" class="alert alert-danger">
        {{ errorMessage | translate }}
      </div>
      <div *ngIf="successMessage" class="alert alert-success">
        {{ successMessage | translate }}
      </div>

      <form (ngSubmit)="onSubmit()" class="card">
        <label>
          {{ 'CREAR_TASCA.LABEL_TITLE' | translate }}
          <input
            type="text"
            [(ngModel)]="formData.titol"
            name="titol"
            required
            [placeholder]="'CREAR_TASCA.PLACEHOLDER_TITLE' | translate" />
        </label>

        <label>
          {{ 'CREAR_TASCA.LABEL_CAT' | translate }}
          <select [(ngModel)]="formData.categoria" name="categoria" required>
            <option value="" disabled>{{ 'CREAR_TASCA.SELECT_CAT_DEFAULT' | translate }}</option>
            <option value="Reformes i Obres">{{ 'CATEGORIES.Reformes i Obres' | translate }}</option>
            <option value="Lampisteria">{{ 'CATEGORIES.Lampisteria' | translate }}</option>
            <option value="Electricitat">{{ 'CATEGORIES.Electricitat' | translate }}</option>
            <option value="Climatització">{{ 'CATEGORIES.Climatització' | translate }}</option>
            <option value="Pintura">{{ 'CATEGORIES.Pintura' | translate }}</option>
            <option value="Fusteria">{{ 'CATEGORIES.Fusteria' | translate }}</option>
            <option value="Neteja">{{ 'CATEGORIES.Neteja' | translate }}</option>
            <option value="Serralleria">{{ 'CATEGORIES.Serralleria' | translate }}</option>
            <option value="Arquitectura">{{ 'CATEGORIES.Arquitectura' | translate }}</option>
            <option value="Informàtica">{{ 'CATEGORIES.Informàtica' | translate }}</option>
            <option value="Altres">{{ 'CATEGORIES.Altres' | translate }}</option>
          </select>
        </label>

        <label>
          {{ 'CREAR_TASCA.LABEL_DESC' | translate }}
          <textarea
            [(ngModel)]="formData.descripcio"
            name="descripcio"
            rows="6"
            required
            [placeholder]="'CREAR_TASCA.PLACEHOLDER_DESC' | translate"></textarea>
        </label>

        <label>
          {{ 'CREAR_TASCA.LABEL_BUDGET' | translate }}
          <input
            type="text"
            [(ngModel)]="formData.budget"
            name="budget"
            required
            [placeholder]="'CREAR_TASCA.PLACEHOLDER_BUDGET' | translate" />
        </label>

        <div class="form-actions">
          <button type="submit" class="btn btn-primary" [disabled]="submitting">
            {{ submitting ? ('CREAR_TASCA.SUBMITTING' | translate) : ('CREAR_TASCA.SUBMIT_BTN' | translate) }}
          </button>
          <a [routerLink]="getNavUrl('/tasques-ofertes')" class="btn btn-cancel">{{ 'COMMON.CANCEL_LAR' | translate }}</a>
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
        box-sizing: border-box;
        overflow-x: hidden;
      }

      .app-back-nav {
        display: flex;
        align-items: center;
        margin-bottom: -0.5rem;
      }

      .btn-app-back {
        display: inline-flex;
        align-items: center;
        gap: 0.45rem;
        background: var(--bg-card, #ffffff);
        color: var(--color-text-muted, #57554e);
        border: 1px solid var(--border-subtle, #e5e0d7);
        padding: 0.45rem 0.95rem;
        border-radius: var(--radius-sm, 8px);
        font-family: inherit;
        font-weight: 700;
        font-size: 0.88rem;
        cursor: pointer;
        transition: all 0.18s ease;
      }

      .btn-app-back:hover {
        background: var(--bg-surface, #faf8f4);
        color: var(--color-text, #09090c);
        border-color: var(--neon, #ff1744);
      }

      .btn-app-back:active {
        transform: scale(0.96);
      }

      .role-badge-tag {
        display: inline-block;
        font-size: 0.72rem;
        font-weight: 900;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        color: #ff1744;
        background: rgba(255, 23, 68, 0.08);
        border: 1px solid rgba(255, 23, 68, 0.25);
        padding: 0.3rem 0.75rem;
        border-radius: 6px;
        margin-bottom: 0.6rem;
      }

      .form-header h1 {
        margin: 0 0 0.4rem;
        font-size: 2rem;
        font-weight: 900;
        color: #09090c;
        letter-spacing: -0.02em;
      }

      .subtitle {
        margin: 0;
        color: #636058;
        font-size: 0.95rem;
        font-weight: 500;
      }

      .card {
        background: var(--bg-card, #ffffff);
        padding: 2.2rem;
        border-radius: var(--radius-lg, 18px);
        border: 1px solid var(--border-subtle, #e5e0d7);
        box-shadow: var(--shadow-md, 0 4px 20px rgba(0, 0, 0, 0.05));
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
        color: var(--color-text, #09090c);
      }

      input, select, textarea {
        width: 100%;
        max-width: 100%;
        box-sizing: border-box;
        background: #ffffff;
        border: 1.5px solid #d6d0c4;
        border-radius: 10px;
        padding: 0.85rem 1rem;
        font-size: 0.95rem;
        color: #09090c;
        font-family: inherit;
        font-weight: 600;
        transition: border-color 0.2s ease, box-shadow 0.2s ease;
      }

      textarea {
        resize: vertical;
      }

      input:focus, select:focus, textarea:focus {
        outline: none;
        border-color: #ff1744;
        box-shadow: 0 0 12px rgba(255, 23, 68, 0.25);
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
        background: #ff1744;
        color: #ffffff;
        box-shadow: 0 4px 14px rgba(255, 23, 68, 0.35);
      }

      .btn-primary:hover:not(:disabled) {
        background: #09090c;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
      }

      .btn-cancel {
        background: #f0ece3;
        color: #09090c;
        border: 1px solid #dcd6cb;
      }

      .btn-cancel:hover {
        background: #09090c;
        color: #ffffff;
        border-color: #09090c;
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
        background: rgba(255, 23, 68, 0.08);
        color: #ff1744;
        border: 1px solid rgba(255, 23, 68, 0.25);
      }

      .alert-danger {
        background: #fef2f2;
        color: #dc2626;
        border: 1px solid #fecaca;
      }

      @media (max-width: 600px) {
        .card {
          padding: 1.25rem 1rem;
          border-radius: 14px;
        }
        .form-header h1 {
          font-size: 1.45rem;
        }
        .form-actions {
          flex-direction: column-reverse;
          gap: 0.6rem;
        }
        .btn {
          width: 100%;
          text-align: center;
        }
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
    private readonly incidenciaService: IncidenciaService,
    private readonly tascaService: TascaService,
    private readonly authService: AuthService,
    private readonly route: ActivatedRoute,
    private readonly router: Router
  ) {}

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

  goBack(): void {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      window.history.back();
    } else {
      this.router.navigate([this.getNavUrl('/tasques-ofertes')]);
    }
  }

  /**
   * Inicialització: comprova l'origen des de tasques-ofertes i assigna el client.
   */
  ngOnInit(): void {
    const origen = this.route.snapshot.queryParams['origen'] || (typeof history !== 'undefined' ? history.state?.origen : null);
    if (origen !== 'tasques-ofertes') {
      this.router.navigate([this.getNavUrl('/tasques-ofertes')], {
        queryParams: {
          avís: 'Per a publicar una incidència cal fer-ho des de la secció de Tasques i Ofertes.'
        }
      });
      return;
    }

    const user = this.authService.getCurrentUser();
    if (user) {
      this.formData.client = user.nom;
    }
  }

  /**
   * Envia el formulari al servei per crear la incidència a PostgreSQL.
   */
  onSubmit(): void {
    if (!this.formData.titol || !this.formData.descripcio || !this.formData.categoria || !this.formData.budget) {
      this.errorMessage = 'Cal emplenar tots els camps obligatoris.';
      return;
    }

    this.submitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    const user = this.authService.getCurrentUser();
    const payload: CrearIncidenciaDTO = {
      titol: this.formData.titol,
      descripcio: this.formData.descripcio,
      categoria: this.formData.categoria,
      client: user?.nom || this.formData.client || 'Client AVISA',
      clientId: user?.id,
      budget: this.formData.budget,
      estat: 'Oberta'
    };

    this.incidenciaService.create(payload).subscribe({
      next: (created) => {
        this.submitting = false;
        this.successMessage = 'Incidència publicada amb èxit! Els professionals de la teva zona ja poden enviar-te pressupostos. Redirigint...';
        setTimeout(() => {
          this.router.navigate([this.getNavUrl('/tasques-ofertes')], { queryParams: { tipus: 'incidencies' } });
        }, 1200);
      },
      error: () => {
        this.submitting = false;
        this.errorMessage = 'S’ha produït un error en desar la incidència a la base de dades.';
      }
    });
  }
}

