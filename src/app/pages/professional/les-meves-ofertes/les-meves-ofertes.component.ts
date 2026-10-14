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
          <h2>💼 Els meus Pressupostos i Ofertes</h2>
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
            Client: <strong>{{ tasquesMap[of.tascaId].clientNom }}</strong> | Categoria: <em>{{ tasquesMap[of.tascaId].categoria }}</em>
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
              🔍 Veure tasca completa
            </a>
          </div>
        </div>
      </div>

      <!-- Estat buit -->
      <div class="empty-state" *ngIf="!loading && ofertesFiltrades.length === 0">
        <div class="empty-icon">💼</div>
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
      color: #f5f4ef;
      font-size: 1.85rem;
      font-weight: 900;
      letter-spacing: -0.02em;
    }
    .subtitle {
      margin: 0;
      color: #bab8ae;
      font-size: 0.95rem;
      font-weight: 500;
    }
    .btn-crear {
      background: #00ff66;
      color: #08080a;
      padding: 0.75rem 1.4rem;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 900;
      font-size: 0.9rem;
      transition: all 0.2s;
    }
    .btn-crear:hover {
      background: #00dd55;
      box-shadow: 0 0 15px rgba(0, 255, 102, 0.4);
    }
    .filter-tabs {
      display: flex;
      gap: 0.65rem;
      margin-bottom: 1.5rem;
      border-bottom: 1px solid #1e1e28;
      padding-bottom: 0.75rem;
      flex-wrap: wrap;
    }
    .tab-btn {
      background: #111116;
      border: 1px solid #242432;
      padding: 0.5rem 1.15rem;
      border-radius: 9999px;
      font-size: 0.88rem;
      font-weight: 800;
      color: #bab8ae;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .tab-btn:hover {
      border-color: #00ff66;
      color: #f5f4ef;
    }
    .tab-btn.active {
      background: #00ff66;
      border-color: #00ff66;
      color: #08080a;
      font-weight: 900;
      box-shadow: 0 0 15px rgba(0, 255, 102, 0.35);
    }
    .ofertes-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 1.35rem;
    }
    .oferta-card {
      background: #111116;
      border: 1px solid #1e1e28;
      border-radius: 14px;
      padding: 1.35rem;
      display: flex;
      flex-direction: column;
      transition: all 0.2s ease;
    }
    .oferta-card:hover {
      transform: translateY(-2px);
      border-color: #2c2c3e;
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4);
    }
    .card-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 0.85rem;
    }
    .tasca-ref {
      font-size: 0.8rem;
      color: #00ff66;
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
      color: #f59e0b;
      border: 1px solid rgba(245, 158, 11, 0.3);
    }
    .estat-acceptada {
      background: rgba(0, 255, 102, 0.12);
      color: #00ff66;
      border: 1px solid rgba(0, 255, 102, 0.3);
    }
    .estat-rebutjada {
      background: rgba(239, 68, 68, 0.12);
      color: #ef4444;
      border: 1px solid rgba(239, 68, 68, 0.3);
    }
    .tasca-titol {
      margin: 0 0 0.5rem 0;
      font-size: 1.2rem;
      font-weight: 800;
      color: #f5f4ef;
    }
    .tasca-desc {
      margin: 0 0 0.85rem 0;
      color: #bab8ae;
      font-size: 0.85rem;
      font-weight: 500;
    }
    .preu-box {
      background: #181824;
      border: 1px solid #282836;
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
      color: #71717a;
      font-weight: 600;
    }
    .preu-value {
      font-weight: 900;
      color: #00ff66;
      font-size: 1.1rem;
    }
    .preu-value.muted {
      color: #bab8ae;
      font-size: 0.95rem;
      font-weight: 700;
    }
    .oferta-nota {
      margin: 0 0 1.2rem 0;
      font-size: 0.85rem;
      color: #bab8ae;
      background: #181824;
      border: 1px solid #282836;
      border-left: 3px solid #00ff66;
      padding: 0.65rem 0.85rem;
      border-radius: 6px;
      font-style: italic;
      flex: 1;
    }
    .nota-label {
      font-weight: 800;
      font-style: normal;
      color: #f5f4ef;
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
      background: #00ff66;
      color: #08080a;
      font-weight: 900;
    }
    .btn-action.primary:hover {
      background: #00dd55;
      box-shadow: 0 0 12px rgba(0, 255, 102, 0.35);
    }
    .empty-state {
      text-align: center;
      padding: 3.5rem 1rem;
      background: #111116;
      border-radius: 12px;
      border: 1px dashed #242432;
    }
    .empty-state h3 {
      color: #f5f4ef;
      font-size: 1.25rem;
      font-weight: 800;
      margin-top: 0.75rem;
    }
    .empty-state p {
      color: #bab8ae;
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
      color: #bab8ae;
      font-weight: 700;
    }
    .alert-error {
      background: rgba(239, 68, 68, 0.1);
      color: #ef4444;
      border: 1px solid rgba(239, 68, 68, 0.3);
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
