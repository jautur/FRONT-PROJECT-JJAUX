import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { TascaService } from '../../../services/tasca.service';
import { OfertaService } from '../../../services/oferta.service';
import { AuthService } from '../../../core/services/auth.service';
import { Tasca } from '../../../models/tasca.model';

/**
 * Tipus per al filtre d'estat de les tasques del client.
 */
type FiltreEstatTasca = 'totes' | 'oberta' | 'en_curs' | 'finalitzada';

/**
 * Component del Panell de Gestió de Tasques del Client (/client/les-meves-tasques).
 * Permet a un client:
 * - Visualitzar totes les tasques que ha publicat a la plataforma.
 * - Filtrar segons l'estat (obertes, en curs, finalitzades).
 * - Consultar quantes ofertes de professionals ha rebut cada tasca.
 * - Accedir a la revisió d'ofertes o donar per finalitzat el servei.
 * - Eliminar tasques publicades.
 */
@Component({
  selector: 'app-les-meves-tasques',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="panell-container">
      <div class="panell-header">
        <div>
          <h2>📋 Les meves Tasques Publicades</h2>
          <p class="subtitle">Gestiona les teves sol·licituds de servei i revisa els pressupostos rebuts.</p>
        </div>
        <div>
          <a routerLink="/client/crear-tasca" class="btn-crear">
            + Publicar nova tasca
          </a>
        </div>
      </div>

      <!-- Filtres per estat -->
      <div class="filter-tabs">
        <button
          type="button"
          class="tab-btn"
          [class.active]="filtreActiu === 'totes'"
          (click)="canviarFiltre('totes')"
        >
          Totes ({{ tasques.length }})
        </button>
        <button
          type="button"
          class="tab-btn"
          [class.active]="filtreActiu === 'oberta'"
          (click)="canviarFiltre('oberta')"
        >
          Obertes ({{ countByEstat('oberta') }})
        </button>
        <button
          type="button"
          class="tab-btn"
          [class.active]="filtreActiu === 'en_curs'"
          (click)="canviarFiltre('en_curs')"
        >
          En curs ({{ countByEstat('en curs') }})
        </button>
        <button
          type="button"
          class="tab-btn"
          [class.active]="filtreActiu === 'finalitzada'"
          (click)="canviarFiltre('finalitzada')"
        >
          Finalitzades ({{ countByEstat('finalitzada') }})
        </button>
      </div>

      <!-- Missatges d'estat -->
      <div *ngIf="loading" class="state-box">Carregant les teves tasques...</div>
      <div *ngIf="errorMsg" class="alert-error">{{ errorMsg }}</div>
      <div *ngIf="successMsg" class="alert-success">{{ successMsg }}</div>

      <!-- Llista de tasques -->
      <div class="tasques-grid" *ngIf="!loading && tasquesFiltrades.length > 0">
        <div *ngFor="let t of tasquesFiltrades" class="tasca-card">
          <div class="card-header">
            <span class="badge-categoria">{{ t.categoria }}</span>
            <span class="badge-estat" [ngClass]="getEstatClass(t.estat)">{{ t.estat }}</span>
          </div>

          <h3 class="tasca-titol">{{ t.titol }}</h3>
          <p class="tasca-desc">{{ t.descripcio }}</p>

          <div class="tasca-meta">
            <div class="meta-item">
              <span class="meta-label">Pressupost límit:</span>
              <span class="meta-value budget">{{ t.budget }}</span>
            </div>
            <div class="meta-item" *ngIf="ofertesCount[t.id] !== undefined">
              <span class="meta-label">Ofertes rebudes:</span>
              <span class="meta-value ofertes-badge">{{ ofertesCount[t.id] }} pressupost(s)</span>
            </div>
          </div>

          <div class="card-actions">
            <a [routerLink]="['/tasca-detall', t.id]" class="btn-action primary">
              🔍 Veure ofertes & detall
            </a>

            <button
              *ngIf="t.estat !== 'Finalitzada'"
              type="button"
              class="btn-action success"
              (click)="finalitzarTasca(t.id)"
            >
              ✓ Finalitzar
            </button>

            <button
              type="button"
              class="btn-action danger"
              (click)="eliminarTasca(t.id)"
            >
              🗑 Eliminar
            </button>
          </div>
        </div>
      </div>

      <!-- Estat buit -->
      <div class="empty-state" *ngIf="!loading && tasquesFiltrades.length === 0">
        <div class="empty-icon">📂</div>
        <h3>No s’ha trobat cap tasca en aquesta secció</h3>
        <p>Encara no has publicat cap sol·licitud o cap coincideix amb el filtre seleccionat.</p>
        <a routerLink="/client/crear-tasca" class="btn-crear">Publica la teva primera tasca</a>
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
    .tasques-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 1.35rem;
    }
    .tasca-card {
      background: #ffffff;
      border: 1px solid #e5e0d7;
      border-radius: 14px;
      padding: 1.35rem;
      display: flex;
      flex-direction: column;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
      transition: all 0.2s ease;
    }
    .tasca-card:hover {
      transform: translateY(-2px);
      border-color: #d6d0c4;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
    }
    .card-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 0.85rem;
    }
    .badge-categoria {
      background: #f0ece3;
      border: 1px solid #dcd6cb;
      color: #09090c;
      padding: 0.25rem 0.65rem;
      border-radius: 6px;
      font-size: 0.78rem;
      font-weight: 700;
    }
    .badge-estat {
      padding: 0.25rem 0.65rem;
      border-radius: 6px;
      font-size: 0.78rem;
      font-weight: 800;
    }
    .estat-oberta {
      background: rgba(255, 23, 68, 0.08);
      color: #ff1744;
      border: 1px solid rgba(255, 23, 68, 0.25);
    }
    .estat-en-curs {
      background: rgba(245, 158, 11, 0.12);
      color: #b45309;
      border: 1px solid rgba(245, 158, 11, 0.3);
    }
    .estat-finalitzada {
      background: rgba(148, 163, 184, 0.15);
      color: #475569;
      border: 1px solid rgba(148, 163, 184, 0.3);
    }
    .tasca-titol {
      margin: 0 0 0.5rem 0;
      font-size: 1.2rem;
      font-weight: 800;
      color: #09090c;
    }
    .tasca-desc {
      margin: 0 0 1.25rem 0;
      color: #636058;
      font-size: 0.9rem;
      line-height: 1.45;
      flex: 1;
    }
    .tasca-meta {
      background: #faf8f4;
      border: 1px solid #e5e0d7;
      padding: 0.85rem 1rem;
      border-radius: 10px;
      margin-bottom: 1.2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .meta-item {
      display: flex;
      flex-direction: column;
    }
    .meta-label {
      font-size: 0.75rem;
      color: #8c887e;
      font-weight: 600;
    }
    .meta-value.budget {
      font-weight: 900;
      color: #ff1744;
      font-size: 1.05rem;
    }
    .meta-value.ofertes-badge {
      font-weight: 800;
      color: #09090c;
      font-size: 0.85rem;
    }
    .card-actions {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
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
      border: 1px solid transparent;
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
      background: rgba(255, 23, 68, 0.08);
      color: #ff1744;
      border-color: rgba(255, 23, 68, 0.3);
    }
    .btn-action.success:hover {
      background: #ff1744;
      color: #ffffff;
    }
    .btn-action.danger {
      background: rgba(239, 68, 68, 0.1);
      color: #dc2626;
      border-color: rgba(239, 68, 68, 0.3);
      flex: 0 0 auto;
    }
    .btn-action.danger:hover {
      background: #fee2e2;
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
    .alert-success {
      background: rgba(255, 23, 68, 0.08);
      color: #ff1744;
      border: 1px solid rgba(255, 23, 68, 0.25);
      padding: 0.75rem 1rem;
      border-radius: 8px;
      margin-bottom: 1rem;
      font-weight: 700;
    }
  `]
})
export class LesMevesTasquesComponent implements OnInit {
  /** Llista de tasques publicades per l'usuari */
  tasques: Tasca[] = [];
  /** Filtre actiu de l'estat */
  filtreActiu: FiltreEstatTasca = 'totes';
  /** Mapa de recompte d'ofertes rebudes per cada tasca [tascaId -> número d'ofertes] */
  ofertesCount: Record<string, number> = {};
  /** Indicador de procés en curs */
  loading = true;
  /** Missatge d'error */
  errorMsg = '';
  /** Missatge d'èxit */
  successMsg = '';

  constructor(
    private readonly tascaService: TascaService,
    private readonly ofertaService: OfertaService,
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  /**
   * Cicle de vida inicial del component: carrega les tasques del client connectat.
   */
  ngOnInit(): void {
    this.carregarTasques();
  }

  /**
   * Retorna les tasques filtrades segons l'estat seleccionat.
   */
  get tasquesFiltrades(): Tasca[] {
    if (this.filtreActiu === 'oberta') {
      return this.tasques.filter(t => t.estat?.toLowerCase().includes('obert'));
    }
    if (this.filtreActiu === 'en_curs') {
      return this.tasques.filter(t => t.estat?.toLowerCase().includes('curs'));
    }
    if (this.filtreActiu === 'finalitzada') {
      return this.tasques.filter(t => t.estat?.toLowerCase().includes('finalitzad'));
    }
    return this.tasques;
  }

  /**
   * Calcula el nombre de tasques d'un determinat estat.
   * @param estatFragment Text parcial de l'estat a comparar
   * @returns Nombre de tasques que compleixen el criteri
   */
  countByEstat(estatFragment: string): number {
    return this.tasques.filter(t => t.estat?.toLowerCase().includes(estatFragment.toLowerCase())).length;
  }

  /**
   * Carrega les tasques associades al client actual des de l'API.
   */
  carregarTasques(): void {
    this.loading = true;
    this.errorMsg = '';
    const user = this.authService.getCurrentUser();

    if (!user) {
      this.router.navigate(['/login']);
      return;
    }

    this.tascaService.getByClient(user.nom).subscribe({
      next: (data) => {
        this.tasques = data;
        this.loading = false;
        // Carrega el recompte d'ofertes per a cadascuna de les tasques
        this.carregarRecompteOfertes();
      },
      error: () => {
        this.errorMsg = 'Error en carregar les teves tasques.';
        this.loading = false;
      }
    });
  }

  /**
   * Consulta per a cada tasca el nombre d'ofertes rebudes.
   */
  private carregarRecompteOfertes(): void {
    this.tasques.forEach(t => {
      this.ofertaService.getByTasca(t.id).subscribe({
        next: (ofertes) => {
          this.ofertesCount[t.id] = ofertes.length;
        },
        error: () => {
          this.ofertesCount[t.id] = 0;
        }
      });
    });
  }

  /**
   * Modifica el filtre d'estat actiu.
   * @param nouFiltre Filtre a aplicar
   */
  canviarFiltre(nouFiltre: FiltreEstatTasca): void {
    this.filtreActiu = nouFiltre;
  }

  /**
   * Retorna la classe CSS adequada segons l'estat de la tasca.
   * @param estat Estat actual de la tasca
   * @returns Nom de la classe CSS
   */
  getEstatClass(estat: string): string {
    const e = estat?.toLowerCase() || '';
    if (e.includes('obert')) return 'estat-oberta';
    if (e.includes('curs')) return 'estat-en-curs';
    if (e.includes('finalitzad')) return 'estat-finalitzada';
    return '';
  }

  /**
   * Marca una tasca com a finalitzada.
   * @param id Identificador de la tasca
   */
  finalitzarTasca(id: string): void {
    if (!confirm('Vols marcar aquesta tasca com a completada definitivament?')) return;

    this.tascaService.complete(id).subscribe({
      next: () => {
        this.successMsg = 'Tasca finalitzada correctament!';
        const target = this.tasques.find(t => t.id === id);
        if (target) {
          target.estat = 'Finalitzada';
        }
        setTimeout(() => this.successMsg = '', 3000);
      },
      error: () => {
        this.errorMsg = 'Error en finalitzar la tasca.';
      }
    });
  }

  /**
   * Elimina una tasca de la base de dades.
   * @param id Identificador de la tasca a suprimir
   */
  eliminarTasca(id: string): void {
    if (!confirm('Estàs segur d’eliminar aquesta tasca? Aquesta acció no es pot desfer.')) return;

    this.tascaService.delete(id).subscribe({
      next: () => {
        this.tasques = this.tasques.filter(t => t.id !== id);
        this.successMsg = 'Tasca eliminada amb èxit.';
        setTimeout(() => this.successMsg = '', 3000);
      },
      error: () => {
        this.errorMsg = 'Error en eliminar la tasca.';
      }
    });
  }
}
