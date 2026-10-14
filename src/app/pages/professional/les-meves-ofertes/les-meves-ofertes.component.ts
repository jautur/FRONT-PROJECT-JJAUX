import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { OfertaService } from '../../../services/oferta.service';
import { TascaService } from '../../../services/tasca.service';
import { AuthService } from '../../../core/services/auth.service';
import { Oferta } from '../../../models/oferta.model';
import { Tasca } from '../../../models/tasca.model';

/**
 * Filtre per a l'estat de les ofertes del professional.
 */
type FiltreEstatOferta = 'totes' | 'pendent' | 'acceptada' | 'rebutjada';

/**
 * Component del Panell de Gestió d'Ofertes del Professional (/professional/les-meves-ofertes).
 * Permet a un professional:
 * - Consultar tots els pressupostos que ha presentat per a diverses tasques.
 * - Filtrar segons l'estat de la seva oferta (pendent, acceptada, rebutjada).
 * - Comparar el seu preu proposat amb el pressupost estimat del client.
 * - Navegar directament als detalls de la tasca per consultar requisits o actualitzacions.
 */
@Component({
  selector: 'app-les-meves-ofertes',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="panell-container">
      <div class="panell-header">
        <div>
          <h2>Els meus Pressupostos i Ofertes</h2>
          <p class="subtitle">Fes seguiment de les teves propostes econòmiques enviades als clients.</p>
        </div>
        <div>
          <a routerLink="/professional/crear-oferta" class="btn-crear">
            + Nova oferta
          </a>
        </div>
      </div>

      <!-- Filtres d'oferta -->
      <div class="filter-tabs">
        <button
          type="button"
          class="tab-btn"
          [class.active]="filtreActiu === 'totes'"
          (click)="canviarFiltre('totes')"
        >
          Totes ({{ ofertes.length }})
        </button>
        <button
          type="button"
          class="tab-btn"
          [class.active]="filtreActiu === 'pendent'"
          (click)="canviarFiltre('pendent')"
        >
          Pendents ({{ countByEstat('pendent') }})
        </button>
        <button
          type="button"
          class="tab-btn"
          [class.active]="filtreActiu === 'acceptada'"
          (click)="canviarFiltre('acceptada')"
        >
          Acceptades ({{ countByEstat('acceptad') }})
        </button>
        <button
          type="button"
          class="tab-btn"
          [class.active]="filtreActiu === 'rebutjada'"
          (click)="canviarFiltre('rebutjada')"
        >
          Rebutjades ({{ countByEstat('rebutjad') }})
        </button>
      </div>

      <!-- Missatges d'estat -->
      <div *ngIf="loading" class="state-box">Carregant les teves ofertes...</div>
      <div *ngIf="errorMsg" class="alert-error">{{ errorMsg }}</div>

      <!-- Llista d'ofertes en targetes -->
      <div class="ofertes-grid" *ngIf="!loading && ofertesFiltrades.length > 0">
        <div *ngFor="let of of ofertesFiltrades" class="oferta-card">
          <div class="card-header">
            <span class="tasca-ref">Ref: {{ of.tascaId }}</span>
            <span class="badge-estat" [ngClass]="getEstatClass(of.estat)">{{ of.estat }}</span>
          </div>

          <h3 class="tasca-titol">
            {{ tasquesMap[of.tascaId]?.titol || 'Tasca ' + of.tascaId }}
          </h3>

          <p class="tasca-desc" *ngIf="tasquesMap[of.tascaId]">
            Client: <strong><a [routerLink]="['/perfil', tasquesMap[of.tascaId].clientNom || tasquesMap[of.tascaId].client]" class="user-inline-link" title="Veure perfil de {{ tasquesMap[of.tascaId].clientNom || tasquesMap[of.tascaId].client }}">{{ tasquesMap[of.tascaId].clientNom || tasquesMap[of.tascaId].client }}</a></strong> | Categoria: <em>{{ tasquesMap[of.tascaId].categoria }}</em>
          </p>

          <div class="preu-box">
            <div class="preu-item">
              <span class="preu-label">El teu pressupost:</span>
              <span class="preu-value">{{ of.price }}</span>
            </div>
            <div class="preu-item" *ngIf="tasquesMap[of.tascaId]">
              <span class="preu-label">Pressupost client:</span>
              <span class="preu-value muted">{{ tasquesMap[of.tascaId].budget }}</span>
            </div>
          </div>

          <p class="oferta-nota" *ngIf="of.note">
            <span class="nota-label">Nota adjunta:</span> "{{ of.note }}"
          </p>

          <div class="card-actions">
            <a [routerLink]="['/tasca-detall', of.tascaId]" class="btn-action primary">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: -2px; margin-right: 5px;">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              Veure tasca completa
            </a>
          </div>
        </div>
      </div>

      <!-- Estat buit -->
      <div class="empty-state" *ngIf="!loading && ofertesFiltrades.length === 0">
        <div class="empty-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
          </svg>
        </div>
        <h3>No s’ha trobat cap oferta en aquest apartat</h3>
        <p>Encara no has presentat cap oferta o cap coincideix amb el filtre seleccionat.</p>
        <a routerLink="/" class="btn-crear">Explora tasques disponibles</a>
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
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
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
  `]
})
export class LesMevesOfertesComponent implements OnInit {
  /** Llista d'ofertes enviades pel professional */
  ofertes: Oferta[] = [];
  /** Filtre actiu seleccionat */
  filtreActiu: FiltreEstatOferta = 'totes';
  /** Mapa per accedir ràpidament a les dades de la tasca [tascaId -> Tasca] */
  tasquesMap: Record<string, Tasca> = {};
  /** Estat de càrrega */
  loading = true;
  /** Missatge d'error */
  errorMsg = '';

  constructor(
    private readonly ofertaService: OfertaService,
    private readonly tascaService: TascaService,
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  /**
   * Inicialització del component: carrega les ofertes del professional connectat.
   */
  ngOnInit(): void {
    this.carregarOfertes();
  }

  /**
   * Retorna les ofertes segons el filtre actiu.
   */
  get ofertesFiltrades(): Oferta[] {
    if (this.filtreActiu === 'pendent') {
      return this.ofertes.filter(o => o.estat?.toLowerCase().includes('pend'));
    }
    if (this.filtreActiu === 'acceptada') {
      return this.ofertes.filter(o => o.estat?.toLowerCase().includes('accept'));
    }
    if (this.filtreActiu === 'rebutjada') {
      return this.ofertes.filter(o => o.estat?.toLowerCase().includes('rebutj'));
    }
    return this.ofertes;
  }

  /**
   * Calcula el recompte d'ofertes segons un criteri d'estat.
   * @param fragment Text parcial de l'estat a comparar
   * @returns Nombre d'ofertes coincidents
   */
  countByEstat(fragment: string): number {
    return this.ofertes.filter(o => o.estat?.toLowerCase().includes(fragment.toLowerCase())).length;
  }

  /**
   * Carrega les ofertes enviades pel professional connectat i obté la informació de les tasques.
   */
  carregarOfertes(): void {
    this.loading = true;
    this.errorMsg = '';
    const user = this.authService.getCurrentUser();

    if (!user) {
      this.router.navigate(['/login']);
      return;
    }

    // Carrega totes les tasques per a poder mostrar títol i dades del client
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
   * Modifica el filtre d'estat actiu.
   * @param filtre Nou filtre a aplicar
   */
  canviarFiltre(filtre: FiltreEstatOferta): void {
    this.filtreActiu = filtre;
  }

  /**
   * Retorna la classe CSS estilitzada per a cada estat de l'oferta.
   * @param estat Estat textual de l'oferta
   * @returns Nom de la classe CSS
   */
  getEstatClass(estat: string): string {
    const e = estat?.toLowerCase() || '';
    if (e.includes('pend')) return 'estat-pendent';
    if (e.includes('accept')) return 'estat-acceptada';
    if (e.includes('rebutj')) return 'estat-rebutjada';
    return '';
  }
}
