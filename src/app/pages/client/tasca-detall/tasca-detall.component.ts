import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TascaService } from '../../../services/tasca.service';
import { IncidenciaService } from '../../../services/incidencia.service';
import { PressupostService } from '../../../services/pressupost.service';
import { ResenyaService } from '../../../services/resenya.service';
import { AuthService } from '../../../core/services/auth.service';
import { ConfirmService } from '../../../core/services/confirm.service';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';
import { Tasca } from '../../../models/tasca.model';
import { Oferta } from '../../../models/oferta.model';
import { Pressupost } from '../../../models/pressupost.model';
import { ContacteTascaComponent } from '../../../shared/components/contacte-tasca/contacte-tasca.component';
import { CancellarTascaModalComponent } from '../../../shared/components/cancellar-tasca/cancellar-tasca-modal.component';

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
  imports: [CommonModule, FormsModule, RouterLink, TranslatePipe, ContacteTascaComponent, CancellarTascaModalComponent],
  template: `
    <section class="detall-container" *ngIf="tasca">
      <!-- Barra de navegació de retorn ràpid -->
      <div class="app-back-nav">
        <button type="button" class="btn-app-back" (click)="goBack()" [title]="'COMMON.TORNAR' | translate">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
          <span>{{ 'COMMON.TORNAR' | translate }}</span>
        </button>
      </div>

      <!-- Capçalera de la tasca o incidència -->
      <header class="detall-header" [class.converged-header]="isTascaConvergida">
        <div class="top-row">
          <div class="header-tags-group">
            <span class="nature-tag" [ngClass]="isTascaConvergida ? 'is-tasca' : 'is-incidencia'">
              {{ (isTascaConvergida ? 'TASCA_DETALL.TAG_CONVERGED' : 'TASCA_DETALL.TAG_OPEN') | translate }}
            </span>
            <span class="category-tag">{{ tasca.categoria | translate }}</span>
          </div>
          <span class="status-badge" [ngClass]="getStatusClass(tasca.estat)">
            {{ tasca.estat | translate }}
          </span>
        </div>
        <h1>{{ tasca.titol }}</h1>
        <div class="meta-row">
          <span>Client: <strong><a [routerLink]="[getNavUrl('/perfil'), tasca.clientId || tasca.client]" class="user-profile-link" title="Veure perfil">{{ tasca.client }}</a></strong></span>
          <span *ngIf="isTascaConvergida">
            {{ 'TASCA_DETALL.PRO_ASSIGNED_LABEL' | translate }} <strong><a [routerLink]="[getNavUrl('/perfil'), assignedProfessional]" class="user-profile-link pro-link" title="Veure perfil">{{ assignedProfessional }}</a></strong>
          </span>
          <span *ngIf="!isTascaConvergida">
            {{ 'TASCA_DETALL.PRO_ASSIGNED_LABEL' | translate }} <em>{{ 'TASCA_DETALL.PRO_UNASSIGNED' | translate }}</em>
          </span>
          <span>{{ (isTascaConvergida ? 'TASCA_DETALL.AGREED_PRICE' : 'TASCA_DETALL.ESTIMATED_BUDGET') | translate }} <strong>{{ tasca.budget }}</strong></span>
          <span>{{ 'TASCA_DETALL.IDENTIFIER' | translate }} <code>{{ tasca.id }}</code></span>
        </div>
      </header>

      <!-- Descripció de la tasca -->
      <article class="card desc-card">
        <h2>{{ 'TASCA_DETALL.WORK_DESC_TITLE' | translate }}</h2>
        <p class="description-text">{{ tasca.descripcio }}</p>

        <!-- Banner informatiu quan és una TASCA oficial en curs -->
        <div *ngIf="isTascaConvergida" class="converged-info-banner">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
          <div>
            <strong>{{ 'TASCA_DETALL.TAG_CONVERGED' | translate }}:</strong>
            <span> {{ 'TASCA_DETALL.CONVERGED_BANNER' | translate }} ({{ tasca.budget }}).</span>
          </div>
        </div>

        <!-- Avís per al client mentre la feina està en curs -->
        <div *ngIf="isClientOwner && tasca.estat === 'En curs'" class="complete-box" style="background: rgba(59, 130, 246, 0.06); border-color: rgba(59, 130, 246, 0.25);">
          <p style="color: #1e40af; font-weight: 700;">
            {{ 'TASCA_DETALL.IN_PROGRESS_CLIENT_NOTICE' | translate }}
          </p>
          <button type="button" class="btn btn-complete-client" (click)="onCompleteTask()">
            {{ 'TREBALL.FINISH_BTN' | translate }}
          </button>
        </div>

        <!-- Botó per al client quan la tasca ja està finalitzada pel professional però encara no té valoració -->
        <div *ngIf="isClientOwner && tasca.estat === 'Finalitzada' && !tasca.valoracio" class="evaluate-box">
          <div class="evaluate-box-content">
            <span class="evaluate-icon">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="#f59e0b" aria-hidden="true">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
              </svg>
            </span>
            <div>
              <h3>{{ 'TASCA_DETALL.EVALUATE_TITLE' | translate }}</h3>
              <p>{{ 'TASCA_DETALL.EVALUATE_SUB' | translate }}</p>
            </div>
          </div>
          <button type="button" class="btn btn-evaluate" (click)="onCompleteTask()">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" style="vertical-align: -1px; margin-right: 4px;" aria-hidden="true">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
            </svg>
            {{ 'TASCA_DETALL.BTN_EVALUATE' | translate }}
          </button>
        </div>

        <!-- Mostra la valoració registrada a la tasca finalitzada (només una vegada) -->
        <div *ngIf="tasca.estat === 'Finalitzada' && tasca.valoracio" class="review-display-card">
          <div class="review-display-header">
            <span class="review-display-badge">{{ 'TASCA_DETALL.REVIEW_HEADER' | translate }}</span>
            <div class="stars-display">
              <span *ngFor="let s of [1, 2, 3, 4, 5]" class="star-glyph">
                <svg viewBox="0 0 24 24" width="16" height="16" [attr.fill]="s <= (tasca.valoracio || 0) ? '#f59e0b' : '#d1d5db'" aria-hidden="true">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                </svg>
              </span>
              <span class="score-text">{{ tasca.valoracio }}/5</span>
            </div>
          </div>
          <p class="review-display-opinion" *ngIf="tasca.comentari">"{{ tasca.comentari }}"</p>
        </div>

        <!-- Botó per al professional assignat per donar per acabada la tasca -->
        <div *ngIf="(isAssignedProfessional || isAdminUser) && !isClientOwner && tasca.estat === 'En curs'" class="complete-box pro-complete-box">
          <p>{{ 'TASCA_DETALL.PRO_FINISHED_QUESTION' | translate }}</p>
          <button type="button" class="btn btn-complete-pro" (click)="onCompleteTaskByPro()">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: -2px; margin-right: 6px;">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            {{ 'TASCA_DETALL.BTN_COMPLETE_PRO' | translate }}
          </button>
        </div>

        <!-- El contacte de l'altra part només es mostra quan el treball està acceptat -->
        <app-contacte-tasca
          *ngIf="contacteUsuariId"
          [usuariId]="contacteUsuariId"
          [titol]="contacteTitol"
        ></app-contacte-tasca>

        <p class="revisio-avis" *ngIf="tasca.estat === 'En revisió'">{{ 'TREBALL.CANCEL_IN_REVIEW' | translate }}</p>

        <div class="action-box" *ngIf="potCancellar">
          <button type="button" class="btn btn-cancel-task" (click)="mostrarCancellacio = true">
            {{ 'TREBALL.CANCEL_BTN' | translate }}
          </button>
        </div>

        <!-- El client pot tancar la seua incidència oberta sense triar cap professional -->
        <div class="action-box" *ngIf="potTancarIncidencia">
          <button type="button" class="btn btn-cancel-task" (click)="onCloseIncidencia()">
            {{ 'TREBALL.CLOSE_INCIDENT_BTN' | translate }}
          </button>
        </div>

        <!-- Botó per a professionals si la incidència està oberta i sense professional -->
        <div *ngIf="isProfessional && !isTascaConvergida && tasca.estat === 'Oberta'" class="action-box">
          <a [routerLink]="[getNavUrl('/professional/crear-oferta')]" [queryParams]="{ taskId: tasca.id }" class="btn btn-primary">
            {{ 'TASCA_DETALL.BTN_BID_INCIDENCIA' | translate }}
          </a>
        </div>
      </article>

      <!-- Notificacions / Alertes -->
      <div *ngIf="noticeMessage" class="alert alert-info" role="status">
        {{ noticeMessage | translate }}
      </div>

      <!-- Llistat d'ofertes rebudes -->
      <section class="offers-section" *ngIf="isIncidencia">
        <div class="section-header">
          <h2>{{ 'TASCA_DETALL.OFFERS_RECEIVED_TITLE' | translate }} ({{ ofertes.length }})</h2>
        </div>

        <div *ngIf="ofertes.length === 0" class="empty-state">
          <p>{{ 'TASCA_DETALL.NO_OFFERS' | translate }}</p>
        </div>

        <div class="offers-grid" *ngIf="ofertes.length > 0">
          <article class="card offer-card" *ngFor="let offer of ofertes">
            <div class="offer-header">
              <h3>
                <a [routerLink]="[getNavUrl('/perfil'), offer.professionalId || offer.professional]" class="user-profile-link" title="Veure perfil">
                  {{ offer.professional }}
                </a>
              </h3>
            </div>

            <p class="offer-note">{{ offer.note }}</p>

            <div class="offer-footer">
              <span class="price-tag">{{ 'TASCA_DETALL.PROPOSED_PRICE' | translate }} <strong>{{ offer.price }}</strong></span>

              <!-- Accions sobre l'oferta: les ofertes no tenen estat, sols s'accepten o es borren -->
              <div class="offer-actions" *ngIf="tasca.estat === 'Oberta'">
                <button
                  *ngIf="isClientOwner"
                  type="button"
                  class="btn btn-accept"
                  (click)="onAcceptOffer(offer.id)"
                >
                  {{ 'TASCA_DETALL.BTN_ACCEPT_QUOTE' | translate }}
                </button>
                <button
                  *ngIf="isClientOwner || isAdminUser"
                  type="button"
                  class="btn btn-reject"
                  (click)="onDeleteOffer(offer.id)"
                  title="Borrar aquesta oferta"
                >
                  {{ 'TASCA_DETALL.BTN_REJECT_QUOTE' | translate }}
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
              <span class="modal-badge-tag">{{ 'TASCA_DETALL.REVIEW_HEADER' | translate }}</span>
              <h2>{{ 'TASCA_DETALL.MODAL_EVALUATE_TITLE' | translate }}</h2>
            </div>
            <button type="button" class="btn-close-modal" (click)="tancarModalFinalitzar()" aria-label="Tancar">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </header>

          <div class="modal-body" *ngIf="tasca">
            <div class="modal-task-summary">
              <span class="category-tag">{{ tasca.categoria | translate }}</span>
              <h3>{{ tasca.titol }}</h3>
              <p class="summary-pro">
                {{ 'TASCA_DETALL.PRO_ASSIGNED_LABEL' | translate }} <strong>{{ assignedProfessional }}</strong>
              </p>
            </div>

            <div class="rating-input-group">
              <label class="rating-title">{{ 'TASCA_DETALL.MODAL_RATING_LABEL' | translate }}</label>
              <div class="stars-picker">
                <button
                  type="button"
                  *ngFor="let star of [1, 2, 3, 4, 5]"
                  class="star-btn"
                  [class.active]="star <= puntuacioSeleccionada"
                  (click)="puntuacioSeleccionada = star"
                  title="{{ star }} estrelles"
                >
                  <svg viewBox="0 0 24 24" width="18" height="18" [attr.fill]="star <= puntuacioSeleccionada ? '#f59e0b' : 'none'" [attr.stroke]="star <= puntuacioSeleccionada ? '#f59e0b' : '#9ca3af'" stroke-width="2" aria-hidden="true">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                  </svg>
                </button>
                <span class="star-rating-text">{{ getRatingLabel(puntuacioSeleccionada) }}</span>
              </div>
            </div>

            <div class="comment-input-group">
              <label for="ressenya-text-detall">{{ 'TASCA_DETALL.MODAL_COMMENT_LABEL' | translate }}</label>
              <textarea
                id="ressenya-text-detall"
                [(ngModel)]="ressenyaDescripcio"
                rows="4"
                [placeholder]="'TASCA_DETALL.MODAL_COMMENT_PLACEHOLDER' | translate"
              ></textarea>
            </div>

            <div class="modal-actions-col">
              <button
                type="button"
                class="btn-submit-review"
                (click)="confirmarFinalitzacioAmbRessenya()"
                [disabled]="enviantRessenya"
              >
                {{ 'TASCA_DETALL.BTN_SAVE_REVIEW' | translate }}
              </button>
              <button
                *ngIf="tasca.estat !== 'Finalitzada'"
                type="button"
                class="btn-skip-review"
                (click)="finalitzarSenseRessenya()"
                [disabled]="enviantRessenya"
              >
                {{ 'TREBALL.FINISH_NO_REVIEW' | translate }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <app-cancellar-tasca-modal
        *ngIf="mostrarCancellacio"
        [tasca]="tasca"
        (tancat)="mostrarCancellacio = false"
        (enviat)="alCancellacioSollicitada($event)"
      ></app-cancellar-tasca-modal>
    </section>

    <!-- Estat de càrrega o no trobat -->
    <div *ngIf="loading" class="task-loading-state card">
      <div class="task-loading-spinner" aria-hidden="true"></div>
      <p>{{ 'COMMON.CARREGANT' | translate }}</p>
    </div>

    <div *ngIf="!tasca && !loading" class="not-found card">
      <h2>{{ 'COMMON.NO_RESULTS' | translate }}</h2>
      <p>No s'ha pogut localitzar la tasca sol·licitada.</p>
      <a [routerLink]="getNavUrl('/inici')" class="btn btn-primary">{{ 'COMMON.TORNAR' | translate }}</a>
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

      .revisio-avis {
        margin: 0.75rem 0 0;
        padding: 0.7rem 0.9rem;
        border-radius: 10px;
        background: #fff7ed;
        border: 1px solid #fed7aa;
        color: #9a3412;
        font-size: 0.88rem;
        font-weight: 700;
      }
      .btn-cancel-task, .btn-complete-client {
        padding: 0.65rem 1.1rem;
        border-radius: 10px;
        font-weight: 800;
        cursor: pointer;
        border: 1px solid #d6d3d1;
        background: #ffffff;
        color: #09090c;
        min-height: 44px;
      }
      .btn-complete-client {
        background: #ff1744;
        border-color: #ff1744;
        color: #ffffff;
        margin-top: 0.5rem;
      }
      .btn-cancel-task:hover { background: #09090c; color: #ffffff; }
      .status-en-revisio { background: rgba(234, 88, 12, 0.12); color: #c2410c; }
      .status-cancel-lada, .status-tancada { background: rgba(100, 116, 139, 0.14); color: #475569; }
      .status-sol-licitada, .status-assignada { background: rgba(99, 102, 241, 0.12); color: #4338ca; }

      .app-back-nav {
        display: flex;
        align-items: center;
        margin-bottom: -0.5rem;
      }

      .btn-app-back {
        display: inline-flex;
        align-items: center;
        gap: 0.45rem;
        background: var(--bg-card, #ffffff);
        color: var(--color-text-muted, #57554e);
        border: 1px solid var(--border-subtle, #e5e0d7);
        padding: 0.45rem 0.95rem;
        border-radius: var(--radius-sm, 8px);
        font-family: inherit;
        font-weight: 700;
        font-size: 0.88rem;
        cursor: pointer;
        transition: all 0.18s ease;
      }

      .btn-app-back:hover {
        background: var(--bg-surface, #faf8f4);
        color: var(--color-text, #09090c);
        border-color: var(--neon, #ff1744);
      }

      .btn-app-back:active {
        transform: scale(0.96);
      }

      .detall-header {
        background: var(--bg-card, #ffffff);
        border: 1px solid var(--border-subtle, #e5e0d7);
        color: var(--color-text, #09090c);
        padding: 2.2rem;
        border-radius: var(--radius-xl, 20px);
        box-shadow: var(--shadow-md, 0 4px 20px rgba(0, 0, 0, 0.05));
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
        color: var(--color-text, #09090c);
        letter-spacing: -0.02em;
      }

      .meta-row {
        display: flex;
        gap: 1.5rem;
        flex-wrap: wrap;
        font-size: 0.95rem;
        color: var(--color-text-muted, #636058);
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
        background: var(--bg-surface, #f0ece3);
        border: 1px solid var(--border-subtle, #dcd6cb);
        color: var(--color-text, #09090c);
        padding: 0.2rem 0.5rem;
        border-radius: 6px;
        font-weight: 700;
      }

      .card {
        background: var(--bg-card, #ffffff);
        padding: 2rem;
        border-radius: var(--radius-lg, 18px);
        border: 1px solid var(--border-subtle, #e5e0d7);
        box-shadow: var(--shadow-sm, 0 4px 16px rgba(0, 0, 0, 0.04));
      }

      .card h2 {
        margin: 0 0 0.8rem;
        font-size: 1.35rem;
        font-weight: 900;
        color: var(--color-text, #09090c);
      }

      .description-text {
        color: var(--color-text-muted, #4a4841);
        line-height: 1.6;
        font-size: 1rem;
        margin: 0;
        font-weight: 500;
      }

      .action-box, .complete-box {
        margin-top: 1.5rem;
        padding-top: 1.5rem;
        border-top: 1px solid var(--border-subtle, #e5e0d7);
      }

      .complete-box p {
        margin: 0 0 0.75rem;
        font-weight: 800;
        color: var(--color-text, #09090c);
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
        color: var(--color-text, #09090c);
        margin-left: 0.4rem;
      }

      .review-display-opinion {
        margin: 0;
        font-style: italic;
        color: var(--color-text-muted, #4a4841);
        font-size: 0.95rem;
        line-height: 1.5;
        background: var(--bg-surface, #ffffff);
        padding: 0.75rem 1rem;
        border-radius: 8px;
        border: 1px solid var(--border-subtle, #ede8de);
      }

      .review-edit-row {
        display: flex;
        justify-content: flex-end;
      }

      .btn-edit-review {
        background: var(--bg-surface, #ffffff);
        border: 1px solid var(--border-subtle, #d6d0c4);
        border-radius: 6px;
        color: var(--color-text, #09090c);
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
        color: var(--color-text, #09090c);
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
        background: var(--bg-card, #ffffff);
        border: 1px solid var(--border-subtle, #e5e0d7);
        box-shadow: var(--shadow-sm, 0 4px 16px rgba(0, 0, 0, 0.04));
        transition: border-color 0.2s;
      }

      .offer-card:hover {
        border-color: var(--border-card, #d6d0c4);
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
        color: var(--color-text, #09090c);
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

      .task-loading-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 3.5rem 1.5rem;
        gap: 1rem;
        background: var(--bg-card, #ffffff);
        border: 1px solid var(--border-subtle, #e5e0d7);
        border-radius: 16px;
        color: var(--color-text-muted, #636058);
        font-weight: 700;
        text-align: center;
      }

      .task-loading-spinner {
        width: 38px;
        height: 38px;
        border: 3.5px solid rgba(255, 23, 68, 0.15);
        border-top-color: #ff1744;
        border-radius: 50%;
        animation: spinTask 0.75s infinite linear;
      }

      @keyframes spinTask {
        to { transform: rotate(360deg); }
      }

      body.theme-app-dark .task-loading-state {
        background: var(--bg-card);
        border-color: var(--border-card);
        color: var(--color-text-muted);
      }

      .not-found {
        text-align: center;
        padding: 3rem;
        color: var(--color-text, #09090c);
      }

      /* Modal d'Avaluació */
      .modal-backdrop {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
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
        background: var(--bg-card, #ffffff);
        border-radius: 20px;
        width: min(560px, 100%);
        max-height: 90vh;
        overflow-y: auto;
        border: 1px solid var(--border-subtle, #e5e0d7);
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.35);
        display: flex;
        flex-direction: column;
      }

      .modal-header {
        padding: 1.5rem 1.8rem;
        border-bottom: 1px solid var(--border-subtle, #e5e0d7);
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        background: var(--bg-surface, #faf8f4);
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
        color: var(--color-text, #09090c);
      }

      .btn-close-modal {
        background: var(--bg-surface, #ece7dc);
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
        color: var(--color-text, #09090c);
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
        background: var(--bg-surface, #f8f6f0);
        border: 1px solid var(--border-subtle, #e5e0d7);
        padding: 1rem 1.25rem;
        border-radius: 12px;
      }

      .modal-task-summary h3 {
        margin: 0.4rem 0 0.25rem;
        font-size: 1.1rem;
        font-weight: 800;
        color: var(--color-text, #09090c);
      }

      .summary-pro {
        margin: 0;
        font-size: 0.88rem;
        color: var(--color-text-muted, #55524b);
      }

      .summary-pro strong {
        color: #ff1744;
      }

      .rating-title,
      .comment-input-group label {
        display: block;
        font-size: 0.88rem;
        font-weight: 800;
        color: var(--color-text, #09090c);
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

  /** Modal de sol·licitud de cancel·lació */
  mostrarCancellacio = false;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly tascaService: TascaService,
    private readonly incidenciaService: IncidenciaService,
    private readonly pressupostService: PressupostService,
    private readonly resenyaService: ResenyaService,
    private readonly authService: AuthService,
    private readonly confirmService: ConfirmService
  ) {}

  get isAppPage(): boolean {
    const url = this.router.url || '';
    return url.startsWith('/app');
  }

  getNavUrl(path: string): string {
    if (this.isAppPage) {
      if (path === '/' || path === '/inici' || path === '/app') return '/app';
      if (path.startsWith('/app/')) return path;
      return path.startsWith('/') ? `/app${path}` : `/app/${path}`;
    }
    return path;
  }

  goBack(): void {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      window.history.back();
    } else {
      this.router.navigate([this.getNavUrl('/tasques-ofertes')]);
    }
  }

  get assignedProfessional(): string {
    return (this.tasca?.professionalNom || this.tasca?.professional || '');
  }

  /** Treball acordat entre client i professional; el tipus el decideix el back, no el prefix de l'identificador */
  get isTascaConvergida(): boolean {
    return this.tasca?.tipus === 'tasca';
  }

  get isIncidencia(): boolean {
    return this.tasca?.tipus === 'incidencia';
  }

  get isAdminUser(): boolean {
    return this.authService.isAdmin();
  }

  /** Identificador de l'altra part, només quan la tasca ja està acceptada i l'usuari n'és una de les parts */
  get contacteUsuariId(): string {
    const user = this.authService.getCurrentUser();
    const t = this.tasca;
    if (!user || !t || !this.isTascaConvergida) return '';
    if (!['En curs', 'En revisió', 'Finalitzada'].includes(t.estat || '')) return '';
    if (user.id === t.clientId) return t.professionalId || '';
    if (user.id === t.professionalId) return t.clientId || '';
    return '';
  }

  get contacteTitol(): string {
    return this.authService.getCurrentUser()?.id === this.tasca?.clientId ? 'TREBALL.CONTACTE_PROFESSIONAL' : 'TREBALL.CONTACTE_CLIENT';
  }

  /** El client o el professional poden sol·licitar la cancel·lació d'una tasca en curs */
  get potCancellar(): boolean {
    return this.isTascaConvergida && this.tasca?.estat === 'En curs' && (this.isClientOwner || this.isAssignedProfessional);
  }

  get potTancarIncidencia(): boolean {
    return this.isIncidencia && this.tasca?.estat === 'Oberta' && this.isClientOwner;
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
   * Carrega els pressupostos d'una incidència.
   * PRIVADESA: només els veuen el client titular, el professional emissor (el seu) i l'administrador.
   */
  private loadOffers(taskId: string): void {
    if (!this.isIncidencia) {
      this.ofertes = [];
      return;
    }
    this.pressupostService.getByIncidencia(taskId).subscribe({
      next: (pressupostos) => {
        this.ofertes = (pressupostos || []).map(p => ({
          id: p.id,
          tascaId: p.incidenciaId,
          professional: p.professionalNom,
          professionalId: p.professionalId,
          price: p.preu,
          note: (p.descripcio || '') + (p.duracioEstimada ? ` (Termini estimat: ${p.duracioEstimada})` : ''),
          estat: p.estat || 'Pendent'
        }));
      },
      error: () => {
        this.ofertes = [];
      }
    });
  }

  /**
   * Comprova si l'usuari connectat és el client propietari de la tasca.
   */
  get isClientOwner(): boolean {
    const user = this.authService.getCurrentUser();
    return !!user && !!this.tasca && user.rol === 'CLIENT' && user.id === this.tasca.clientId;
  }

  /**
   * Comprova si l'usuari connectat és el professional assignat a aquesta tasca.
   */
  get isAssignedProfessional(): boolean {
    const user = this.authService.getCurrentUser();
    return !!user && !!this.tasca?.professionalId && user.id === this.tasca.professionalId;
  }

  /**
   * Comprova si l'usuari connectat és l'autor d'una proposta concreta.
   */
  isOfferOwner(offer: Oferta): boolean {
    const user = this.authService.getCurrentUser();
    return !!user && !!offer.professionalId && user.id === offer.professionalId;
  }

  /**
   * Comprova si l'usuari connectat és un professional (només el rol PROFESSIONAL pot presentar pressupostos).
   */
  get isProfessional(): boolean {
    return this.authService.hasRole('PROFESSIONAL');
  }

  /**
   * Accepta un pressupost o oferta seleccionada pel client.
   * Transaccionalment crea la tasca en curs i elimina la incidència de les publicacions.
   */
  async onAcceptOffer(offerId: string): Promise<void> {
    const confirmacio = await this.confirmService.confirm({
      title: 'CONFIRM_MODAL.ACCEPT_BUDGET_TITLE',
      message: 'CONFIRM_MODAL.ACCEPT_BUDGET_MSG',
      confirmText: 'CONFIRM_MODAL.DEFAULT_CONFIRM',
      cancelText: 'CONFIRM_MODAL.DEFAULT_CANCEL',
      icon: 'success'
    });
    if (!confirmacio) return;

    this.pressupostService.accept(offerId).subscribe({
      next: (tascaCreada) => {
        this.noticeMessage = 'TREBALL.BUDGET_ACCEPTED_OK';
        this.ofertes = [];
        if (tascaCreada && tascaCreada.id) {
          setTimeout(() => {
            this.router.navigate([this.getNavUrl('/tasca-detall'), tascaCreada.id]);
          }, 1200);
        } else if (this.tasca) {
          this.loadTask(this.tasca.id);
        }
      },
      error: (e) => {
        this.noticeMessage = e?.error?.error || 'TREBALL.BUDGET_ACCEPT_ERROR';
      }
    });
  }

  /**
   * Rebutja un pressupost pendent. El professional rep un avís.
   */
  async onDeleteOffer(offerId: string): Promise<void> {
    const confirmacio = await this.confirmService.confirm({
      title: 'TREBALL.BUDGET_REJECT_TITLE',
      message: 'TREBALL.BUDGET_REJECT_MSG',
      confirmText: 'CONFIRM_MODAL.DEFAULT_CONFIRM',
      cancelText: 'CONFIRM_MODAL.DEFAULT_CANCEL',
      isDanger: true,
      icon: 'danger'
    });
    if (!confirmacio) return;

    this.pressupostService.reject(offerId).subscribe({
      next: () => {
        this.noticeMessage = 'TREBALL.BUDGET_REJECTED_OK';
        this.ofertes = this.ofertes.filter(o => o.id !== offerId);
      },
      error: (e) => {
        this.noticeMessage = e?.error?.error || 'TREBALL.BUDGET_REJECT_ERROR';
      }
    });
  }

  /** Tanca la incidència oberta: els pressupostos pendents es rebutgen i els professionals reben un avís */
  async onCloseIncidencia(): Promise<void> {
    if (!this.tasca) return;
    const confirmacio = await this.confirmService.confirm({
      title: 'TREBALL.CLOSE_INCIDENT_TITLE',
      message: 'TREBALL.CLOSE_INCIDENT_MSG',
      confirmText: 'TREBALL.CLOSE_INCIDENT_BTN',
      cancelText: 'COMMON.CANCEL_LAR',
      isDanger: true,
      icon: 'warning'
    });
    if (!confirmacio) return;
    this.incidenciaService.close(this.tasca.id).subscribe({
      next: () => {
        this.noticeMessage = 'TREBALL.CLOSE_INCIDENT_OK';
        this.loadTask(this.tasca!.id);
      },
      error: (e) => {
        this.noticeMessage = e?.error?.error || 'TREBALL.CLOSE_INCIDENT_ERROR';
      }
    });
  }

  alCancellacioSollicitada(updated: Tasca): void {
    this.mostrarCancellacio = false;
    this.tasca = updated;
    this.noticeMessage = 'TREBALL.CANCEL_SENT_OK';
  }

  /**
   * Àlies per compatibilitat: rebutjar esdevé borrar/descartar.
   */
  onRejectOffer(offerId: string): void {
    this.onDeleteOffer(offerId);
  }

  /**
   * El professional assignat finalitza la tasca un cop completada la feina.
   */
  async onCompleteTaskByPro(): Promise<void> {
    if (!this.tasca) return;
    const confirmacio = await this.confirmService.confirm({
      title: 'CONFIRM_MODAL.FINALIZE_TASK_TITLE',
      message: 'CONFIRM_MODAL.FINALIZE_TASK_MSG',
      confirmText: 'CONFIRM_MODAL.DEFAULT_CONFIRM',
      cancelText: 'CONFIRM_MODAL.DEFAULT_CANCEL',
      icon: 'success'
    });
    if (!confirmacio) return;

    this.tascaService.complete(this.tasca.id).subscribe({
      next: (updated) => {
        this.tasca = updated;
        this.noticeMessage = 'Enhorabona! Has donat per finalitzada la tasca. S’ha registrat la finalització i notificat al client!';
      },
      error: (e) => {
        this.noticeMessage = e?.error?.error || 'Error en finalitzar la tasca. Si us plau, torna-ho a provar.';
      }
    });
  }

  /**
   * Obre el modal per avaluar la tasca un cop el professional l'ha donat per finalitzada.
   */
  onCompleteTask(): void {
    if (!this.tasca) return;
    this.puntuacioSeleccionada = this.tasca.valoracio || 5;
    this.ressenyaDescripcio = this.tasca.comentari || '';
    this.modalFinalitzarObert = true;
  }

  /**
   * Confirma l'avaluació i envia la valoració (només es permet una única vegada un cop acabada la tasca).
   */
  confirmarFinalitzacioAmbRessenya(): void {
    if (!this.tasca) return;
    const t = this.tasca;
    this.enviantRessenya = true;
    const textDesc = this.ressenyaDescripcio.trim() || 'Feina completada amb èxit i total satisfacció.';

    const dades = { valoracio: this.puntuacioSeleccionada, comentari: textDesc };
    // Si la tasca encara és en curs, el client la finalitza i la valora d'una vegada
    const peticio$ = t.estat === 'En curs' ? this.tascaService.complete(t.id, dades) : this.tascaService.avaluar(t.id, dades);
    peticio$.subscribe({
      next: (updated) => {
        this.tasca = updated;
        this.enviantRessenya = false;
        this.tancarModalFinalitzar();
        this.noticeMessage = 'La teva valoració s\'ha registrat i publicat correctament!';
      },
      error: (e) => {
        this.enviantRessenya = false;
        this.noticeMessage = e?.error?.error || 'Error en registrar la valoració.';
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
      error: (e) => {
        this.enviantRessenya = false;
        this.noticeMessage = e?.error?.error || 'Error en finalitzar la tasca.';
      }
    });
  }

  /**
   * Genera la classe CSS per al color de l'estat.
   */
  getStatusClass(status: string): string {
    return 'status-' + (status || '').toLowerCase().normalize('NFD').replace(/[^a-z0-9]+/g, '-');
  }
}

