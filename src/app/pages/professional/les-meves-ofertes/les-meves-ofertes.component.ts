import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { OfertaService } from '../../../services/oferta.service';
import { TascaService } from '../../../services/tasca.service';
import { AuthService } from '../../../core/services/auth.service';
import { ConfirmService } from '../../../core/services/confirm.service';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';
import { Oferta } from '../../../models/oferta.model';
import { Tasca } from '../../../models/tasca.model';

/**
 * Component del Panell de Gestió d'Ofertes del Professional (/professional/les-meves-ofertes).
 * Permet a un professional:
 * - Consultar les tasques que té assignades en curs i finalitzar-les directament.
 * - Consultar tots els pressupostos i ofertes que ha presentat.
 * - Borrar ofertes que ja no li interessen mantenir actives.
 * - Navegar directament als detalls de la tasca per consultar requisits o actualitzacions.
 */
@Component({
  selector: 'app-les-meves-ofertes',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslatePipe],
  template: `
    <div class="panell-container">
      <div class="panell-header">
        <div>
          <h2>{{ 'LES_MEVES_OFERTES.TITLE' | translate }}</h2>
          <p class="subtitle">{{ 'LES_MEVES_OFERTES.SUBTITLE' | translate }}</p>
        </div>
        <div>
          <a [routerLink]="getNavUrl('/professional/crear-oferta')" class="btn-crear">
            {{ 'LES_MEVES_OFERTES.BTN_NEW_OFFER' | translate }}
          </a>
        </div>
      </div>

      <!-- SECCIÓ DE TASQUES ASSIGNADES EN CURS I FINALITZADES (ON CONVERGEIXEN CLIENT I PROFESSIONAL) -->
      <section class="assigned-section" *ngIf="!loading && tasquesAssignades.length > 0">
        <div class="section-title-bar">
          <div class="title-with-badge">
            <span class="pro-assigned-pill">{{ 'LES_MEVES_OFERTES.ASSIGNED_SECTION_TAG' | translate }}</span>
            <h3>{{ 'LES_MEVES_OFERTES.ASSIGNED_SECTION_TITLE' | translate }} ({{ tasquesAssignades.length }})</h3>
          </div>
          <span class="section-badge-hint">{{ 'LES_MEVES_OFERTES.ASSIGNED_SECTION_HINT' | translate }}</span>
        </div>

        <div class="assigned-tasks-grid">
          <div *ngFor="let t of tasquesAssignades" class="assigned-task-card">
            <div class="card-header">
              <span class="badge-nature">{{ 'MERCAT.AGREED_NATURE' | translate }}</span>
              <span class="badge-estat" [ngClass]="getTaskEstatClass(t.estat)">{{ t.estat | translate }}</span>
            </div>

            <h4 class="tasca-titol">{{ t.titol }}</h4>
            <div class="assigned-meta">
              <div class="assigned-meta-item">
                <span class="lbl">{{ 'TASCA_DETALL.PRO_LABEL' | translate | slice:0:-1 }}:</span>
                <strong><a [routerLink]="[getNavUrl('/perfil'), t.clientNom || t.client]" class="user-inline-link">{{ t.clientNom || t.client }}</a></strong>
              </div>
              <div class="assigned-meta-item">
                <span class="lbl">{{ 'LES_MEVES_TASQUES.AGREED_PRICE' | translate }}</span>
                <span class="budget-highlight">{{ t.budget }}</span>
              </div>
            </div>
            <p class="tasca-desc" *ngIf="t.descripcio">{{ t.descripcio }}</p>

            <div class="card-actions">
              <button
                *ngIf="t.estat !== 'Finalitzada'"
                type="button"
                class="btn-action success"
                (click)="finalitzarTascaComAProfessional(t)"
                [title]="'LES_MEVES_OFERTES.BTN_FINALIZE_TASK' | translate"
              >
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: -2px; margin-right: 5px;">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                {{ 'LES_MEVES_OFERTES.BTN_FINALIZE_TASK' | translate }}
              </button>
              <a [routerLink]="[getNavUrl('/tasca-detall'), t.id]" class="btn-action primary">
                {{ 'LES_MEVES_OFERTES.BTN_VIEW_TRACKING' | translate }}
              </a>
            </div>
          </div>
        </div>
      </section>

      <div class="section-divider" *ngIf="tasquesAssignades.length > 0"></div>

      <!-- Capçalera secció d'ofertes (les ofertes no tenen estat, sols s'accepten o es borren) -->
      <div class="propostes-section-header">
        <div class="title-with-badge">
          <span class="pro-assigned-pill" style="background: rgba(255, 23, 68, 0.08); color: #ff1744; border-color: rgba(255, 23, 68, 0.25);">{{ 'LES_MEVES_OFERTES.PROPOSALS_SECTION_TAG' | translate }}</span>
          <h3>{{ 'LES_MEVES_OFERTES.PROPOSALS_SECTION_TITLE' | translate }} ({{ ofertes.length }})</h3>
        </div>
        <span class="section-badge-hint">{{ 'LES_MEVES_OFERTES.PROPOSALS_SECTION_HINT' | translate }}</span>
      </div>

      <!-- Missatges d'estat i confirmació -->
      <div *ngIf="loading" class="state-box">{{ 'MERCAT.LOADING' | translate }}</div>
      <div *ngIf="successMsg" class="alert-success">{{ successMsg }}</div>
      <div *ngIf="errorMsg" class="alert-error">{{ errorMsg }}</div>

      <!-- Llista d'ofertes en targetes -->
      <div class="ofertes-grid" *ngIf="!loading && ofertes.length > 0">
        <div *ngFor="let of of ofertes" class="oferta-card">
          <div class="card-header">
            <span class="tasca-ref">Ref: {{ of.tascaId || of.incidenciaId || of.id }}</span>
          </div>

          <h3 class="tasca-titol">
            {{ tasquesMap[of.tascaId]?.titol || 'Proposta ' + of.id }}
          </h3>

          <p class="tasca-desc" *ngIf="tasquesMap[of.tascaId]">
            Client: <strong><a [routerLink]="[getNavUrl('/perfil'), tasquesMap[of.tascaId].clientNom || tasquesMap[of.tascaId].client]" class="user-inline-link" title="Veure perfil">{{ tasquesMap[of.tascaId].clientNom || tasquesMap[of.tascaId].client }}</a></strong> | {{ 'MERCAT.MOBILE_CAT_LABEL' | translate }} <em>{{ tasquesMap[of.tascaId].categoria | translate }}</em>
          </p>

          <div class="preu-box">
            <div class="preu-item">
              <span class="preu-label">{{ 'LES_MEVES_OFERTES.YOUR_QUOTE' | translate }}</span>
              <span class="preu-value">{{ of.price }}</span>
            </div>
            <div class="preu-item" *ngIf="tasquesMap[of.tascaId]">
              <span class="preu-label">{{ 'LES_MEVES_OFERTES.CLIENT_BUDGET' | translate }}</span>
              <span class="preu-value muted">{{ tasquesMap[of.tascaId].budget }}</span>
            </div>
          </div>

          <p class="oferta-nota" *ngIf="of.note">
            <span class="nota-label">{{ 'LES_MEVES_OFERTES.ATTACHED_NOTE' | translate }}</span> "{{ of.note }}"
          </p>

          <div class="card-actions">
            <button
              type="button"
              class="btn-action danger"
              (click)="eliminarOferta(of.id)"
              [title]="'LES_MEVES_OFERTES.BTN_DELETE_OFFER' | translate"
            >
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: -2px; margin-right: 5px;">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
              {{ 'LES_MEVES_OFERTES.BTN_DELETE_OFFER' | translate }}
            </button>
            <a *ngIf="of.tascaId" [routerLink]="[getNavUrl('/tasca-detall'), of.tascaId]" class="btn-action primary">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: -2px; margin-right: 5px;">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              {{ 'MERCAT.DETALL' | translate }}
            </a>
          </div>
        </div>
      </div>

      <!-- Estat buit -->
      <div class="empty-state" *ngIf="!loading && ofertes.length === 0">
        <div class="empty-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
          </svg>
        </div>
        <h3>{{ 'LES_MEVES_OFERTES.EMPTY_TITLE' | translate }}</h3>
        <p>{{ 'LES_MEVES_OFERTES.EMPTY_DESC' | translate }}</p>
        <a [routerLink]="getNavUrl('/inici')" class="btn-crear">{{ 'BLOG.BREADCRUMB_HOME' | translate }}</a>
      </div>
    </div>
  `,
  styles: [`
    .panell-container {
      max-width: 1050px;
      margin: 0 auto;
      padding: 1.5rem 1rem;
    }
    .panell-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      gap: 1rem;
      flex-wrap: wrap;
    }
    .panell-header h2 {
      margin: 0 0 0.35rem 0;
      color: #09090c;
      font-size: 1.85rem;
      font-weight: 900;
      letter-spacing: -0.02em;
    }
    .subtitle {
      margin: 0;
      color: #636058;
      font-size: 0.95rem;
      font-weight: 500;
    }
    .btn-crear {
      background: #ff1744;
      color: #ffffff;
      padding: 0.75rem 1.4rem;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 900;
      font-size: 0.9rem;
      transition: all 0.2s;
      box-shadow: 0 4px 14px rgba(255, 23, 68, 0.35);
    }
    .btn-crear:hover {
      background: #09090c;
      box-shadow: 0 4px 14px rgba(0, 0, 0, 0.2);
    }
    .filter-tabs {
      display: flex;
      gap: 0.65rem;
      margin-bottom: 1.5rem;
      border-bottom: 1px solid #e5e0d7;
      padding-bottom: 0.75rem;
      flex-wrap: wrap;
    }
    .tab-btn {
      background: #ffffff;
      border: 1px solid #d6d0c4;
      padding: 0.5rem 1.15rem;
      border-radius: 9999px;
      font-size: 0.88rem;
      font-weight: 800;
      color: #636058;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .tab-btn:hover {
      border-color: #ff1744;
      color: #09090c;
    }
    .tab-btn.active {
      background: #ff1744;
      border-color: #ff1744;
      color: #ffffff;
      font-weight: 900;
      box-shadow: 0 4px 15px rgba(255, 23, 68, 0.35);
    }
    .ofertes-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(min(100%, 300px), 1fr));
      gap: 1.35rem;
    }
    .oferta-card {
      background: #ffffff;
      border: 1px solid #e5e0d7;
      border-radius: 14px;
      padding: 1.35rem;
      display: flex;
      flex-direction: column;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
      transition: all 0.2s ease;
    }
    .oferta-card:hover {
      transform: translateY(-2px);
      border-color: #d6d0c4;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
    }
    .card-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 0.85rem;
    }
    .tasca-ref {
      font-size: 0.8rem;
      color: #ff1744;
      font-weight: 800;
      font-family: monospace;
    }
    .badge-estat {
      padding: 0.25rem 0.65rem;
      border-radius: 6px;
      font-size: 0.78rem;
      font-weight: 800;
    }
    .estat-pendent {
      background: rgba(245, 158, 11, 0.12);
      color: #b45309;
      border: 1px solid rgba(245, 158, 11, 0.3);
    }
    .estat-acceptada {
      background: rgba(255, 23, 68, 0.08);
      color: #ff1744;
      border: 1px solid rgba(255, 23, 68, 0.25);
    }
    .estat-rebutjada {
      background: rgba(239, 68, 68, 0.1);
      color: #dc2626;
      border: 1px solid rgba(239, 68, 68, 0.3);
    }
    .tasca-titol {
      margin: 0 0 0.5rem 0;
      font-size: 1.2rem;
      font-weight: 800;
      color: #09090c;
    }
    .tasca-desc {
      margin: 0 0 0.85rem 0;
      color: #636058;
      font-size: 0.85rem;
      font-weight: 500;
    }
    .user-inline-link {
      color: inherit;
      text-decoration: underline;
      text-decoration-color: rgba(255, 23, 68, 0.4);
      text-underline-offset: 3px;
      transition: color 0.15s ease, text-decoration-color 0.15s ease;
      cursor: pointer;
    }
    .user-inline-link:hover {
      color: #ff1744 !important;
      text-decoration-color: #ff1744;
    }
    .preu-box {
      background: #faf8f4;
      border: 1px solid #e5e0d7;
      padding: 0.85rem 1rem;
      border-radius: 10px;
      margin-bottom: 1rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .preu-item {
      display: flex;
      flex-direction: column;
    }
    .preu-label {
      font-size: 0.75rem;
      color: #8c887e;
      font-weight: 600;
    }
    .preu-value {
      font-weight: 900;
      color: #ff1744;
      font-size: 1.1rem;
    }
    .preu-value.muted {
      color: #636058;
      font-size: 0.95rem;
      font-weight: 700;
    }
    .oferta-nota {
      margin: 0 0 1.2rem 0;
      font-size: 0.85rem;
      color: #57554e;
      background: #faf8f4;
      border: 1px solid #e5e0d7;
      border-left: 3px solid #ff1744;
      padding: 0.65rem 0.85rem;
      border-radius: 6px;
      font-style: italic;
      flex: 1;
    }
    .nota-label {
      font-weight: 800;
      font-style: normal;
      color: #09090c;
    }
    .card-actions {
      display: flex;
      gap: 0.5rem;
    }
    .btn-action {
      flex: 1;
      padding: 0.6rem 0.85rem;
      border-radius: 8px;
      font-size: 0.82rem;
      font-weight: 800;
      cursor: pointer;
      text-align: center;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    }
    .btn-action.primary {
      background: #ff1744;
      color: #ffffff;
      font-weight: 900;
    }
    .btn-action.primary:hover {
      background: #09090c;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    }
    .btn-action.success {
      background: #059669;
      color: #ffffff;
      font-weight: 900;
      border: none;
    }
    .btn-action.success:hover {
      background: #047857;
      box-shadow: 0 4px 12px rgba(5, 150, 105, 0.3);
    }
    .btn-action.danger {
      background: #ffffff;
      color: #dc2626;
      border: 1px solid #fca5a5;
      font-weight: 800;
    }
    .btn-action.danger:hover {
      background: #fef2f2;
      border-color: #dc2626;
    }
    .propostes-section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.25rem;
      flex-wrap: wrap;
      gap: 0.5rem;
    }
    .estat-en-curs {
      background: rgba(16, 185, 129, 0.12);
      color: #059669;
      border: 1px solid rgba(16, 185, 129, 0.3);
    }
    .estat-finalitzada {
      background: rgba(107, 114, 128, 0.15);
      color: #374151;
      border: 1px solid rgba(107, 114, 128, 0.3);
    }
    .alert-success {
      background: #ecfdf5;
      color: #065f46;
      border: 1px solid #a7f3d0;
      padding: 0.75rem 1rem;
      border-radius: 8px;
      margin-bottom: 1rem;
      font-weight: 700;
    }
    .empty-state {
      text-align: center;
      padding: 3.5rem 1rem;
      background: #ffffff;
      border-radius: 12px;
      border: 1px dashed #d6d0c4;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
    }
    .empty-state h3 {
      color: #09090c;
      font-size: 1.25rem;
      font-weight: 800;
      margin-top: 0.75rem;
    }
    .empty-state p {
      color: #636058;
      font-weight: 500;
      margin-bottom: 1.25rem;
    }
    .empty-icon {
      font-size: 3rem;
      margin-bottom: 0.5rem;
    }
    .state-box {
      text-align: center;
      padding: 2.5rem;
      color: #636058;
      font-weight: 700;
    }
    .alert-error {
      background: #fef2f2;
      color: #dc2626;
      border: 1px solid #fecaca;
      padding: 0.75rem 1rem;
      border-radius: 8px;
      margin-bottom: 1rem;
      font-weight: 700;
    }
    .assigned-section {
      background: #fdfbf7;
      border: 1px solid #e7e2d6;
      border-radius: 16px;
      padding: 1.5rem 1.6rem;
      margin-bottom: 2rem;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02);
    }
    .section-title-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.25rem;
      flex-wrap: wrap;
      gap: 0.5rem;
    }
    .title-with-badge {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .title-with-badge h3 {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 900;
      color: #09090c;
    }
    .pro-assigned-pill {
      background: #ecfdf5;
      color: #065f46;
      border: 1px solid #a7f3d0;
      font-size: 0.7rem;
      font-weight: 900;
      padding: 0.2rem 0.55rem;
      border-radius: 6px;
      letter-spacing: 0.06em;
    }
    .section-badge-hint {
      font-size: 0.8rem;
      font-weight: 700;
      color: #78716c;
      background: #ffffff;
      border: 1px solid #e5e0d7;
      padding: 0.25rem 0.65rem;
      border-radius: 6px;
    }
    .assigned-tasks-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(min(100%, 290px), 1fr));
      gap: 1.25rem;
    }
    .assigned-task-card {
      background: #ffffff;
      border: 1px solid #e2ddd3;
      border-left: 4px solid #10b981;
      border-radius: 12px;
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 0.65rem;
      box-shadow: 0 3px 12px rgba(0, 0, 0, 0.03);
    }
    .assigned-task-card .badge-nature {
      background: #ecfdf5;
      color: #065f46;
      border: 1px solid #a7f3d0;
      font-size: 0.68rem;
      font-weight: 900;
      padding: 0.18rem 0.5rem;
      border-radius: 5px;
    }
    .assigned-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #faf8f4;
      border: 1px solid #eeeae0;
      padding: 0.5rem 0.75rem;
      border-radius: 8px;
      font-size: 0.84rem;
    }
    .assigned-meta-item .lbl {
      color: #78716c;
      margin-right: 0.35rem;
    }
    .budget-highlight {
      color: #059669;
      font-weight: 900;
    }
    .section-divider {
      height: 1px;
      background: #e5e0d7;
      margin: 1.5rem 0 2rem;
    }
    .user-inline-link {
      color: inherit;
      text-decoration: underline;
      cursor: pointer;
    }
    .user-inline-link:hover {
      color: #ff1744;
    }

    @media (max-width: 768px) {
      .panell-container {
        padding: 1rem 0.5rem;
      }
      .panell-header {
        flex-direction: column;
        align-items: stretch;
        gap: 0.85rem;
      }
      .btn-crear {
        text-align: center;
        width: 100%;
        box-sizing: border-box;
        display: block;
      }
      .assigned-tasks-grid,
      .ofertes-grid {
        grid-template-columns: 1fr;
        gap: 1rem;
      }
      .card-actions {
        flex-direction: column;
      }
      .btn-action {
        width: 100%;
      }
    }
  `]
})
export class LesMevesOfertesComponent implements OnInit {
  /** Llista d'ofertes enviades pel professional */
  ofertes: Oferta[] = [];
  /** Llista de tasques on el professional ha estat assignat i convergeix amb el client */
  tasquesAssignades: Tasca[] = [];
  /** Mapa per accedir ràpidament a les dades de la tasca [tascaId -> Tasca] */
  tasquesMap: Record<string, Tasca> = {};
  /** Estat de càrrega */
  loading = true;
  /** Missatge d'èxit */
  successMsg = '';
  /** Missatge d'error */
  errorMsg = '';

  constructor(
    private readonly ofertaService: OfertaService,
    private readonly tascaService: TascaService,
    private readonly authService: AuthService,
    private readonly confirmService: ConfirmService,
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

  /**
   * Inicialització del component: carrega les ofertes del professional connectat.
   */
  ngOnInit(): void {
    this.carregarOfertes();
  }

  /**
   * Carrega les ofertes enviades pel professional connectat i obté la informació de les tasques.
   */
  carregarOfertes(): void {
    this.loading = true;
    this.errorMsg = '';
    const user = this.authService.getCurrentUser();

    if (!user) {
      this.router.navigate([this.getNavUrl('/login')]);
      return;
    }

    // Carrega les tasques on aquest professional ha estat assignat
    this.tascaService.getByProfessional(user.nom).subscribe({
      next: (tasks) => {
        this.tasquesAssignades = tasks ?? [];
      },
      error: () => {}
    });

    // Carrega totes les tasques per a poder mostrar títol i dades del client a les ofertes
    this.tascaService.getAll().subscribe({
      next: (tasques) => {
        tasques.forEach(t => {
          this.tasquesMap[t.id] = t;
        });

        // Carrega les ofertes del professional
        this.ofertaService.getByProfessional(user.nom).subscribe({
          next: (data) => {
            this.ofertes = data;
            this.loading = false;
          },
          error: () => {
            this.errorMsg = 'Error en carregar les teves ofertes.';
            this.loading = false;
          }
        });
      },
      error: () => {
        this.errorMsg = 'Error en carregar la llista de tasques associades.';
        this.loading = false;
      }
    });
  }

  /**
   * Permet al professional assignat donar per finalitzada una tasca en curs.
   * El backend notificarà al client perquè pugui valorar la feina.
   */
  async finalitzarTascaComAProfessional(t: Tasca): Promise<void> {
    const confirmacio = await this.confirmService.confirm({
      title: 'CONFIRM_MODAL.FINALIZE_TASK_TITLE',
      message: 'CONFIRM_MODAL.FINALIZE_TASK_MSG',
      confirmText: 'CONFIRM_MODAL.DEFAULT_CONFIRM',
      cancelText: 'CONFIRM_MODAL.DEFAULT_CANCEL',
      icon: 'success'
    });
    if (!confirmacio) return;

    this.tascaService.complete(t.id).subscribe({
      next: () => {
        t.estat = 'Finalitzada';
        this.successMsg = `Has marcat la tasca "${t.titol}" com a finalitzada correctament.`;
        setTimeout(() => this.successMsg = '', 4500);
      },
      error: (err) => {
        console.error('Error finalitzant la tasca:', err);
        this.confirmService.alert('No s\'ha pogut marcar la tasca com a finalitzada.', 'Error');
      }
    });
  }

  /**
   * Elimina/borra una oferta del professional.
   * Les ofertes no tenen estat: sols s'accepten o es borren.
   */
  async eliminarOferta(id: string): Promise<void> {
    const confirmacio = await this.confirmService.confirm({
      title: 'CONFIRM_MODAL.DELETE_OFFER_TITLE',
      message: 'CONFIRM_MODAL.DELETE_OFFER_MSG',
      confirmText: 'CONFIRM_MODAL.DEFAULT_CONFIRM',
      cancelText: 'CONFIRM_MODAL.DEFAULT_CANCEL',
      isDanger: true,
      icon: 'danger'
    });
    if (!confirmacio) return;

    this.ofertaService.delete(id).subscribe({
      next: () => {
        this.ofertes = this.ofertes.filter(o => o.id !== id);
        this.successMsg = 'Oferta borrada amb èxit.';
        setTimeout(() => this.successMsg = '', 3500);
      },
      error: (err) => {
        console.error('Error eliminant l\'oferta:', err);
        this.confirmService.alert('No s\'ha pogut borrar l\'oferta.', 'Error');
      }
    });
  }

  getTaskEstatClass(estat: string): string {
    const e = estat?.toLowerCase() || '';
    if (e.includes('curs')) return 'estat-en-curs';
    if (e.includes('finalitzad')) return 'estat-finalitzada';
    return 'estat-pendent';
  }
}
