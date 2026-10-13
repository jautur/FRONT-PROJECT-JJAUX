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
          <h2>🔔 Safata d'Avisos i Notificacions</h2>
          <p class="subtitle">Estat de les teves tasques, ofertes i alertes en temps real.</p>
        </div>
        <div class="header-actions" *ngIf="avisos.length > 0">
          <button type="button" class="btn-action-alt" (click)="marcarTotesLlegides()" [disabled]="pendentsCount === 0">
            ✓ Marcar totes com a llegides
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
              ✓ Llegit
            </button>
            <button
              type="button"
              class="btn-icon danger"
              title="Eliminar notificació"
              (click)="eliminarAvis(a.id)"
            >
              ✕
            </button>
          </div>
        </div>
      </div>

      <!-- Llista buida -->
      <div class="empty-state" *ngIf="!loading && avisosFiltrats.length === 0">
        <div class="empty-icon">📭</div>
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
      margin-bottom: 1.5rem;
      gap: 1rem;
      flex-wrap: wrap;
    }
    .avisos-header h2 {
      margin: 0 0 0.3rem 0;
      color: #0f172a;
      font-size: 1.5rem;
    }
    .subtitle {
      margin: 0;
      color: #64748b;
      font-size: 0.95rem;
    }
    .filter-tabs {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 1.25rem;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 0.5rem;
    }
    .tab-btn {
      background: none;
      border: 1px solid transparent;
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
    .avisos-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }
    .avis-card {
      display: flex;
      align-items: center;
      gap: 1rem;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 1rem 1.25rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.03);
      transition: border-color 0.15s;
    }
    .avis-card.no-llegit {
      border-left: 4px solid #0284c7;
      background: #f8fafc;
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
      background: #0284c7;
      border-radius: 50%;
      display: inline-block;
    }
    .avis-body {
      flex: 1;
    }
    .avis-meta {
      display: flex;
      gap: 0.75rem;
      align-items: center;
      margin-bottom: 0.35rem;
    }
    .badge-status {
      font-size: 0.75rem;
      padding: 0.15rem 0.5rem;
      border-radius: 4px;
      font-weight: 600;
    }
    .badge-pendent {
      background: #e0f2fe;
      color: #0369a1;
    }
    .badge-llegit {
      background: #f1f5f9;
      color: #64748b;
    }
    .avis-date {
      font-size: 0.8rem;
      color: #94a3b8;
    }
    .avis-text {
      margin: 0;
      color: #1e293b;
      font-size: 0.95rem;
      line-height: 1.4;
    }
    .avis-actions {
      display: flex;
      gap: 0.5rem;
    }
    .btn-icon {
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      padding: 0.35rem 0.65rem;
      border-radius: 6px;
      font-size: 0.8rem;
      cursor: pointer;
      color: #334155;
    }
    .btn-icon:hover {
      background: #e2e8f0;
    }
    .btn-icon.danger {
      color: #ef4444;
      border-color: #fca5a5;
    }
    .btn-icon.danger:hover {
      background: #fee2e2;
    }
    .btn-action-alt {
      background: #ffffff;
      border: 1px solid #cbd5e1;
      padding: 0.45rem 0.9rem;
      border-radius: 6px;
      font-size: 0.85rem;
      cursor: pointer;
      font-weight: 500;
      color: #334155;
    }
    .btn-action-alt:hover:not(:disabled) {
      background: #f8fafc;
    }
    .btn-action-alt:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    .btn-primary {
      display: inline-block;
      background: #0284c7;
      color: #fff;
      padding: 0.5rem 1.25rem;
      border-radius: 6px;
      text-decoration: none;
      font-size: 0.9rem;
      margin-top: 1rem;
    }
    .empty-state {
      text-align: center;
      padding: 3rem 1rem;
      background: #fff;
      border-radius: 10px;
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
