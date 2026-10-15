import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TascaService } from '../../../services/tasca.service';
import { IncidenciaService } from '../../../services/incidencia.service';
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

        <!-- Botó per al client quan la tasca ja està finalitzada però encara no té valoració -->
        <div *ngIf="isClientOwner && tasca.estat === 'Finalitzada' && !tasca.valoracio" class="evaluate-box">
          <div class="evaluate-box-content">
            <span class="evaluate-icon">★</span>
            <div>
              <h3>Tasca finalitzada! Com ha anat el servei?</h3>
              <p>Valora la feina de <strong>{{ assignedProfessional }}</strong> per publicar la teva ressenya i ajudar altres usuaris.</p>
            </div>
          </div>
          <button type="button" class="btn btn-evaluate" (click)="onCompleteTask()">
            ★ Avaluar Professional
          </button>
        </div>

        <!-- Mostra la valoració registrada a la tasca finalitzada -->
        <div *ngIf="tasca.estat === 'Finalitzada' && tasca.valoracio" class="review-display-card">
          <div class="review-display-header">
            <span class="review-display-badge">VALORACIÓ DEL CLIENT</span>
            <div class="stars-display">
              <span *ngFor="let s of [1, 2, 3, 4, 5]" class="star-glyph" [class.filled]="s <= (tasca.valoracio || 0)">★</span>
              <span class="score-text">{{ tasca.valoracio }}/5</span>
            </div>
          </div>
          <p class="review-display-opinion" *ngIf="tasca.opinio">"{{ tasca.opinio }}"</p>
          <div *ngIf="isClientOwner" class="review-edit-row">
            <button type="button" class="btn-sm btn-edit-review" (click)="onCompleteTask()">
              <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: -2px; margin-right: 4px;">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
              Modificar valoració
            </button>
          </div>
        </div>

        <!-- Botó per al professional assignat per donar per acabada la tasca -->
        <div *ngIf="isAssignedProfessional && !isClientOwner && tasca.estat === 'En curs'" class="complete-box pro-complete-box">
          <p>Has acabat la feina o servei per a aquest client?</p>
          <button type="button" class="btn btn-complete-pro" (click)="onCompleteTaskByPro()">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: -2px; margin-right: 6px;">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            Donar tasca per Finalitzada
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
            </div>

            <p class="offer-note">{{ offer.note }}</p>

            <div class="offer-footer">
              <span class="price-tag">Pressupost: <strong>{{ offer.price }}</strong></span>

              <!-- Accions sobre l'oferta: les ofertes no tenen estat, sols s'accepten o es borren -->
              <div class="offer-actions" *ngIf="tasca.estat !== 'Finalitzada'">
                <button
                  *ngIf="isClientOwner"
                  type="button"
                  class="btn btn-accept"
                  (click)="onAcceptOffer(offer.id)"
                >
                  Acceptar oferta
                </button>
                <button
                  *ngIf="isClientOwner || isOfferOwner(offer)"
                  type="button"
                  class="btn btn-reject"
                  (click)="onDeleteOffer(offer.id)"
                  title="Borrar aquesta oferta"
                >
                  Borrar oferta
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
              <h2>{{ tasca.estat === 'Finalitzada' ? (tasca.valoracio ? 'Modificar valoració del professional' : 'Avaluar servei professional') : 'Finalitzar tasca i avaluar professional' }}</h2>
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
                {{ enviantRessenya ? 'Enviant valoració...' : (tasca.estat === 'Finalitzada' ? '★ Guardar Valoració' : '★ Enviar Valoració i Finalitzar Tasca') }}
              </button>
              <button
                *ngIf="tasca.estat !== 'Finalitzada'"
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

      .evaluate-box {
        margin-top: 1.5rem;
        padding: 1.25rem 1.4rem;
        background: #fffbeb;
        border: 1.5px solid #fde68a;
        border-radius: 14px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 1.25rem;
        flex-wrap: wrap;
      }

      .evaluate-box-content {
        display: flex;
        align-items: center;
        gap: 1rem;
      }

      .evaluate-icon {
        font-size: 2rem;
        color: #f59e0b;
        background: #fef3c7;
        width: 48px;
        height: 48px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }

      .evaluate-box-content h3 {
        margin: 0 0 0.25rem 0;
        font-size: 1.05rem;
        font-weight: 800;
        color: #92400e;
      }

      .evaluate-box-content p {
        margin: 0;
        font-size: 0.88rem;
        color: #78350f;
        font-weight: 500;
      }

      .btn-evaluate {
        background: #f59e0b;
        color: #ffffff;
        font-weight: 900;
        padding: 0.75rem 1.4rem;
        border-radius: 10px;
        border: none;
        cursor: pointer;
        font-size: 0.92rem;
        box-shadow: 0 4px 14px rgba(245, 158, 11, 0.35);
        transition: all 0.2s ease;
        white-space: nowrap;
      }

      .btn-evaluate:hover {
        background: #d97706;
        box-shadow: 0 6px 18px rgba(245, 158, 11, 0.45);
        transform: translateY(-1px);
      }

      .review-display-card {
        margin-top: 1.5rem;
        padding: 1.25rem 1.4rem;
        background: #faf8f4;
        border: 1.5px solid #e5e0d7;
        border-radius: 14px;
        display: flex;
        flex-direction: column;
        gap: 0.65rem;
      }

      .review-display-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 0.5rem;
      }

      .review-display-badge {
        font-size: 0.72rem;
        font-weight: 900;
        letter-spacing: 0.08em;
        padding: 0.25rem 0.6rem;
        border-radius: 6px;
        background: rgba(245, 158, 11, 0.15);
        color: #b45309;
        border: 1px solid rgba(245, 158, 11, 0.3);
      }

      .stars-display {
        display: flex;
        align-items: center;
        gap: 0.2rem;
      }

      .star-glyph {
        color: #dcd7cc;
        font-size: 1.25rem;
      }

      .star-glyph.filled {
        color: #f59e0b;
        text-shadow: 0 0 6px rgba(245, 158, 11, 0.35);
      }

      .score-text {
        font-size: 0.95rem;
        font-weight: 900;
        color: #09090c;
        margin-left: 0.4rem;
      }

      .review-display-opinion {
        margin: 0;
        font-style: italic;
        color: #4a4841;
        font-size: 0.95rem;
        line-height: 1.5;
        background: #ffffff;
        padding: 0.75rem 1rem;
        border-radius: 8px;
        border: 1px solid #ede8de;
      }

      .review-edit-row {
        display: flex;
        justify-content: flex-end;
      }

      .btn-edit-review {
        background: #ffffff;
        border: 1px solid #d6d0c4;
        border-radius: 6px;
        color: #09090c;
        font-size: 0.82rem;
        font-weight: 800;
        padding: 0.4rem 0.85rem;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .btn-edit-review:hover {
        border-color: #f59e0b;
        color: #b45309;
        background: #fefce8;
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

      .btn-complete-pro {
        background: #10b981;
        color: #ffffff;
        font-weight: 900;
        padding: 0.75rem 1.4rem;
        border-radius: 9px;
        border: none;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        transition: all 0.2s ease;
        box-shadow: 0 4px 14px rgba(16, 185, 129, 0.35);
      }

      .btn-complete-pro:hover {
        background: #059669;
        transform: translateY(-2px);
        box-shadow: 0 6px 18px rgba(16, 185, 129, 0.45);
      }

      .pro-complete-box {
        border-color: rgba(16, 185, 129, 0.4) !important;
        background: rgba(16, 185, 129, 0.05) !important;
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

      @media (max-width: 768px) {
        .detall-container {
          padding: 1rem 0.5rem;
        }
        h1 {
          font-size: 1.45rem;
        }
        .card {
          padding: 1.25rem 1rem;
          border-radius: 14px;
        }
        .meta-row {
          flex-direction: column;
          gap: 0.45rem;
        }
        .evaluate-box {
          flex-direction: column;
          align-items: stretch;
          text-align: center;
          gap: 1rem;
        }
        .evaluate-box-content {
          flex-direction: column;
          text-align: center;
        }
        .btn-evaluate {
          width: 100%;
        }
        .offer-footer {
          flex-direction: column;
          align-items: flex-start;
          gap: 0.75rem;
        }
        .offer-actions {
          width: 100%;
          display: flex;
        }
        .offer-actions .btn {
          flex: 1;
          text-align: center;
        }
        .modal-dialog {
          width: 100%;
          max-height: 95vh;
          border-radius: 14px;
        }
        .modal-header {
          padding: 1.1rem 1.25rem;
          border-radius: 14px 14px 0 0;
        }
        .modal-body {
          padding: 1.25rem;
          gap: 1.1rem;
        }
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
    private readonly incidenciaService: IncidenciaService,
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
        // Fallback a consultar com a incidència directa
        this.incidenciaService.getById(id).subscribe({
          next: (inc) => {
            this.tasca = {
              id: inc.id,
              titol: inc.titol,
              descripcio: inc.descripcio,
              categoria: inc.categoria,
              clientId: inc.clientId,
              client: inc.clientNom || inc.client || 'Client',
              clientNom: inc.clientNom || inc.client || 'Client',
              professional: undefined,
              professionalNom: undefined,
              budget: inc.budget,
              estat: inc.estat || '',
              tipus: 'incidencia',
              createdAt: inc.createdAt
            };
            this.loading = false;
            this.loadOffers(id);
          },
          error: () => {
            this.loading = false;
            this.tasca = null;
          }
        });
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
   * Comprova si l'usuari connectat és el professional assignat a aquesta tasca.
   */
  get isAssignedProfessional(): boolean {
    const user = this.authService.getCurrentUser();
    if (!user || !this.tasca) return false;
    if (user.rol === 'admin') return true;
    const proNom = (this.tasca.professionalNom || this.tasca.professional || '').toLowerCase().trim();
    const proId = (this.tasca.professionalId || '').toLowerCase().trim();
    const curNom = (user.nom || '').toLowerCase().trim();
    const curId = (user.id || '').toLowerCase().trim();
    return (!!proNom && (proNom === curNom || proNom === curId)) ||
           (!!proId && (proId === curId || proId === curNom));
  }

  /**
   * Comprova si l'usuari connectat és l'autor d'una oferta concreta.
   */
  isOfferOwner(offer: Oferta): boolean {
    const user = this.authService.getCurrentUser();
    if (!user) return false;
    if (user.rol === 'admin') return true;
    const pro = (offer.professional || '').toLowerCase().trim();
    const curNom = (user.nom || '').toLowerCase().trim();
    const curId = (user.id || '').toLowerCase().trim();
    return pro === curNom || pro === curId;
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
   * Borra una oferta: les ofertes sols s'accepten o es borren.
   */
  onDeleteOffer(offerId: string): void {
    if (!confirm('Vols borrar aquesta oferta? Aquesta acció no es pot desfer.')) return;
    this.ofertaService.delete(offerId).subscribe({
      next: () => {
        this.noticeMessage = 'L’oferta s’ha esborrat correctament.';
        this.ofertes = this.ofertes.filter(o => o.id !== offerId);
        if (this.tasca) {
          this.loadOffers(this.tasca.id);
        }
      },
      error: () => {
        this.noticeMessage = 'No s’ha pogut borrar l’oferta.';
      }
    });
  }

  /**
   * Àlies per compatibilitat: rebutjar esdevé borrar.
   */
  onRejectOffer(offerId: string): void {
    this.onDeleteOffer(offerId);
  }

  /**
   * El professional assignat finalitza la tasca un cop completada la feina.
   */
  onCompleteTaskByPro(): void {
    if (!this.tasca) return;
    const confirmacio = confirm(
      `Vols confirmar la conclusió de la tasca "${this.tasca.titol}"?\n\n` +
      `Aquesta acció marcarà el treball com a finalitzat i notificarà al client per a la seva valoració.`
    );
    if (!confirmacio) return;

    this.tascaService.complete(this.tasca.id).subscribe({
      next: (updated) => {
        this.tasca = updated;
        this.noticeMessage = 'Enhorabona! Has donat per finalitzada la tasca. S’ha notificat al client per a la seva valoració!';
      },
      error: () => {
        this.noticeMessage = 'Error en finalitzar la tasca. Si us plau, torna-ho a provar.';
      }
    });
  }

  /**
   * Obre el modal per avaluar la tasca (encara que ja estiga finalitzada).
   */
  onCompleteTask(): void {
    if (!this.tasca) return;
    this.puntuacioSeleccionada = this.tasca.valoracio || 5;
    this.ressenyaDescripcio = this.tasca.opinio || '';
    this.modalFinalitzarObert = true;
  }

  /**
   * Confirma l'avaluació i envia la ressenya (desant-la directament a la taula tasques).
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
        this.noticeMessage = t.estat === 'Finalitzada'
          ? 'La teva valoració s\'ha desat i publicat correctament!'
          : 'Felicitats! La tasca ha estat marcada com a Finalitzada i la valoració s\'ha publicat.';
      },
      error: () => {
        this.enviantRessenya = false;
        this.noticeMessage = 'Error en registrar la valoració.';
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

