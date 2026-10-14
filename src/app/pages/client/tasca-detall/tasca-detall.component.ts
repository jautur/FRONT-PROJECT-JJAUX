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
          <span>Client: <strong><a [routerLink]="['/perfil', tasca.client]" class="user-profile-link" title="Veure perfil de {{ tasca.client }}">{{ tasca.client }}</a></strong></span>
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
              <h3>
                <a [routerLink]="['/perfil', offer.professional]" class="user-profile-link" title="Veure perfil de {{ offer.professional }}">
                  {{ offer.professional }}
                </a>
              </h3>
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
        margin: 0 auto;
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .detall-header {
        background: #ffffff;
        border: 1px solid #e5e0d7;
        color: #09090c;
        padding: 2.2rem;
        border-radius: 20px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
      }

      .top-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.75rem;
      }

      .category-tag {
        background: rgba(255, 23, 68, 0.08);
        color: #ff1744;
        border: 1px solid rgba(255, 23, 68, 0.25);
        padding: 0.3rem 0.8rem;
        border-radius: 8px;
        font-weight: 800;
        font-size: 0.8rem;
        letter-spacing: 0.05em;
      }

      h1 {
        margin: 0 0 1rem;
        font-size: 2rem;
        font-weight: 900;
        color: #09090c;
        letter-spacing: -0.02em;
      }

      .meta-row {
        display: flex;
        gap: 1.5rem;
        flex-wrap: wrap;
        font-size: 0.95rem;
        color: #636058;
        font-weight: 600;
      }

      .meta-row strong {
        color: #ff1744;
        font-weight: 900;
      }

      .user-profile-link {
        color: inherit;
        text-decoration: underline;
        text-decoration-color: rgba(255, 23, 68, 0.4);
        text-underline-offset: 3px;
        transition: color 0.15s ease, text-decoration-color 0.15s ease;
        cursor: pointer;
      }

      .user-profile-link:hover {
        color: #ff1744 !important;
        text-decoration-color: #ff1744;
      }

      .meta-row code {
        background: #f0ece3;
        border: 1px solid #dcd6cb;
        color: #09090c;
        padding: 0.2rem 0.5rem;
        border-radius: 6px;
        font-weight: 700;
      }

      .card {
        background: #ffffff;
        padding: 2rem;
        border-radius: 18px;
        border: 1px solid #e5e0d7;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
      }

      .card h2 {
        margin: 0 0 0.8rem;
        font-size: 1.35rem;
        font-weight: 900;
        color: #09090c;
      }

      .description-text {
        color: #4a4841;
        line-height: 1.6;
        font-size: 1rem;
        margin: 0;
        font-weight: 500;
      }

      .action-box, .complete-box {
        margin-top: 1.5rem;
        padding-top: 1.5rem;
        border-top: 1px solid #e5e0d7;
      }

      .complete-box p {
        margin: 0 0 0.75rem;
        font-weight: 800;
        color: #09090c;
      }

      .offers-section {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .section-header h2 {
        color: #09090c;
        font-size: 1.4rem;
        font-weight: 900;
        margin: 0;
      }

      .offers-grid {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .offer-card {
        display: flex;
        flex-direction: column;
        gap: 0.85rem;
        background: #ffffff;
        border: 1px solid #e5e0d7;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
        transition: border-color 0.2s;
      }

      .offer-card:hover {
        border-color: #d6d0c4;
      }

      .offer-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .offer-header h3 {
        margin: 0;
        font-size: 1.2rem;
        font-weight: 800;
        color: #09090c;
      }

      .offer-note {
        margin: 0;
        color: #57554e;
        line-height: 1.5;
        font-size: 0.95rem;
        font-weight: 500;
      }

      .offer-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 0.5rem;
        padding-top: 0.85rem;
        border-top: 1px solid #e5e0d7;
      }

      .price-tag {
        font-size: 0.95rem;
        color: #636058;
        font-weight: 700;
      }

      .price-tag strong {
        color: #ff1744;
        font-size: 1.25rem;
        font-weight: 900;
        margin-left: 0.25rem;
      }

      .offer-actions {
        display: flex;
        gap: 0.5rem;
      }

      .btn {
        padding: 0.65rem 1.25rem;
        border-radius: 9px;
        font-weight: 800;
        font-size: 0.88rem;
        border: none;
        cursor: pointer;
        text-decoration: none;
        transition: all 0.2s ease;
      }

      .btn-primary {
        background: #ff1744;
        color: #ffffff;
        font-weight: 900;
        display: inline-block;
        box-shadow: 0 4px 14px rgba(255, 23, 68, 0.35);
      }

      .btn-primary:hover {
        background: #09090c;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
      }

      .btn-accept {
        background: #ff1744;
        color: #ffffff;
        font-weight: 900;
      }

      .btn-accept:hover {
        background: #09090c;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
      }

      .btn-reject {
        background: rgba(239, 68, 68, 0.1);
        color: #dc2626;
        border: 1px solid rgba(239, 68, 68, 0.3);
      }

      .btn-reject:hover {
        background: #fee2e2;
      }

      .btn-complete {
        background: #ff1744;
        color: #ffffff;
        font-weight: 900;
      }

      .btn-complete:hover {
        background: #09090c;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
      }

      .status-badge {
        padding: 0.25rem 0.65rem;
        border-radius: 6px;
        font-size: 0.75rem;
        font-weight: 800;
      }

      .status-oberta {
        background: rgba(255, 23, 68, 0.08);
        color: #ff1744;
        border: 1px solid rgba(255, 23, 68, 0.25);
      }

      .status-en-curs {
        background: rgba(245, 158, 11, 0.12);
        color: #b45309;
        border: 1px solid rgba(245, 158, 11, 0.3);
      }

      .status-finalitzada {
        background: rgba(148, 163, 184, 0.15);
        color: #475569;
        border: 1px solid rgba(148, 163, 184, 0.3);
      }

      .status-pendent {
        background: rgba(245, 158, 11, 0.12);
        color: #b45309;
        border: 1px solid rgba(245, 158, 11, 0.3);
      }

      .status-acceptada {
        background: rgba(255, 23, 68, 0.08);
        color: #ff1744;
        border: 1px solid rgba(255, 23, 68, 0.25);
      }

      .status-rebutjada {
        background: rgba(239, 68, 68, 0.1);
        color: #dc2626;
        border: 1px solid rgba(239, 68, 68, 0.3);
      }

      .alert-info {
        background: rgba(255, 23, 68, 0.08);
        color: #ff1744;
        border: 1px solid rgba(255, 23, 68, 0.25);
        padding: 0.9rem 1.25rem;
        border-radius: 12px;
        font-weight: 700;
      }

      .empty-state {
        background: #ffffff;
        padding: 2.5rem;
        border-radius: 16px;
        border: 1px dashed #d6d0c4;
        text-align: center;
        color: #636058;
        font-weight: 600;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.02);
      }

      .not-found {
        text-align: center;
        padding: 3rem;
        color: #09090c;
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

