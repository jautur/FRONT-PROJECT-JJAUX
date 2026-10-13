import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TascaService } from '../../../services/tasca.service';
import { OfertaService } from '../../../services/oferta.service';
import { AuthService } from '../../../core/services/auth.service';
import { Tasca } from '../../../models/tasca.model';
import { Oferta } from '../../../models/oferta.model';

/**
 * Component de Detall de Tasca i Gestió d'Ofertes (/tasca-detall/:id).
 * Permet visualitzar la informació d'una tasca concreta i totes les ofertes
 * presentades pels professionals.
 * Si l'usuari és el client propietari, pot acceptar o rebutjar propostes,
 * o marcar el projecte com a finalitzat.
 */
@Component({
  selector: 'app-tasca-detall',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section class="detall-container" *ngIf="tasca">
      <!-- Capçalera de la tasca -->
      <header class="detall-header">
        <div class="top-row">
          <span class="category-tag">{{ tasca.categoria }}</span>
          <span class="status-badge" [ngClass]="getStatusClass(tasca.estat)">
            {{ tasca.estat }}
          </span>
        </div>
        <h1>{{ tasca.titol }}</h1>
        <div class="meta-row">
          <span>Client: <strong>{{ tasca.client }}</strong></span>
          <span>Pressupost estimat: <strong>{{ tasca.budget }}</strong></span>
          <span>Identificador: <code>{{ tasca.id }}</code></span>
        </div>
      </header>

      <!-- Descripció de la tasca -->
      <article class="card desc-card">
        <h2>Descripció del treball</h2>
        <p class="description-text">{{ tasca.descripcio }}</p>

        <!-- Botó per al client per tancar la tasca quan està en curs -->
        <div *ngIf="isClientOwner && tasca.estat === 'En curs'" class="complete-box">
          <p>La feina ja s'ha lliurat i està acabada?</p>
          <button type="button" class="btn btn-complete" (click)="onCompleteTask()">
            Marcar tasca com a Finalitzada
          </button>
        </div>

        <!-- Botó per a professionals si la tasca està oberta -->
        <div *ngIf="isProfessional && tasca.estat === 'Oberta'" class="action-box">
          <a [routerLink]="['/professional/crear-oferta']" [queryParams]="{ taskId: tasca.id }" class="btn btn-primary">
            Presentar oferta per a aquesta tasca
          </a>
        </div>
      </article>

      <!-- Notificacions / Alertes -->
      <div *ngIf="noticeMessage" class="alert alert-info">
        {{ noticeMessage }}
      </div>

      <!-- Llistat d'ofertes rebudes -->
      <section class="offers-section">
        <div class="section-header">
          <h2>Ofertes i pressupostos rebuts ({{ ofertes.length }})</h2>
        </div>

        <div *ngIf="ofertes.length === 0" class="empty-state">
          <p>Encara no s'ha rebut cap oferta per a aquesta tasca.</p>
        </div>

        <div class="offers-grid" *ngIf="ofertes.length > 0">
          <article class="card offer-card" *ngFor="let offer of ofertes">
            <div class="offer-header">
              <h3>{{ offer.professional }}</h3>
              <span class="status-badge" [ngClass]="getStatusClass(offer.estat)">
                {{ offer.estat }}
              </span>
            </div>

            <p class="offer-note">{{ offer.note }}</p>

            <div class="offer-footer">
              <span class="price-tag">Pressupost: <strong>{{ offer.price }}</strong></span>

              <!-- Accions disponibles per al Client propietari de la tasca -->
              <div class="offer-actions" *ngIf="isClientOwner && offer.estat === 'Pendent'">
                <button type="button" class="btn btn-accept" (click)="onAcceptOffer(offer.id)">
                  Acceptar
                </button>
                <button type="button" class="btn btn-reject" (click)="onRejectOffer(offer.id)">
                  Rebutjar
                </button>
              </div>
            </div>
          </article>
        </div>
      </section>
    </section>

    <!-- Estat de càrrega o no trobat -->
    <div *ngIf="!tasca && !loading" class="not-found card">
      <h2>Tasca no trobada</h2>
      <p>No s'ha pogut localitzar la tasca sol·licitada.</p>
      <a routerLink="/" class="btn btn-primary">Tornar a l'inici</a>
    </div>
  `,
  styles: [
    `
      .detall-container {
        width: min(900px, 100%);
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .detall-header {
        background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
        color: white;
        padding: 2.2rem;
        border-radius: 20px;
        box-shadow: 0 15px 30px rgba(15, 23, 42, 0.15);
      }

      .top-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.75rem;
      }

      .category-tag {
        background: rgba(56, 189, 248, 0.2);
        color: #7dd3fc;
        padding: 0.3rem 0.8rem;
        border-radius: 8px;
        font-weight: 700;
        font-size: 0.8rem;
      }

      h1 {
        margin: 0 0 1rem;
        font-size: 1.9rem;
      }

      .meta-row {
        display: flex;
        gap: 1.5rem;
        flex-wrap: wrap;
        font-size: 0.95rem;
        color: #cbd5e1;
      }

      .meta-row strong {
        color: white;
      }

      .meta-row code {
        background: rgba(255, 255, 255, 0.15);
        padding: 0.15rem 0.4rem;
        border-radius: 6px;
      }

      .card {
        background: white;
        padding: 1.8rem;
        border-radius: 18px;
        border: 1px solid #e2e8f0;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
      }

      .card h2 {
        margin: 0 0 0.8rem;
        font-size: 1.3rem;
        color: #0f172a;
      }

      .description-text {
        color: #334155;
        line-height: 1.6;
        font-size: 1rem;
        margin: 0;
      }

      .action-box, .complete-box {
        margin-top: 1.25rem;
        padding-top: 1.25rem;
        border-top: 1px solid #e2e8f0;
      }

      .complete-box p {
        margin: 0 0 0.5rem;
        font-weight: 600;
        color: #0f172a;
      }

      .offers-section {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .offers-grid {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .offer-card {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }

      .offer-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .offer-header h3 {
        margin: 0;
        font-size: 1.15rem;
        color: #1e293b;
      }

      .offer-note {
        margin: 0;
        color: #475569;
        line-height: 1.5;
        font-size: 0.95rem;
      }

      .offer-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 0.5rem;
        padding-top: 0.75rem;
        border-top: 1px solid #f1f5f9;
      }

      .price-tag {
        font-size: 1.05rem;
        color: #0f172a;
      }

      .price-tag strong {
        color: #16a34a;
        font-size: 1.2rem;
      }

      .offer-actions {
        display: flex;
        gap: 0.5rem;
      }

      .btn {
        padding: 0.6rem 1.1rem;
        border-radius: 9px;
        font-weight: 700;
        font-size: 0.88rem;
        border: none;
        cursor: pointer;
        text-decoration: none;
        transition: opacity 0.15s ease;
      }

      .btn-primary {
        background: #2563eb;
        color: white;
        display: inline-block;
      }

      .btn-accept {
        background: #16a34a;
        color: white;
      }

      .btn-reject {
        background: #dc2626;
        color: white;
      }

      .btn-complete {
        background: #0284c7;
        color: white;
      }

      .status-badge {
        padding: 0.25rem 0.65rem;
        border-radius: 999px;
        font-size: 0.75rem;
        font-weight: 700;
      }

      .status-oberta {
        background: #dbeafe;
        color: #1e40af;
      }

      .status-en-curs {
        background: #fef3c7;
        color: #92400e;
      }

      .status-finalitzada {
        background: #dcfce7;
        color: #166534;
      }

      .status-pendent {
        background: #fef3c7;
        color: #92400e;
      }

      .status-acceptada {
        background: #dcfce7;
        color: #166534;
      }

      .status-rebutjada {
        background: #fee2e2;
        color: #991b1b;
      }

      .alert-info {
        background: #e0f2fe;
        color: #0369a1;
        padding: 0.9rem 1.25rem;
        border-radius: 12px;
        font-weight: 500;
      }

      .empty-state {
        background: white;
        padding: 2rem;
        border-radius: 16px;
        border: 1px dashed #cbd5e1;
        text-align: center;
        color: #64748b;
      }

      .not-found {
        text-align: center;
        padding: 3rem;
      }
    `
  ]
})
export class TascaDetallComponent implements OnInit {
  /** Tasca seleccionada */
  tasca: Tasca | null = null;

  /** Ofertes rebudes per a la tasca */
  ofertes: Oferta[] = [];

  /** Estat de càrrega */
  loading = true;

  /** Missatge informatiu d'accions realitzades */
  noticeMessage = '';

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly tascaService: TascaService,
    private readonly ofertaService: OfertaService,
    private readonly authService: AuthService
  ) {}

  /**
   * Inicialització: obté el paràmetre :id de la ruta i carrega la tasca i ofertes.
   */
  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.loadTask(id);
      } else {
        this.loading = false;
      }
    });
  }

  /**
   * Carrega la informació de la tasca i les seves ofertes des de PostgreSQL.
   */
  private loadTask(id: string): void {
    this.tascaService.getById(id).subscribe({
      next: (task) => {
        this.tasca = task;
        this.loading = false;
        this.loadOffers(id);
      },
      error: () => {
        this.loading = false;
        this.tasca = null;
      }
    });
  }

  /**
   * Carrega les ofertes associades a aquesta tasca.
   */
  private loadOffers(taskId: string): void {
    this.ofertaService.getByTasca(taskId).subscribe({
      next: (offers) => {
        this.ofertes = offers;
      }
    });
  }

  /**
   * Comprova si l'usuari connectat és el client propietari de la tasca.
   */
  get isClientOwner(): boolean {
    const user = this.authService.getCurrentUser();
    if (!user || !this.tasca) return false;
    return user.rol === 'admin' || (user.rol === 'client' && user.nom === this.tasca.client);
  }

  /**
   * Comprova si l'usuari connectat té rol de Professional.
   */
  get isProfessional(): boolean {
    return this.authService.hasRole('professional') || this.authService.hasRole('admin');
  }

  /**
   * Accepta una oferta seleccionada.
   */
  onAcceptOffer(offerId: string): void {
    this.ofertaService.accept(offerId).subscribe({
      next: () => {
        this.noticeMessage = 'Oferta acceptada amb èxit! La tasca ha passat a estat "En curs".';
        if (this.tasca) {
          this.loadTask(this.tasca.id);
        }
      }
    });
  }

  /**
   * Rebutja una oferta.
   */
  onRejectOffer(offerId: string): void {
    this.ofertaService.reject(offerId).subscribe({
      next: () => {
        this.noticeMessage = 'L’oferta ha estat rebutjada.';
        if (this.tasca) {
          this.loadOffers(this.tasca.id);
        }
      }
    });
  }

  /**
   * Marca la tasca com a finalitzada.
   */
  onCompleteTask(): void {
    if (!this.tasca) return;
    this.tascaService.complete(this.tasca.id).subscribe({
      next: (updated) => {
        this.tasca = updated;
        this.noticeMessage = 'Felicitats! La tasca ha estat marcada com a Finalitzada.';
      }
    });
  }

  /**
   * Genera la classe CSS per al color de l'estat.
   */
  getStatusClass(status: string): string {
    return 'status-' + status.toLowerCase().replace(/\s+/g, '-');
  }
}

