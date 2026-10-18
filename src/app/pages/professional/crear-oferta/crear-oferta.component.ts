import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { OfertaService, CreateOfertaDto } from '../../../services/oferta.service';
import { TascaService } from '../../../services/tasca.service';
import { IncidenciaService } from '../../../services/incidencia.service';
import { Tasca } from '../../../models/tasca.model';
import { AuthService } from '../../../core/services/auth.service';

import { TranslatePipe } from '../../../core/pipes/translate.pipe';

/**
 * Component per publicar ofertes i presentar pressupostos (/professional/crear-oferta).
 * Ofereix dues modalitats clau per a professionals i autònoms:
 * 1. 'Publicar Oferta / Pack de Servei': Anunciar al mercat un paquet tancat amb tarifa directa (ex: revisió caldera, pintura).
 *    Quan un client hi clica «Contractar», es converteix directament en una Tasca en curs assignada al professional.
 * 2. 'Enviar Pressupost a Incidència': Licitar a una petició o incidència oberta d'un client concret amb preu i condicions.
 */
@Component({
  selector: 'app-crear-oferta',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TranslatePipe],
  template: `
    <section class="offer-form-container">
      <header class="form-header">
        <div class="role-badge-tag">{{ 'CREAR_OFERTA.BADGE' | translate }}</div>
        <h1>{{ mode === 'oferta' ? ('CREAR_OFERTA.TITLE_OFFER' | translate) : ('CREAR_OFERTA.TITLE_BUDGET' | translate) }}</h1>
        <p class="subtitle">
          {{ mode === 'oferta'
              ? ('CREAR_OFERTA.SUBTITLE_OFFER' | translate)
              : ('CREAR_OFERTA.SUBTITLE_BUDGET' | translate)
          }}
        </p>
      </header>

      <!-- Selector de modalitat professional -->
      <div class="mode-tabs">
        <button
          type="button"
          class="mode-tab-btn"
          [class.active]="mode === 'oferta'"
          (click)="canviarMode('oferta')"
        >
          <span class="tab-badge">{{ 'CREAR_OFERTA.TAB_OFFER_BADGE' | translate }}</span>
          <strong>{{ 'CREAR_OFERTA.TAB_OFFER_TITLE' | translate }}</strong>
        </button>
        <button
          type="button"
          class="mode-tab-btn"
          [class.active]="mode === 'pressupost'"
          (click)="canviarMode('pressupost')"
        >
          <span class="tab-badge">{{ 'CREAR_OFERTA.TAB_BUDGET_BADGE' | translate }}</span>
          <strong>{{ 'CREAR_OFERTA.TAB_BUDGET_TITLE' | translate }}</strong>
        </button>
      </div>

      <div *ngIf="errorMessage" class="alert alert-danger">
        {{ errorMessage | translate }}
      </div>
      <div *ngIf="successMessage" class="alert alert-success">
        {{ successMessage | translate }}
      </div>

      <!-- FORMULARI 1: PUBLICAR OFERTA / PACK DE SERVEI PROFESSIONAL -->
      <form *ngIf="mode === 'oferta'" (ngSubmit)="onSubmitOfertaServei()" class="card">
        <div class="mode-info-box">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
          <p>
            {{ 'CREAR_OFERTA.OFFER_INFO_BANNER' | translate }}
          </p>
        </div>

        <label>
          {{ 'CREAR_OFERTA.LABEL_OFFER_TITLE' | translate }}
          <input
            type="text"
            [(ngModel)]="ofertaServei.titol"
            name="titolServei"
            required
            placeholder="Ex: Revisió oficial de caldera i neteja de filtres" />
        </label>

        <label>
          {{ 'CREAR_OFERTA.LABEL_OFFER_CAT' | translate }}
          <select [(ngModel)]="ofertaServei.categoria" name="categoriaServei" required>
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
          {{ 'CREAR_OFERTA.LABEL_OFFER_PRICE' | translate }}
          <input
            type="text"
            [(ngModel)]="ofertaServei.price"
            name="priceServei"
            required
            placeholder="Ex: €75 o €550" />
        </label>

        <label>
          {{ 'CREAR_OFERTA.LABEL_OFFER_NOTE' | translate }}
          <textarea
            [(ngModel)]="ofertaServei.note"
            name="noteServei"
            rows="5"
            required
            placeholder="Descriu amb detall el contingut del servei: desplaçament inclòs, revisió, garantia..."></textarea>
        </label>

        <div class="form-actions">
          <button type="submit" class="btn btn-primary" [disabled]="submitting">
            {{ submitting ? ('CREAR_OFERTA.SUBMITTING_OFFER' | translate) : ('CREAR_OFERTA.SUBMIT_OFFER_BTN' | translate) }}
          </button>
          <a routerLink="/" class="btn btn-cancel">{{ 'COMMON.CANCEL_LAR' | translate }}</a>
        </div>
      </form>

      <!-- FORMULARI 2: ENVIAR PRESSUPOST A UNA INCIDÈNCIA OBERTA -->
      <form *ngIf="mode === 'pressupost'" (ngSubmit)="onSubmitPressupost()" class="card">
        <div class="form-group-field">
          <label for="selectIncidencia" class="label-incidencia">
            <span class="label-main">{{ 'CREAR_OFERTA.LABEL_SELECT_INCIDENCIA' | translate }}</span>
          </label>
          <div class="select-wrapper">
            <select
              id="selectIncidencia"
              [(ngModel)]="formData.tascaId"
              name="tascaId"
              required
              class="select-incidencia"
            >
              <option value="" disabled>-- Selecciona una incidència oberta --</option>
              <option *ngFor="let task of availableTasks" [value]="task.id">
                {{ task.titol }} — {{ (task.categoria ? (task.categoria | translate) : ('CATEGORIES.Altres Serveis' | translate)) }} ({{ 'COMMON.PRESSUPOST' | translate }}: {{ task.budget }})
              </option>
            </select>
            <span class="select-chevron" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </span>
          </div>

          <!-- Fitxa detallada de resum de la incidència seleccionada -->
          <div *ngIf="selectedTask" class="selected-incident-preview">
            <div class="incident-preview-top">
              <span class="preview-cat-badge">{{ selectedTask.categoria ? (selectedTask.categoria | translate) : ('CATEGORIES.Altres Serveis' | translate) }}</span>
              <span class="preview-budget-badge">
                {{ 'LES_MEVES_TASQUES.ESTIMATED_BUDGET' | translate }} <strong>{{ selectedTask.budget }}</strong>
              </span>
            </div>
            <h4 class="preview-title">{{ selectedTask.titol }}</h4>
            <p class="preview-desc" *ngIf="selectedTask.descripcio">{{ selectedTask.descripcio }}</p>
            <div class="preview-meta-row">
              <span *ngIf="selectedTask.client" class="preview-client">
                {{ 'HOME.CLIENT_LABEL' | translate }} <strong>{{ selectedTask.client }}</strong>
              </span>
              <span class="preview-id">{{ 'TASCA_DETALL.IDENTIFIER' | translate }} <code>{{ selectedTask.id }}</code></span>
            </div>
          </div>
        </div>

        <label>
          {{ 'CREAR_OFERTA.LABEL_BUDGET_PRICE' | translate }}
          <input
            type="text"
            [(ngModel)]="formData.price"
            name="price"
            required
            placeholder="Ex: €340" />
        </label>

        <label>
          {{ 'CREAR_OFERTA.LABEL_BUDGET_NOTE' | translate }}
          <textarea
            [(ngModel)]="formData.note"
            name="note"
            rows="5"
            required
            placeholder="Explica què inclou el teu pressupost, la teva experiència i el termini estimat d'execució..."></textarea>
        </label>

        <div class="form-actions">
          <button type="submit" class="btn btn-primary" [disabled]="submitting || availableTasks.length === 0">
            {{ submitting ? ('CREAR_OFERTA.SUBMITTING_BUDGET' | translate) : ('CREAR_OFERTA.SUBMIT_BUDGET_BTN' | translate) }}
          </button>
          <a routerLink="/" class="btn btn-cancel">{{ 'COMMON.CANCEL_LAR' | translate }}</a>
        </div>
      </form>
    </section>
  `,
  styles: [
    `
      .offer-form-container {
        width: min(700px, 100%);
        margin: 0 auto;
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
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

      .mode-tabs {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 0.75rem;
        background: #ede8df;
        padding: 0.4rem;
        border-radius: 14px;
        border: 1px solid #dcd5c7;
      }

      .mode-tab-btn {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.25rem;
        padding: 0.85rem 1rem;
        border-radius: 10px;
        background: transparent;
        border: none;
        cursor: pointer;
        color: #55524b;
        transition: all 0.2s ease;
        text-align: center;
      }

      .mode-tab-btn.active {
        background: #ffffff;
        color: #09090c;
        box-shadow: 0 4px 14px rgba(0, 0, 0, 0.08);
      }

      .tab-badge {
        font-size: 0.7rem;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        color: #ff1744;
      }

      .mode-info-box {
        display: flex;
        align-items: flex-start;
        gap: 0.75rem;
        background: rgba(255, 23, 68, 0.06);
        border: 1px solid rgba(255, 23, 68, 0.2);
        padding: 0.9rem 1.1rem;
        border-radius: 12px;
        color: #09090c;
        font-size: 0.88rem;
        line-height: 1.45;
      }

      .mode-info-box svg {
        color: #ff1744;
        flex-shrink: 0;
        margin-top: 2px;
      }

      .mode-info-box p {
        margin: 0;
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
        background: #ffffff;
        padding: 2.2rem;
        border-radius: 18px;
        border: 1px solid #e5e0d7;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
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
        color: #09090c;
      }

      input, select, textarea {
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

      input:focus, select:focus, textarea:focus {
        outline: none;
        border-color: #ff1744;
        box-shadow: 0 0 12px rgba(255, 23, 68, 0.25);
      }

      .form-group-field {
        display: flex;
        flex-direction: column;
        gap: 0.65rem;
      }

      .label-incidencia {
        display: flex;
        flex-direction: column;
        gap: 0.2rem;
        cursor: pointer;
      }

      .label-main {
        font-weight: 800;
        font-size: 0.95rem;
        color: #09090c;
      }

      .label-hint {
        font-size: 0.8rem;
        font-weight: 500;
        color: #7d7a72;
      }

      .select-wrapper {
        position: relative;
        width: 100%;
        display: flex;
        align-items: center;
      }

      .select-incidencia {
        width: 100%;
        appearance: none;
        -webkit-appearance: none;
        -moz-appearance: none;
        background-color: #faf9f6;
        border: 1.5px solid #d6d0c4;
        border-radius: 12px;
        padding: 0.95rem 2.85rem 0.95rem 1.15rem;
        font-size: 0.95rem;
        font-weight: 600;
        color: #09090c;
        cursor: pointer;
        line-height: 1.4;
        transition: all 0.2s ease;
      }

      .select-incidencia:hover {
        border-color: #b5b0a4;
        background-color: #ffffff;
      }

      .select-incidencia:focus {
        border-color: #ff1744;
        background-color: #ffffff;
        box-shadow: 0 0 14px rgba(255, 23, 68, 0.22);
        outline: none;
      }

      .select-chevron {
        position: absolute;
        right: 1.1rem;
        pointer-events: none;
        color: #7d7a72;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: transform 0.2s ease, color 0.2s ease;
      }

      .select-wrapper:focus-within .select-chevron {
        color: #ff1744;
        transform: rotate(180deg);
      }

      .selected-incident-preview {
        background: #faf8f4;
        border: 1px solid #e5e0d5;
        border-left: 4px solid var(--neon, #ff1744);
        border-radius: 12px;
        padding: 1.1rem 1.25rem;
        margin-top: 0.35rem;
        display: flex;
        flex-direction: column;
        gap: 0.55rem;
        animation: fadeInPreview 0.2s ease;
      }

      @keyframes fadeInPreview {
        from {
          opacity: 0;
          transform: translateY(-4px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .incident-preview-top {
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 0.5rem;
      }

      .preview-cat-badge {
        background: #09090c;
        color: #ffffff;
        font-size: 0.72rem;
        font-weight: 800;
        padding: 0.2rem 0.6rem;
        border-radius: 6px;
        letter-spacing: 0.04em;
        text-transform: uppercase;
      }

      .preview-budget-badge {
        font-size: 0.82rem;
        color: #636058;
      }

      .preview-budget-badge strong {
        color: #09090c;
        font-weight: 800;
        font-size: 0.95rem;
      }

      .preview-title {
        margin: 0;
        font-size: 1.05rem;
        font-weight: 800;
        color: #09090c;
        line-height: 1.35;
      }

      .preview-desc {
        margin: 0;
        font-size: 0.88rem;
        color: #636058;
        line-height: 1.45;
      }

      .preview-meta-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 0.5rem;
        padding-top: 0.45rem;
        border-top: 1px dashed #e2ded5;
        font-size: 0.8rem;
        color: #7d7a72;
      }

      .preview-client strong {
        color: #09090c;
      }

      .preview-id code {
        background: #eeeae0;
        padding: 0.15rem 0.4rem;
        border-radius: 4px;
        font-size: 0.76rem;
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
        border-color: #09090c;
        background: #09090c;
        color: #ffffff;
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
        .mode-tabs {
          grid-template-columns: 1fr;
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
export class CrearOfertaComponent implements OnInit {
  /** Mode actiu: 'oferta' per publicar tarifa/pack, 'pressupost' per licitar a incidència oberta */
  mode: 'oferta' | 'pressupost' = 'oferta';

  /** Llista de tasques obertes disponibles per a ofertar */
  availableTasks: Tasca[] = [];

  /** Obté l'objecte complet de la incidència o tasca actualment seleccionada al desplegable */
  get selectedTask(): Tasca | undefined {
    if (!this.formData.tascaId) return undefined;
    return this.availableTasks.find(t => t.id === this.formData.tascaId);
  }

  /** Model per a la publicació d'oferta pública / pack de servei */
  ofertaServei = {
    titol: '',
    categoria: '',
    price: '',
    note: ''
  };

  /** Model de dades per al pressupost a incidència oberta */
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
    private readonly incidenciaService: IncidenciaService,
    private readonly authService: AuthService,
    private readonly route: ActivatedRoute,
    private readonly router: Router
  ) {}

  /**
   * Càrrega d'incidències i tasques obertes i comprovació de paràmetres d'URL.
   */
  ngOnInit(): void {
    const origen = this.route.snapshot.queryParams['origen'] || (typeof history !== 'undefined' ? history.state?.origen : null);
    if (origen !== 'tasques-ofertes') {
      this.router.navigate(['/tasques-ofertes'], {
        queryParams: {
          avís: 'Per a publicar una oferta o pressupost cal accedir des de la secció de Tasques i Ofertes.'
        }
      });
      return;
    }

    const user = this.authService.getCurrentUser();
    if (user) {
      this.formData.professional = user.nom;
    }

    // Carreguem tant incidències obertes com tasques obertes
    const incidencies$ = this.incidenciaService.getAll().pipe(catchError(() => of([])));
    const tasques$ = this.tascaService.getAvailable().pipe(catchError(() => of([])));

    forkJoin([incidencies$, tasques$]).subscribe({
      next: ([incidencies, tasks]) => {
        const mappedIncidencies: Tasca[] = (incidencies || [])
          .filter(inc => !inc.estat || inc.estat === 'Oberta')
          .map(inc => ({
            id: inc.id,
            titol: inc.titol,
            descripcio: inc.descripcio || '',
            categoria: inc.categoria || 'Altres Serveis',
            client: inc.clientNom || (inc as any).client || '',
            clientId: inc.clientId,
            budget: inc.budget,
            estat: inc.estat || 'Oberta',
            tipus: 'incidencia'
          }));

        const existingIds = new Set(mappedIncidencies.map(i => i.id));
        const extraTasks = (tasks || []).filter(t => !existingIds.has(t.id));
        this.availableTasks = [...mappedIncidencies, ...extraTasks];

        this.route.queryParams.subscribe((params) => {
          const requestedId = params['taskId'] || params['tascaId'];
          if (requestedId) {
            this.mode = 'pressupost';
            this.formData.tascaId = requestedId;
            // Si la incidència o tasca no està a la llista, la recuperem pel seu id provant primer Tasca i després Incidència
            if (!this.availableTasks.some(t => t.id === requestedId)) {
              this.tascaService.getById(requestedId).subscribe({
                next: (t) => {
                  if (t && !this.availableTasks.some(x => x.id === t.id)) {
                    this.availableTasks.unshift(t);
                  }
                  this.formData.tascaId = requestedId;
                },
                error: () => {
                  // Fallback a consultar com a incidència directa
                  this.incidenciaService.getById(requestedId).subscribe({
                    next: (inc) => {
                      if (inc && !this.availableTasks.some(x => x.id === inc.id)) {
                        this.availableTasks.unshift({
                          id: inc.id,
                          titol: inc.titol,
                          descripcio: inc.descripcio || '',
                          categoria: inc.categoria || 'Altres Serveis',
                          client: inc.clientNom || (inc as any).client || '',
                          clientId: inc.clientId,
                          budget: inc.budget,
                          estat: inc.estat || 'Oberta',
                          tipus: 'incidencia'
                        });
                      }
                      this.formData.tascaId = requestedId;
                    },
                    error: () => {
                      // Si no es troba per cap de les dues vies, afegim un element temporal perquè el desplegable no quede buit
                      this.availableTasks.unshift({
                        id: requestedId,
                        titol: 'Incidència ' + requestedId,
                        descripcio: '',
                        categoria: 'Altres Serveis',
                        client: '',
                        budget: 'A convenir',
                        estat: 'Oberta',
                        tipus: 'incidencia'
                      });
                      this.formData.tascaId = requestedId;
                    }
                  });
                }
              });
            }
          } else if (this.availableTasks.length > 0 && !this.formData.tascaId) {
            this.formData.tascaId = this.availableTasks[0].id;
          }
        });
      },
      error: () => {
        this.errorMessage = 'No s’han pogut carregar les incidències obertes.';
      }
    });
  }

  canviarMode(nouMode: 'oferta' | 'pressupost'): void {
    this.mode = nouMode;
    this.errorMessage = '';
    this.successMessage = '';
  }

  /**
   * Publica un pack de servei / oferta pública amb tarifa tancada.
   */
  onSubmitOfertaServei(): void {
    const user = this.authService.getCurrentUser();
    if (!this.ofertaServei.titol || !this.ofertaServei.categoria || !this.ofertaServei.price || !this.ofertaServei.note) {
      this.errorMessage = 'Cal emplenar tots els camps del pack de servei.';
      return;
    }

    this.submitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    const payload: CreateOfertaDto = {
      tascaId: 'standalone',
      professional: user ? user.nom : 'Professional AVISA',
      categoria: this.ofertaServei.categoria,
      price: this.ofertaServei.price.startsWith('€') ? this.ofertaServei.price : ('€' + this.ofertaServei.price.replace('€', '').trim()),
      note: this.ofertaServei.titol + ' — ' + this.ofertaServei.note,
      estat: 'Pendent'
    };

    this.ofertaService.create(payload).subscribe({
      next: () => {
        this.submitting = false;
        this.successMessage = 'Oferta de servei publicada al mercat amb èxit! Els clients ja poden contractar-la directament.';
        setTimeout(() => {
          this.router.navigate(['/tasques-ofertes'], { queryParams: { tipus: 'ofertes' } });
        }, 1200);
      },
      error: () => {
        this.submitting = false;
        this.errorMessage = 'S’ha produït un error en publicar l’oferta de servei.';
      }
    });
  }

  /**
   * Envia un pressupost a una incidència oberta d'un client.
   */
  onSubmitPressupost(): void {
    if (!this.formData.tascaId || !this.formData.price || !this.formData.note) {
      this.errorMessage = 'Cal emplenar tots els camps obligatoris del pressupost.';
      return;
    }

    this.submitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    const selectedTask = this.availableTasks.find(t => t.id === this.formData.tascaId);
    const user = this.authService.getCurrentUser();
    const payload: CreateOfertaDto = {
      tascaId: this.formData.tascaId,
      incidenciaId: this.formData.tascaId,
      professional: user ? user.nom : (this.formData.professional || 'Professional AVISA'),
      categoria: selectedTask?.categoria || 'Altres Serveis',
      price: this.formData.price.startsWith('€') ? this.formData.price : ('€' + this.formData.price.replace('€', '').trim()),
      note: this.formData.note,
      estat: 'Pendent'
    };

    this.ofertaService.create(payload).subscribe({
      next: () => {
        this.submitting = false;
        this.successMessage = 'Pressupost enviat al client correctament! Quan el client l\'accepti, passarà a ser una Tasca en curs.';
        setTimeout(() => {
          this.router.navigate(['/tasques-ofertes'], { queryParams: { tipus: 'ofertes' } });
        }, 1200);
      },
      error: () => {
        this.submitting = false;
        this.errorMessage = 'S’ha produït un error en registrar el pressupost al servidor.';
      }
    });
  }
}

