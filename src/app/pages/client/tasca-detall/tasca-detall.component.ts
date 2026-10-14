import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TascaService } from '../../../services/tasca.service';
import { OfertaService } from '../../../services/oferta.service';
import { ResenyaService } from '../../../services/resenya.service';
import { AuthService } from '../../../core/services/auth.service';
import { Tasca } from '../../../models/tasca.model';
import { Oferta } from '../../../models/oferta.model';

/**
 * Component de Detall de Tasca i Gestió d'Ofertes (/tasca-detall/:id).
 * Permet visualitzar la informació d'una tasca concreta i totes les ofertes
 * presentades pels professionals.
 * Si l'usuari és el client propietari, pot acceptar o rebutjar propostes,
 * o marcar el projecte com a finalitzat amb valoració.
 */
@Component({
  selector: 'app-tasca-detall',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <section class="detall-container" *ngIf="tasca">
      <!-- Capçalera de la tasca o incidència -->
      <header class="detall-header" [class.converged-header]="isTascaConvergida">
        <div class="top-row">
          <div class="header-tags-group">
            <span class="nature-tag" [ngClass]="isTascaConvergida ? 'is-tasca' : 'is-incidencia'">
              {{ isTascaConvergida ? 'TASCA CONVERGIDA' : 'INCIDÈNCIA OBERTA' }}
            </span>
            <span class="category-tag">{{ tasca.categoria }}</span>
          </div>
          <span class="status-badge" [ngClass]="getStatusClass(tasca.estat)">
            {{ tasca.estat }}
          </span>
        </div>
        <h1>{{ tasca.titol }}</h1>
        <div class="meta-row">
          <span>Client: <strong><a [routerLink]="['/perfil', tasca.client]" class="user-profile-link" title="Veure perfil de {{ tasca.client }}">{{ tasca.client }}</a></strong></span>
          <span *ngIf="isTascaConvergida">
            Professional assignat: <strong><a [routerLink]="['/perfil', assignedProfessional]" class="user-profile-link pro-link" title="Veure perfil de {{ assignedProfessional }}">{{ assignedProfessional }}</a></strong>
          </span>
          <span *ngIf="!isTascaConvergida">
            Professional: <em>Sense assignar (cercant pressupostos)</em>
          </span>
          <span>{{ isTascaConvergida ? 'Preu acordat:' : 'Pressupost orientatiu:' }} <strong>{{ tasca.budget }}</strong></span>
          <span>Identificador: <code>{{ tasca.id }}</code></span>
        </div>
      </header>

      <!-- Descripció de la tasca -->
      <article class="card desc-card">
        <h2>Descripció del treball</h2>
        <p class="description-text">{{ tasca.descripcio }}</p>

        <!-- Banner informatiu quan és una TASCA oficial en curs -->
        <div *ngIf="isTascaConvergida" class="converged-info-banner">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
          <div>
            <strong>Tasca acordada:</strong>
            <span> Client <strong>{{ tasca.client }}</strong> i Professional <strong>{{ assignedProfessional }}</strong> ja treballen plegats ({{ tasca.budget }}).</span>
          </div>
        </div>

        <!-- Botó per al client per tancar la tasca quan està en curs -->
        <div *ngIf="isClientOwner && tasca.estat === 'En curs'" class="complete-box">
          <p>La feina ja s'ha lliurat i està acabada?</p>
          <button type="button" class="btn btn-complete" (click)="onCompleteTask()">
            Marcar tasca com a Finalitzada i Avaluar
          </button>
        </div>

        <!-- Botó per a professionals si la incidència està oberta i sense professional -->
        <div *ngIf="isProfessional && !isTascaConvergida && tasca.estat === 'Oberta'" class="action-box">
          <a [routerLink]="['/professional/crear-oferta']" [queryParams]="{ taskId: tasca.id }" class="btn btn-primary">
            Presentar oferta per a aquesta incidència
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

      <!-- MODAL D'AVALUACIÓ I FINALITZACIÓ -->
      <div class="modal-backdrop" *ngIf="modalFinalitzarObert" (click)="tancarModalFinalitzar()">
        <div class="modal-dialog" (click)="$event.stopPropagation()">
          <header class="modal-header">
            <div>
              <span class="modal-badge-tag">AVALUACIÓ DE SERVEI</span>
              <h2>Finalitzar tasca i avaluar professional</h2>
            </div>
            <button type="button" class="btn-close-modal" (click)="tancarModalFinalitzar()" aria-label="Tancar">✕</button>
          </header>

          <div class="modal-body" *ngIf="tasca">
            <div class="modal-task-summary">
              <span class="category-tag">{{ tasca.categoria }}</span>
              <h3>{{ tasca.titol }}</h3>
              <p class="summary-pro">
                Professional assignat: <strong>{{ assignedProfessional }}</strong>
              </p>
            </div>

            <div class="rating-input-group">
              <label class="rating-title">Puntuació general del servei (1 a 5 estrelles):</label>
              <div class="stars-picker">
                <button
                  type="button"
                  *ngFor="let star of [1, 2, 3, 4, 5]"
                  class="star-btn"
                  [class.active]="star <= puntuacioSeleccionada"
                  (click)="puntuacioSeleccionada = star"
                  title="{{ star }} estrelles"
                >
                  ★
                </button>
                <span class="star-rating-text">{{ getRatingLabel(puntuacioSeleccionada) }}</span>
              </div>
            </div>

            <div class="comment-input-group">
              <label for="ressenya-text-detall">Escriu la teva valoració sobre la feina:</label>
              <textarea
                id="ressenya-text-detall"
                [(ngModel)]="ressenyaDescripcio"
                rows="4"
                placeholder="Explica la teva valoració sobre la qualitat, puntualitat i acabats..."
              ></textarea>
            </div>

            <div class="modal-actions-col">
              <button
                type="button"
                class="btn-submit-review"
                (click)="confirmarFinalitzacioAmbRessenya()"
                [disabled]="enviantRessenya"
              >
                {{ enviantRessenya ? 'Enviant valoració...' : '★ Enviar Valoració i Finalitzar Tasca' }}
              </button>
              <button
                type="button"
                class="btn-skip-review"
                (click)="finalitzarSenseRessenya()"
                [disabled]="enviantRessenya"
              >
                Finalitzar directament sense deixar valoració
              </button>
            </div>
          </div>
        </div>
      </div>
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

      .detall-header.converged-header {
        border-left: 5px solid #10b981;
      }

      .top-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.75rem;
      }

      .header-tags-group {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .nature-tag {
        border-radius: 6px;
        padding: 0.25rem 0.65rem;
        font-size: 0.72rem;
        font-weight: 900;
        letter-spacing: 0.06em;
        text-transform: uppercase;
      }

      .nature-tag.is-tasca {
        background: #ecfdf5;
        color: #065f46;
        border: 1px solid #a7f3d0;
      }

      .nature-tag.is-incidencia {
        background: #09090c;
        color: #ffffff;
        border: 1px solid #2b2a36;
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

      .pro-link {
        color: #059669 !important;
      }

      .converged-info-banner {
        display: flex;
        align-items: center;
        gap: 0.85rem;
        background: #ecfdf5;
        border: 1px solid #a7f3d0;
        border-radius: 10px;
        padding: 0.85rem 1.15rem;
        margin-top: 1.25rem;
        color: #065f46;
        font-size: 0.92rem;
      }

      .converged-info-banner svg {
        flex-shrink: 0;
        color: #10b981;
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

      /* Modal d'Avaluació */
      .modal-backdrop {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(9, 9, 12, 0.78);
        backdrop-filter: blur(4px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        padding: 1rem;
        box-sizing: border-box;
      }

      .modal-dialog {
        background: #ffffff;
        border-radius: 20px;
        width: min(560px, 100%);
        max-height: 90vh;
        overflow-y: auto;
        border: 1px solid #e5e0d7;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.35);
        display: flex;
        flex-direction: column;
      }

      .modal-header {
        padding: 1.5rem 1.8rem;
        border-bottom: 1px solid #e5e0d7;
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        background: #faf8f4;
        border-radius: 20px 20px 0 0;
      }

      .modal-badge-tag {
        font-size: 0.68rem;
        font-weight: 900;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        color: #ff1744;
        background: rgba(255, 23, 68, 0.08);
        border: 1px solid rgba(255, 23, 68, 0.25);
        padding: 0.2rem 0.55rem;
        border-radius: 5px;
        display: inline-block;
        margin-bottom: 0.4rem;
      }

      .modal-header h2 {
        margin: 0;
        font-size: 1.35rem;
        font-weight: 900;
        color: #09090c;
      }

      .btn-close-modal {
        background: #ece7dc;
        border: none;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        font-size: 1rem;
        font-weight: 900;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #09090c;
        transition: all 0.2s ease;
      }

      .btn-close-modal:hover {
        background: #ff1744;
        color: #ffffff;
      }

      .modal-body {
        padding: 1.8rem;
        display: flex;
        flex-direction: column;
        gap: 1.4rem;
      }

      .modal-task-summary {
        background: #f8f6f0;
        border: 1px solid #e5e0d7;
        padding: 1rem 1.25rem;
        border-radius: 12px;
      }

      .modal-task-summary h3 {
        margin: 0.4rem 0 0.25rem;
        font-size: 1.1rem;
        font-weight: 800;
        color: #09090c;
      }

      .summary-pro {
        margin: 0;
        font-size: 0.88rem;
        color: #55524b;
      }

      .summary-pro strong {
        color: #ff1744;
      }

      .rating-title,
      .comment-input-group label {
        display: block;
        font-size: 0.88rem;
        font-weight: 800;
        color: #09090c;
        margin-bottom: 0.5rem;
      }

      .stars-picker {
        display: flex;
        align-items: center;
        gap: 0.4rem;
      }

      .star-btn {
        background: transparent;
        border: none;
        font-size: 2.2rem;
        color: #dcd7cc;
        cursor: pointer;
        line-height: 1;
        padding: 0;
        transition: transform 0.15s ease, color 0.15s ease;
      }

      .star-btn:hover {
        transform: scale(1.15);
      }

      .star-btn.active {
        color: #f59e0b;
        text-shadow: 0 0 12px rgba(245, 158, 11, 0.4);
      }

      .star-rating-text {
        margin-left: 0.75rem;
        font-size: 0.88rem;
        font-weight: 800;
        color: #09090c;
      }

      .comment-input-group textarea {
        width: 100%;
        box-sizing: border-box;
        background: #ffffff;
        border: 1.5px solid #d6d0c4;
        border-radius: 10px;
        padding: 0.85rem 1rem;
        font-family: inherit;
        font-size: 0.92rem;
        color: #09090c;
        font-weight: 600;
        resize: vertical;
      }

      .comment-input-group textarea:focus {
        outline: none;
        border-color: #ff1744;
        box-shadow: 0 0 12px rgba(255, 23, 68, 0.2);
      }

      .modal-actions-col {
        display: flex;
        flex-direction: column;
        gap: 0.65rem;
        margin-top: 0.5rem;
      }

      .btn-submit-review {
        width: 100%;
        background: #ff1744;
        color: #ffffff;
        border: none;
        padding: 0.85rem 1.4rem;
        border-radius: 10px;
        font-weight: 900;
        font-size: 0.95rem;
        cursor: pointer;
        box-shadow: 0 4px 14px rgba(255, 23, 68, 0.35);
        transition: all 0.2s ease;
      }

      .btn-submit-review:hover:not(:disabled) {
        background: #09090c;
        box-shadow: 0 6px 18px rgba(0, 0, 0, 0.3);
      }

      .btn-skip-review {
        background: transparent;
        border: none;
        color: #737066;
        font-size: 0.82rem;
        font-weight: 700;
        cursor: pointer;
        text-decoration: underline;
        padding: 0.4rem;
      }

      .btn-skip-review:hover:not(:disabled) {
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

  /** Missatge informatiu / avís */
  noticeMessage = '';

  /** Estat del modal de finalització i avaluació */
  modalFinalitzarObert = false;
  puntuacioSeleccionada = 5;
  ressenyaDescripcio = '';
  enviantRessenya = false;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly tascaService: TascaService,
    private readonly ofertaService: OfertaService,
    private readonly resenyaService: ResenyaService,
    private readonly authService: AuthService
  ) {}

  get assignedProfessional(): string {
    if (this.tasca?.professionalNom || this.tasca?.professional) {
      return (this.tasca.professionalNom || this.tasca.professional)!;
    }
    const acc = this.ofertes.find(o => o.estat === 'Acceptada') || this.ofertes[0];
    return acc ? acc.professional : 'Professional AVISA';
  }

  get isTascaConvergida(): boolean {
    return this.tasca?.tipus === 'tasca' || !!(this.tasca?.professional || this.tasca?.professionalNom) || (this.tasca?.estat !== 'Oberta');
  }

  tancarModalFinalitzar(): void {
    this.modalFinalitzarObert = false;
    this.enviantRessenya = false;
  }

  getRatingLabel(p: number): string {
    switch (p) {
      case 1: return '1.0 — Molt deficient';
      case 2: return '2.0 — Regular';
      case 3: return '3.0 — Correcte';
      case 4: return '4.0 — Molt bo';
      case 5: return '5.0 — Excel·lent!';
      default: return `${p}.0`;
    }
  }

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
   * Obre el modal per avaluar i finalitzar la tasca.
   */
  onCompleteTask(): void {
    if (!this.tasca) return;
    this.puntuacioSeleccionada = 5;
    this.ressenyaDescripcio = '';
    this.modalFinalitzarObert = true;
  }

  /**
   * Confirma la finalització i envia la ressenya (desant-la directament a la taula tasques).
   */
  confirmarFinalitzacioAmbRessenya(): void {
    if (!this.tasca) return;
    const t = this.tasca;
    this.enviantRessenya = true;
    const textDesc = this.ressenyaDescripcio.trim() || 'Feina completada amb èxit i total satisfacció.';

    this.tascaService.complete(t.id, {
      valoracio: this.puntuacioSeleccionada,
      opinio: textDesc
    }).subscribe({
      next: (updated) => {
        this.tasca = updated;
        this.enviantRessenya = false;
        this.tancarModalFinalitzar();
        this.noticeMessage = 'Felicitats! La tasca ha estat marcada com a Finalitzada i la valoració s\'ha publicat.';
      },
      error: () => {
        this.enviantRessenya = false;
        this.noticeMessage = 'Error en finalitzar la tasca.';
      }
    });
  }

  /**
   * Finalitza la tasca sense emetre cap valoració.
   */
  finalitzarSenseRessenya(): void {
    if (!this.tasca) return;
    this.enviantRessenya = true;
    this.tascaService.complete(this.tasca.id).subscribe({
      next: (updated) => {
        this.tasca = updated;
        this.enviantRessenya = false;
        this.tancarModalFinalitzar();
        this.noticeMessage = 'Felicitats! La tasca ha estat marcada com a Finalitzada.';
      },
      error: () => {
        this.enviantRessenya = false;
        this.noticeMessage = 'Error en finalitzar la tasca.';
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

