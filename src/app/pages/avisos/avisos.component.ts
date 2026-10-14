import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AvisService } from '../../services/avis.service';
import { AuthService } from '../../core/services/auth.service';
import { Avis } from '../../models/avis.model';

/**
 * Filtre actiu per al panell de notificacions.
 */
type FiltreAvisos = 'totes' | 'pendents' | 'llegides';

/**
 * Component del Panell de Notificacions i Avisos (/avisos).
 * Permet a l'usuari connectat:
 * - Visualitzar tots els seus avisos (pressupostos rebuts, acceptacions, etc.).
 * - Filtrar entre pendents i llegits.
 * - Marcar notificacions com a llegides individualment o en bloc.
 * - Eliminar notificacions que ja no necessita.
 */
@Component({
  selector: 'app-avisos',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="avisos-container">
      <div class="avisos-header">
        <div>
          <h2>Safata d'Avisos i Notificacions</h2>
          <p class="subtitle">Estat de les teves tasques, ofertes i alertes en temps real.</p>
        </div>
        <div class="header-actions" *ngIf="avisos.length > 0">
          <button type="button" class="btn-action-alt" (click)="marcarTotesLlegides()" [disabled]="pendentsCount === 0">
            Marcar totes com a llegides
          </button>
        </div>
      </div>

      <!-- Filtres -->
      <div class="filter-tabs">
        <button
          type="button"
          class="tab-btn"
          [class.active]="filtreActiu === 'totes'"
          (click)="canviarFiltre('totes')"
        >
          Totes ({{ avisos.length }})
        </button>
        <button
          type="button"
          class="tab-btn"
          [class.active]="filtreActiu === 'pendents'"
          (click)="canviarFiltre('pendents')"
        >
          Pendents ({{ pendentsCount }})
        </button>
        <button
          type="button"
          class="tab-btn"
          [class.active]="filtreActiu === 'llegides'"
          (click)="canviarFiltre('llegides')"
        >
          Llegides ({{ avisos.length - pendentsCount }})
        </button>
      </div>

      <!-- Estat de càrrega o error -->
      <div *ngIf="loading" class="state-box">Carregant avisos...</div>
      <div *ngIf="errorMsg" class="alert-error">{{ errorMsg }}</div>
      <div *ngIf="successMsg" class="alert-success">{{ successMsg }}</div>

      <!-- Llista de notificacions -->
      <div class="avisos-list" *ngIf="!loading && avisosFiltrats.length > 0">
        <div
          *ngFor="let a of avisosFiltrats"
          class="avis-card"
          [class.no-llegit]="!a.llegit"
        >
          <div class="avis-indicator">
            <span class="dot" *ngIf="!a.llegit" title="Pendent de llegir"></span>
          </div>

          <div class="avis-body">
            <div class="avis-meta">
              <span class="badge-status" [class.badge-pendent]="!a.llegit" [class.badge-llegit]="a.llegit">
                {{ a.llegit ? 'Llegit' : 'Nou' }}
              </span>
              <span class="avis-date">{{ formatData(a.data) }}</span>
            </div>
            <p class="avis-text">{{ a.missatge }}</p>
          </div>

          <div class="avis-actions">
            <button
              *ngIf="!a.llegit"
              type="button"
              class="btn-icon"
              title="Marcar com a llegit"
              (click)="marcarLlegit(a.id)"
            >
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: -2px; margin-right: 4px;">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              Llegit
            </button>
            <button
              type="button"
              class="btn-icon danger"
              title="Eliminar notificació"
              (click)="eliminarAvis(a.id)"
              aria-label="Eliminar"
            >
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Llista buida -->
      <div class="empty-state" *ngIf="!loading && avisosFiltrats.length === 0">
        <div class="empty-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 12h-6l-2 3h-4l-2-3H2"></path>
            <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"></path>
          </svg>
        </div>
        <h3>No tens cap notificació en aquest apartat</h3>
        <p *ngIf="filtreActiu !== 'totes'">Prova de canviar de filtre per veure altres notificacions.</p>
        <p *ngIf="filtreActiu === 'totes'">Quan rebis pressupostos o s'actualitzi una de les teves tasques, apareixeran aquí.</p>
        <a routerLink="/" class="btn-primary">Tornar a l'inici</a>
      </div>
    </div>
  `,
  styles: [`
    .avisos-container {
      max-width: 900px;
      margin: 0 auto;
      padding: 1.5rem 1rem;
    }
    .avisos-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 2rem;
      gap: 1rem;
      flex-wrap: wrap;
    }
    .avisos-header h2 {
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
    .filter-tabs {
      display: flex;
      gap: 0.65rem;
      margin-bottom: 1.5rem;
      border-bottom: 1px solid #e5e0d7;
      padding-bottom: 0.75rem;
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
    .avisos-list {
      display: flex;
      flex-direction: column;
      gap: 0.85rem;
    }
    .avis-card {
      display: flex;
      align-items: center;
      gap: 1.1rem;
      background: #ffffff;
      border: 1px solid #e5e0d7;
      border-radius: 12px;
      padding: 1.1rem 1.35rem;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.03);
      transition: all 0.2s ease;
    }
    .avis-card:hover {
      border-color: #d6d0c4;
      background: #faf8f4;
    }
    .avis-card.no-llegit {
      border-left: 4px solid #ff1744;
      background: #ffffff;
    }
    .avis-indicator {
      width: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .dot {
      width: 10px;
      height: 10px;
      background: #ff1744;
      border-radius: 50%;
      display: inline-block;
      box-shadow: 0 0 8px #ff1744;
    }
    .avis-body {
      flex: 1;
    }
    .avis-meta {
      display: flex;
      gap: 0.75rem;
      align-items: center;
      margin-bottom: 0.4rem;
    }
    .badge-status {
      font-size: 0.75rem;
      padding: 0.2rem 0.55rem;
      border-radius: 4px;
      font-weight: 800;
    }
    .badge-pendent {
      background: rgba(255, 23, 68, 0.08);
      color: #ff1744;
      border: 1px solid rgba(255, 23, 68, 0.25);
    }
    .badge-llegit {
      background: #f0ece3;
      color: #716e66;
      border: 1px solid #dcd6cb;
    }
    .avis-date {
      font-size: 0.8rem;
      color: #8c887e;
      font-weight: 600;
    }
    .avis-text {
      margin: 0;
      color: #09090c;
      font-size: 0.95rem;
      font-weight: 600;
      line-height: 1.45;
    }
    .avis-actions {
      display: flex;
      gap: 0.5rem;
    }
    .btn-icon {
      background: #ffffff;
      border: 1px solid #d6d0c4;
      padding: 0.4rem 0.75rem;
      border-radius: 6px;
      font-size: 0.8rem;
      font-weight: 800;
      cursor: pointer;
      color: #09090c;
      transition: all 0.2s;
    }
    .btn-icon:hover {
      border-color: #ff1744;
      color: #ff1744;
    }
    .btn-icon.danger {
      color: #dc2626;
      border-color: rgba(220, 38, 38, 0.3);
    }
    .btn-icon.danger:hover {
      background: #fee2e2;
      border-color: #dc2626;
    }
    .btn-action-alt {
      background: #ffffff;
      border: 1px solid #d6d0c4;
      padding: 0.55rem 1rem;
      border-radius: 8px;
      font-size: 0.85rem;
      cursor: pointer;
      font-weight: 800;
      color: #09090c;
      transition: all 0.2s;
    }
    .btn-action-alt:hover:not(:disabled) {
      border-color: #09090c;
      background: #09090c;
      color: #ffffff;
    }
    .btn-action-alt:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }
    .btn-primary {
      display: inline-block;
      background: #ff1744;
      color: #ffffff;
      font-weight: 900;
      padding: 0.65rem 1.4rem;
      border-radius: 8px;
      text-decoration: none;
      font-size: 0.9rem;
      margin-top: 1rem;
      transition: all 0.2s;
      box-shadow: 0 4px 14px rgba(255, 23, 68, 0.35);
    }
    .btn-primary:hover {
      background: #09090c;
      box-shadow: 0 4px 14px rgba(0, 0, 0, 0.2);
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
export class AvisosComponent implements OnInit {
  /** Llista de tots els avisos obtinguts de l'API */
  avisos: Avis[] = [];
  /** Filtre actiu seleccionat per l'usuari */
  filtreActiu: FiltreAvisos = 'totes';
  /** Estat de càrrega activa */
  loading = true;
  /** Missatge d'error si s'escau */
  errorMsg = '';
  /** Missatge d'èxit de l'última acció */
  successMsg = '';

  constructor(
    private readonly avisService: AvisService,
    private readonly authService: AuthService
  ) {}

  /**
   * Inicialització del component: carrega els avisos de l'usuari connectat.
   */
  ngOnInit(): void {
    this.carregarAvisos();
  }

  /**
   * Obté la quantitat d'avisos pendents de llegir.
   */
  get pendentsCount(): number {
    return this.avisos.filter(a => !a.llegit).length;
  }

  /**
   * Retorna la llista d'avisos segons el filtre actiu seleccionat.
   */
  get avisosFiltrats(): Avis[] {
    if (this.filtreActiu === 'pendents') {
      return this.avisos.filter(a => !a.llegit);
    }
    if (this.filtreActiu === 'llegides') {
      return this.avisos.filter(a => a.llegit);
    }
    return this.avisos;
  }

  /**
   * Carrega els avisos personals de l'usuari o tots si és un administrador.
   */
  carregarAvisos(): void {
    this.loading = true;
    this.errorMsg = '';
    const user = this.authService.getCurrentUser();

    if (user && user.id) {
      this.avisService.getByUsuari(user.id).subscribe({
        next: (data) => {
          this.avisos = data;
          this.loading = false;
        },
        error: (err) => {
          this.errorMsg = 'No s’han pogut carregar les notificacions.';
          this.loading = false;
        }
      });
    } else {
      this.avisService.getAll().subscribe({
        next: (data) => {
          this.avisos = data;
          this.loading = false;
        },
        error: (err) => {
          this.errorMsg = 'No s’han pogut carregar les notificacions.';
          this.loading = false;
        }
      });
    }
  }

  /**
   * Canvia el filtre actiu de visualització.
   * @param filtre Nou filtre a aplicar ('totes' | 'pendents' | 'llegides')
   */
  canviarFiltre(filtre: FiltreAvisos): void {
    this.filtreActiu = filtre;
  }

  /**
   * Marca una notificació com a llegida.
   * @param id Identificador de l'avís
   */
  marcarLlegit(id: string): void {
    this.avisService.markAsRead(id).subscribe({
      next: () => {
        const item = this.avisos.find(a => a.id === id);
        if (item) {
          item.llegit = true;
        }
      },
      error: () => {
        this.errorMsg = 'Error en marcar l’avís com a llegit.';
      }
    });
  }

  /**
   * Marca totes les notificacions pendents com a llegides.
   */
  marcarTotesLlegides(): void {
    const pendents = this.avisos.filter(a => !a.llegit);
    if (pendents.length === 0) return;

    let pendentsRestants = pendents.length;
    pendents.forEach(a => {
      this.avisService.markAsRead(a.id).subscribe({
        next: () => {
          a.llegit = true;
          pendentsRestants--;
          if (pendentsRestants === 0) {
            this.successMsg = 'Totes les notificacions s’han marcat com a llegides!';
            setTimeout(() => this.successMsg = '', 3000);
          }
        }
      });
    });
  }

  /**
   * Elimina un avís de la safata de notificacions.
   * @param id Identificador de l'avís a esborrar
   */
  eliminarAvis(id: string): void {
    this.avisService.delete(id).subscribe({
      next: () => {
        this.avisos = this.avisos.filter(a => a.id !== id);
        this.successMsg = 'Notificació eliminada correctament.';
        setTimeout(() => this.successMsg = '', 3000);
      },
      error: () => {
        this.errorMsg = 'Error en eliminar la notificació.';
      }
    });
  }

  /**
   * Formateja una data per mostrar-la de forma llegible.
   * @param date Data en format ISO o Date
   * @returns Cadena formatejada
   */
  formatData(date: string | Date): string {
    if (!date) return '';
    const d = new Date(date);
    return isNaN(d.getTime()) ? String(date) : d.toLocaleDateString('ca-ES', { day: '2-digit', month: 'short', year: 'numeric' });
  }
}
