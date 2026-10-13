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
      margin-bottom: 1.5rem;
      gap: 1rem;
      flex-wrap: wrap;
    }
    .panell-header h2 {
      margin: 0 0 0.3rem 0;
      color: #0f172a;
      font-size: 1.5rem;
    }
    .subtitle {
      margin: 0;
      color: #64748b;
      font-size: 0.95rem;
    }
    .btn-crear {
      background: #0284c7;
      color: #fff;
      padding: 0.6rem 1.25rem;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 600;
      font-size: 0.9rem;
      transition: background 0.15s;
    }
    .btn-crear:hover {
      background: #0369a1;
    }
    .filter-tabs {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 1.5rem;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 0.5rem;
      flex-wrap: wrap;
    }
    .tab-btn {
      background: none;
      border: none;
      padding: 0.45rem 1rem;
      border-radius: 9999px;
      font-size: 0.88rem;
      font-weight: 500;
      color: #64748b;
      cursor: pointer;
      transition: all 0.15s ease;
    }
    .tab-btn:hover {
      background: #f1f5f9;
      color: #0f172a;
    }
    .tab-btn.active {
      background: #0284c7;
      color: #fff;
    }
    .tasques-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 1.25rem;
    }
    .tasca-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
      transition: transform 0.15s, box-shadow 0.15s;
    }
    .tasca-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
    }
    .card-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 0.75rem;
    }
    .badge-categoria {
      background: #f1f5f9;
      color: #475569;
      padding: 0.2rem 0.6rem;
      border-radius: 6px;
      font-size: 0.78rem;
      font-weight: 600;
    }
    .badge-estat {
      padding: 0.2rem 0.6rem;
      border-radius: 6px;
      font-size: 0.78rem;
      font-weight: 600;
    }
    .estat-oberta {
      background: #e0f2fe;
      color: #0369a1;
    }
    .estat-en-curs {
      background: #fef3c7;
      color: #92400e;
    }
    .estat-finalitzada {
      background: #dcfce7;
      color: #166534;
    }
    .tasca-titol {
      margin: 0 0 0.5rem 0;
      font-size: 1.15rem;
      color: #0f172a;
    }
    .tasca-desc {
      margin: 0 0 1rem 0;
      color: #64748b;
      font-size: 0.9rem;
      line-height: 1.4;
      flex: 1;
    }
    .tasca-meta {
      background: #f8fafc;
      padding: 0.75rem;
      border-radius: 8px;
      margin-bottom: 1rem;
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
      color: #94a3b8;
    }
    .meta-value.budget {
      font-weight: 700;
      color: #0f172a;
      font-size: 1rem;
    }
    .meta-value.ofertes-badge {
      font-weight: 600;
      color: #0284c7;
      font-size: 0.85rem;
    }
    .card-actions {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }
    .btn-action {
      flex: 1;
      padding: 0.45rem 0.65rem;
      border-radius: 6px;
      font-size: 0.82rem;
      font-weight: 500;
      cursor: pointer;
      text-align: center;
      text-decoration: none;
      border: 1px solid transparent;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
    .btn-action.primary {
      background: #0284c7;
      color: #fff;
    }
    .btn-action.primary:hover {
      background: #0369a1;
    }
    .btn-action.success {
      background: #f0fdf4;
      color: #166534;
      border-color: #bbf7d0;
    }
    .btn-action.success:hover {
      background: #dcfce7;
    }
    .btn-action.danger {
      background: #fff;
      color: #ef4444;
      border-color: #fecaca;
      flex: 0 0 auto;
    }
    .btn-action.danger:hover {
      background: #fee2e2;
    }
    .empty-state {
      text-align: center;
      padding: 3rem 1rem;
      background: #fff;
      border-radius: 12px;
      border: 1px dashed #cbd5e1;
    }
    .empty-icon {
      font-size: 3rem;
      margin-bottom: 0.5rem;
    }
    .state-box {
      text-align: center;
      padding: 2rem;
      color: #64748b;
    }
    .alert-error {
      background: #fee2e2;
      color: #991b1b;
      padding: 0.75rem 1rem;
      border-radius: 6px;
      margin-bottom: 1rem;
    }
    .alert-success {
      background: #dcfce7;
      color: #166534;
      padding: 0.75rem 1rem;
      border-radius: 6px;
      margin-bottom: 1rem;
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
