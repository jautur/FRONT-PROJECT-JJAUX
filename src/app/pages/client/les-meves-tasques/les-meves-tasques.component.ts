import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { TascaService } from '../../../services/tasca.service';
import { IncidenciaService } from '../../../services/incidencia.service';
import { InteresService } from '../../../services/interes.service';
import { PressupostService } from '../../../services/pressupost.service';
import { ResenyaService } from '../../../services/resenya.service';
import { AuthService } from '../../../core/services/auth.service';
import { ConfirmService } from '../../../core/services/confirm.service';
import { Tasca } from '../../../models/tasca.model';
import { Interes } from '../../../models/interes.model';
import { ContacteTascaComponent } from '../../../shared/components/contacte-tasca/contacte-tasca.component';
import { CancellarTascaModalComponent } from '../../../shared/components/cancellar-tasca/cancellar-tasca-modal.component';

/**
 * Tipus per al filtre d'estat de les tasques del client.
 */
type FiltreEstatTasca = 'totes' | 'sollicitada' | 'oberta' | 'en_curs' | 'finalitzada' | 'cancellada';

/**
 * Component del Panell de Gestió de Tasques del Client (/client/les-meves-tasques).
 * Permet a un client:
 * - Visualitzar totes les tasques que ha publicat a la plataforma.
 * - Filtrar segons l'estat (obertes, en curs, finalitzades).
 * - Consultar quantes ofertes de professionals ha rebut cada tasca.
 * - Accedir a la revisió d'ofertes o donar per finalitzat el servei amb valoració.
 * - Eliminar tasques publicades.
 */
import { TranslatePipe } from '../../../core/pipes/translate.pipe';

@Component({
  selector: 'app-les-meves-tasques',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TranslatePipe, ContacteTascaComponent, CancellarTascaModalComponent],
  template: `
    <div class="panell-container">
      <div class="app-back-nav" *ngIf="isAppPage">
        <button type="button" class="btn-app-back" (click)="goBack()" [title]="'COMMON.TORNAR' | translate">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
          <span>{{ 'COMMON.TORNAR' | translate }}</span>
        </button>
      </div>

      <div class="panell-header">
        <div>
          <h2>{{ 'LES_MEVES_TASQUES.TITLE' | translate }}</h2>
          <p class="subtitle">{{ 'LES_MEVES_TASQUES.SUBTITLE' | translate }}</p>
        </div>
        <div>
          <a [routerLink]="getNavUrl('/client/crear-tasca')" class="btn-crear">
            {{ 'LES_MEVES_TASQUES.BTN_NEW_INCIDENCIA' | translate }}
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
          {{ 'LES_MEVES_TASQUES.TAB_ALL' | translate }} ({{ tasques.length }})
        </button>
        <button
          type="button"
          class="tab-btn"
          [class.active]="filtreActiu === 'sollicitada'"
          (click)="canviarFiltre('sollicitada')"
        >
          {{ 'TREBALL.TAB_SOLLICITUDS' | translate }} ({{ countSollicituds() }})
        </button>
        <button
          type="button"
          class="tab-btn"
          [class.active]="filtreActiu === 'oberta'"
          (click)="canviarFiltre('oberta')"
        >
          {{ 'LES_MEVES_TASQUES.TAB_OPEN' | translate }} ({{ countIncidencies() }})
        </button>
        <button
          type="button"
          class="tab-btn"
          [class.active]="filtreActiu === 'en_curs'"
          (click)="canviarFiltre('en_curs')"
        >
          {{ 'LES_MEVES_TASQUES.TAB_IN_PROGRESS' | translate }} ({{ countEnCurs() }})
        </button>
        <button
          type="button"
          class="tab-btn"
          [class.active]="filtreActiu === 'finalitzada'"
          (click)="canviarFiltre('finalitzada')"
        >
          {{ 'LES_MEVES_TASQUES.TAB_COMPLETED' | translate }} ({{ countFinalitzades() }})
        </button>
        <button
          type="button"
          class="tab-btn"
          [class.active]="filtreActiu === 'cancellada'"
          (click)="canviarFiltre('cancellada')"
        >
          {{ 'TREBALL.TAB_CANCELLADES' | translate }} ({{ countCancellades() }})
        </button>
      </div>

      <!-- Missatges d'estat -->
      <div *ngIf="loading" class="state-box">{{ 'COMMON.CARREGANT' | translate }}</div>
      <div *ngIf="errorMsg" class="alert-error" role="alert">{{ errorMsg | translate }}</div>
      <div *ngIf="successMsg" class="alert-success" role="status">{{ successMsg | translate }}</div>

      <!-- Llista de tasques -->
      <div class="tasques-grid" *ngIf="!loading && tasquesFiltrades.length > 0">
        <div *ngFor="let t of tasquesFiltrades" class="tasca-card" [class.converged-card]="isTascaConvergida(t) || esSollicitud(t)">
          <div class="card-header">
            <div class="header-nature-group">
              <span class="badge-nature" [ngClass]="esIncidencia(t) ? 'is-incidencia' : 'is-tasca'">
                {{ esSollicitud(t) ? ('TREBALL.NATURE_SOLLICITUD' | translate) : (esIncidencia(t) ? ('LES_MEVES_TASQUES.NATURE_INCIDENCIA' | translate) : ('LES_MEVES_TASQUES.NATURE_TASK' | translate)) }}
              </span>
              <span class="badge-categoria">{{ t.categoria ? (t.categoria | translate) : ('CATEGORIES.Altres Serveis' | translate) }}</span>
            </div>
            <span class="badge-estat" [ngClass]="getEstatClass(t.estat)">{{ t.estat ? (t.estat | translate) : '' }}</span>
          </div>

          <h3 class="tasca-titol">{{ t.titol }}</h3>
          <p class="tasca-desc">{{ t.descripcio }}</p>

          <div class="tasca-meta">
            <!-- Professional assignat si és tasca en curs o finalitzada -->
            <div class="meta-item pro-assigned-item" *ngIf="!esIncidencia(t)">
              <span class="meta-label">{{ 'LES_MEVES_TASQUES.PRO_ASSIGNED' | translate }}</span>
              <span class="meta-value pro-assigned-val">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: -2px; margin-right: 4px;">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                <a [routerLink]="[getNavUrl('/perfil'), t.professionalNom || t.professional]" class="user-inline-link">
                  <strong>{{ t.professionalNom || t.professional }}</strong>
                </a>
              </span>
            </div>

            <!-- Sense professional si és incidència oberta -->
            <div class="meta-item waiting-item" *ngIf="esIncidencia(t)">
              <span class="meta-label">{{ 'LES_MEVES_TASQUES.PRO_STATUS' | translate }}</span>
              <span class="meta-value waiting-badge">{{ 'LES_MEVES_TASQUES.NO_PRO_ASSIGNED' | translate }}</span>
            </div>

            <div class="meta-item budget-item">
              <span class="meta-label">{{ esIncidencia(t) ? ('LES_MEVES_TASQUES.ESTIMATED_BUDGET' | translate) : ('LES_MEVES_TASQUES.AGREED_PRICE' | translate) }}</span>
              <span class="meta-value budget">{{ t.budget }}</span>
            </div>

            <div class="meta-item ofertes-item" *ngIf="esIncidencia(t) && ofertesCount[t.id] !== undefined">
              <span class="meta-label">{{ 'LES_MEVES_TASQUES.QUOTES_RECEIVED' | translate }}</span>
              <span class="meta-value ofertes-badge">{{ ofertesCount[t.id] }} {{ 'LES_MEVES_TASQUES.QUOTES_COUNT' | translate }}</span>
            </div>

            <!-- Mostra la valoració si ja ha estat avaluada -->
            <div class="meta-item rating-item" *ngIf="t.valoracio">
              <span class="meta-label">{{ 'LES_MEVES_TASQUES.YOUR_RATING' | translate }}</span>
              <span class="meta-value rating-stars">
                <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor" style="vertical-align: -1px; margin-right: 2px;" aria-hidden="true">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                </svg>
                {{ t.valoracio }}/5
                <span *ngIf="t.comentari" class="rating-quote">"{{ t.comentari }}"</span>
              </span>
            </div>
          </div>

          <!-- El contacte de l'altra part només es mostra quan la tasca està acceptada -->
          <app-contacte-tasca
            *ngIf="teContacte(t)"
            [usuariId]="t.professionalId"
            titol="TREBALL.CONTACTE_PROFESSIONAL"
          ></app-contacte-tasca>

          <p class="revisio-avis" *ngIf="t.estat === 'En revisió'">{{ 'TREBALL.CANCEL_IN_REVIEW' | translate }}</p>
          <p class="revisio-avis" *ngIf="esSollicitud(t)">{{ 'TREBALL.SOL_PENDING_HINT' | translate }}</p>

          <div class="card-actions">
            <a *ngIf="!esSollicitud(t)" [routerLink]="[getNavUrl('/tasca-detall'), t.id]" class="btn-action primary">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: -2px; margin-right: 5px;" aria-hidden="true">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              {{ esIncidencia(t) ? ('LES_MEVES_TASQUES.BTN_REVIEW_QUOTES' | translate) + ' (' + (ofertesCount[t.id] || 0) + ')' : ('TASQUES_OFERTES.VEURE_SEGUIMENT' | translate) }}
            </a>

            <!-- Finalitzar: el client ho pot fer sense confirmació del professional -->
            <button *ngIf="t.estat === 'En curs'" type="button" class="btn-action evaluate-btn" (click)="obrirModalFinalitzar(t)">
              {{ 'TREBALL.FINISH_BTN' | translate }}
            </button>

            <!-- Si ja està finalitzada però encara no s'ha avaluat -->
            <button *ngIf="t.estat === 'Finalitzada' && !t.valoracio" type="button" class="btn-action evaluate-btn" (click)="obrirModalFinalitzar(t)">
              {{ 'TASCA_DETALL.BTN_EVALUATE' | translate }}
            </button>

            <button *ngIf="t.estat === 'En curs'" type="button" class="btn-action neutral" (click)="tascaPerCancellar = t">
              {{ 'TREBALL.CANCEL_BTN' | translate }}
            </button>

            <!-- Una incidència oberta es pot tancar sense triar cap professional -->
            <button *ngIf="esIncidencia(t) && t.estat === 'Oberta'" type="button" class="btn-action neutral" (click)="tancarIncidencia(t)">
              {{ 'TREBALL.CLOSE_INCIDENT_BTN' | translate }}
            </button>

            <button *ngIf="esSollicitud(t)" type="button" class="btn-action danger" (click)="retirarSollicitud(t)">
              {{ 'TREBALL.SOL_WITHDRAW' | translate }}
            </button>

            <!-- Només s'esborra una incidència; una tasca acordada forma part de l'historial -->
            <button *ngIf="esIncidencia(t) && t.estat === 'Oberta'" type="button" class="btn-action danger" (click)="eliminarIncidencia(t)">
              {{ 'COMMON.BORRAR' | translate }}
            </button>
          </div>
        </div>
      </div>

      <!-- Estat buit -->
      <div class="empty-state" *ngIf="!loading && tasquesFiltrades.length === 0">
        <div class="empty-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
          </svg>
        </div>
        <h3>{{ 'LES_MEVES_TASQUES.EMPTY_TITLE' | translate }}</h3>
        <p>{{ 'LES_MEVES_TASQUES.EMPTY_DESC' | translate }}</p>
        <a [routerLink]="getNavUrl('/client/crear-tasca')" class="btn-crear">{{ 'LES_MEVES_TASQUES.BTN_NEW_INCIDENCIA' | translate }}</a>
      </div>

      <app-cancellar-tasca-modal
        *ngIf="tascaPerCancellar"
        [tasca]="tascaPerCancellar"
        (tancat)="tascaPerCancellar = null"
        (enviat)="alCancellacioSollicitada($event)"
      ></app-cancellar-tasca-modal>

      <!-- MODAL D'AVALUACIÓ I FINALITZACIÓ DE TASCA -->
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

          <div class="modal-body" *ngIf="tascaPerFinalitzar">
            <div class="modal-task-summary">
              <span class="badge-categoria">{{ tascaPerFinalitzar.categoria ? (tascaPerFinalitzar.categoria | translate) : '' }}</span>
              <h3>{{ tascaPerFinalitzar.titol }}</h3>
              <p class="summary-pro">
                {{ 'LES_MEVES_TASQUES.PRO_ASSIGNED' | translate }} 
                <strong>
                  <a *ngIf="professionalPerFinalitzar; else noProModal" [routerLink]="[getNavUrl('/perfil'), professionalPerFinalitzar]" class="user-inline-link" title="Veure perfil de {{ professionalPerFinalitzar }}">
                    {{ professionalPerFinalitzar }}
                  </a>
                  <ng-template #noProModal>Professional AVISA</ng-template>
                </strong>
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
              <label for="ressenya-desc">{{ 'TASCA_DETALL.MODAL_COMMENT_LABEL' | translate }}</label>
              <textarea
                id="ressenya-desc"
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
                {{ enviantRessenya ? ('COMMON.CARREGANT' | translate) : ('TASCA_DETALL.BTN_SAVE_REVIEW' | translate) }}
              </button>
              <button
                *ngIf="tascaPerFinalitzar?.estat !== 'Finalitzada'"
                type="button"
                class="btn-skip-review"
                (click)="finalitzarSenseRessenya()"
                [disabled]="enviantRessenya"
              >
                {{ 'TASCA_DETALL.BTN_COMPLETE_PRO' | translate }}
              </button>
            </div>
          </div>
        </div>
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
      color: var(--color-text, #09090c);
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
      background: var(--bg-card, #ffffff);
      border: 1px solid var(--border-subtle, #d6d0c4);
      padding: 0.5rem 1.15rem;
      border-radius: var(--radius-full, 9999px);
      font-size: 0.88rem;
      font-weight: 800;
      color: var(--color-text-muted, #636058);
      cursor: pointer;
      transition: all var(--transition-fast, 0.2s ease);
    }
    .tab-btn:hover {
      border-color: #ff1744;
      color: var(--color-text, #09090c);
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
      grid-template-columns: repeat(auto-fill, minmax(min(100%, 300px), 1fr));
      gap: 1.35rem;
    }
    .tasca-card {
      background: var(--bg-card, #ffffff);
      border: 1px solid var(--border-subtle, #e5e0d7);
      border-radius: var(--radius-md, 14px);
      padding: 1.35rem;
      display: flex;
      flex-direction: column;
      box-shadow: var(--shadow-sm, 0 4px 16px rgba(0, 0, 0, 0.04));
      transition: all var(--transition-fast, 0.2s ease);
    }
    .tasca-card:hover {
      transform: translateY(-2px);
      border-color: #d6d0c4;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
    }
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.85rem;
    }
    .header-nature-group {
      display: flex;
      align-items: center;
      gap: 0.45rem;
    }
    .badge-nature {
      border-radius: 6px;
      padding: 0.2rem 0.55rem;
      font-size: 0.72rem;
      font-weight: 900;
      letter-spacing: 0.05em;
      text-transform: uppercase;
    }
    .badge-nature.is-tasca {
      background: #ecfdf5;
      color: #065f46;
      border: 1px solid #a7f3d0;
    }
    .badge-nature.is-incidencia {
      background: #09090c;
      color: #ffffff;
      border: 1px solid #2b2a36;
    }
    .converged-card {
      border-left: 4px solid #10b981 !important;
    }
    .pro-assigned-item {
      background: var(--pro-card-bg, #ecfdf5);
      border: 1px solid var(--pro-card-border, #a7f3d0);
      padding: 0.45rem 0.75rem;
      border-radius: 8px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 0.5rem;
      width: 100%;
      box-sizing: border-box;
    }
    .pro-assigned-item .meta-label {
      color: var(--pro-card-label, #065f46);
      font-weight: 800;
      font-size: 0.75rem;
      letter-spacing: 0.02em;
      text-transform: uppercase;
    }
    .pro-assigned-val {
      display: inline-flex;
      align-items: center;
      color: var(--pro-card-val, #047857);
    }
    .pro-assigned-val strong {
      color: var(--pro-card-val, #047857);
      font-weight: 900;
    }
    .user-inline-link {
      color: inherit;
      text-decoration: underline;
      text-decoration-color: currentColor;
      text-underline-offset: 3px;
      transition: opacity 0.15s ease;
      cursor: pointer;
    }
    .user-inline-link:hover {
      opacity: 0.8;
    }
    .waiting-item {
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
      gap: 0.5rem;
      width: 100%;
      padding: 0.15rem 0;
    }
    .waiting-badge {
      font-size: 0.82rem;
      color: var(--meta-label-color, #524f48);
      font-style: italic;
      font-weight: 600;
    }
    .badge-categoria {
      background: var(--category-badge-bg, #f0ece3);
      border: 1px solid var(--category-badge-border, #dcd6cb);
      color: var(--category-badge-text, #09090c);
      padding: 0.25rem 0.65rem;
      border-radius: 6px;
      font-size: 0.78rem;
      font-weight: 800;
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
    .estat-sollicitada {
      background: rgba(99, 102, 241, 0.1);
      color: #4338ca;
      border: 1px solid rgba(99, 102, 241, 0.3);
    }
    .estat-revisio {
      background: rgba(234, 88, 12, 0.1);
      color: #c2410c;
      border: 1px solid rgba(234, 88, 12, 0.3);
    }
    .estat-cancellada {
      background: rgba(100, 116, 139, 0.12);
      color: #475569;
      border: 1px solid rgba(100, 116, 139, 0.3);
    }
    .revisio-avis {
      margin: 0.5rem 0 0;
      padding: 0.6rem 0.8rem;
      border-radius: 10px;
      background: #fff7ed;
      border: 1px solid #fed7aa;
      color: #9a3412;
      font-size: 0.82rem;
      font-weight: 700;
    }
    .btn-action.neutral {
      background: #ffffff;
      color: #09090c;
      border-color: #d6d3d1;
    }
    .btn-action.neutral:hover {
      background: #09090c;
      color: #ffffff;
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
      color: var(--color-text, #09090c);
    }
    .tasca-desc {
      margin: 0 0 1.25rem 0;
      color: #636058;
      font-size: 0.9rem;
      line-height: 1.45;
      flex: 1;
    }
    .tasca-meta {
      background: var(--meta-box-bg, #faf8f4);
      border: 1px solid var(--meta-box-border, #e5e0d7);
      padding: 0.85rem 1rem;
      border-radius: 10px;
      margin-bottom: 1.15rem;
      display: flex;
      flex-direction: column;
      gap: 0.6rem;
    }
    .meta-item {
      display: flex;
      flex-direction: column;
    }
    .meta-item.budget-item,
    .meta-item.ofertes-item {
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
      gap: 0.5rem;
      padding: 0.15rem 0;
      width: 100%;
      box-sizing: border-box;
    }
    .meta-label {
      font-size: 0.78rem;
      color: var(--meta-label-color, #524f48);
      font-weight: 700;
    }
    .meta-value.budget {
      font-weight: 900;
      color: var(--meta-budget-color, #b91c1c);
      font-size: 1.05rem;
    }
    .meta-value.ofertes-badge {
      font-weight: 800;
      color: var(--color-text, #09090c);
      font-size: 0.88rem;
    }
    app-contacte-tasca {
      display: block;
      margin-bottom: 1.15rem;
    }
    .card-actions {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
      margin-top: auto;
      padding-top: 0.25rem;
    }
    .btn-action {
      flex: 1;
      padding: 0.6rem 0.85rem;
      border-radius: 8px;
      font-size: 0.84rem;
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
      background: var(--btn-primary-bg, #d5002e);
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
    .btn-action.evaluate-btn {
      background: #fef3c7;
      color: #92400e;
      border-color: #fde68a;
      font-weight: 900;
    }
    .btn-action.evaluate-btn:hover {
      background: #f59e0b;
      color: #ffffff;
      border-color: #f59e0b;
    }
    .btn-action.edit-rate-btn {
      background: #faf8f4;
      color: #636058;
      border-color: #d6d0c4;
      font-weight: 800;
    }
    .btn-action.edit-rate-btn:hover {
      background: #09090c;
      color: #ffffff;
      border-color: #09090c;
    }
    .rating-item {
      background: var(--rating-card-bg, #fffbeb);
      border: 1px solid var(--rating-card-border, #fde68a);
      border-radius: 8px;
      padding: 0.5rem 0.75rem;
      display: flex;
      flex-direction: column;
      gap: 0.3rem;
      width: 100%;
      box-sizing: border-box;
    }
    .rating-item .meta-label {
      color: var(--rating-card-label, #78350f);
      font-weight: 800;
      font-size: 0.75rem;
      letter-spacing: 0.02em;
      text-transform: uppercase;
    }
    .rating-stars {
      color: var(--rating-card-star, #92400e);
      font-weight: 900;
      font-size: 0.92rem;
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 0.35rem;
    }
    .rating-stars svg {
      color: var(--rating-card-star-icon, #b45309);
      fill: currentColor;
    }
    .rating-quote {
      color: var(--rating-card-text, #78350f);
      font-style: italic;
      font-weight: 600;
      font-size: 0.84rem;
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
      color: var(--color-text, #09090c);
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
      color: var(--color-text, #09090c);
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
      background: #f8f6f0;
      border: 1px solid #e5e0d7;
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
      color: var(--color-text, #09090c);
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
      color: var(--color-text, #09090c);
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
      color: var(--color-text, #09090c);
    }

    @media (max-width: 768px) {
      .panell-container {
        padding: 1rem 0.5rem;
      }
      .panell-header {
        flex-direction: column;
        align-items: stretch;
        gap: 0.85rem;
      }
      .panell-header h2 {
        font-size: 1.5rem;
      }
      .btn-crear {
        text-align: center;
        width: 100%;
        box-sizing: border-box;
        display: block;
      }
      .filter-tabs {
        gap: 0.4rem;
        padding-bottom: 0.5rem;
        flex-wrap: wrap;
      }
      .tab-btn {
        padding: 0.45rem 0.85rem;
        font-size: 0.8rem;
      }
      .tasques-grid {
        grid-template-columns: 1fr;
        gap: 1rem;
      }
      .card-actions {
        flex-direction: column;
      }
      .btn-action {
        width: 100%;
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

    /* Mode Fosc (/app) WCAG AA */
    :host-context(.theme-app-dark) .tasca-card {
      background: var(--bg-card, #1e2433);
      border-color: var(--border-card, #43506e);
    }
    :host-context(.theme-app-dark) .tasca-card:hover {
      border-color: var(--border-strong, #5f7098);
    }
    :host-context(.theme-app-dark) .tasca-titol {
      color: var(--color-text, #ffffff);
    }
    :host-context(.theme-app-dark) .tasca-desc {
      color: var(--color-text-muted, #e2e8f0);
    }
    :host-context(.theme-app-dark) .tasca-meta {
      background: var(--meta-box-bg, #181d29);
      border-color: var(--meta-box-border, #333d54);
    }
    :host-context(.theme-app-dark) .meta-label {
      color: var(--meta-label-color, #cbd5e1);
    }
    :host-context(.theme-app-dark) .waiting-badge {
      color: var(--meta-label-color, #cbd5e1);
    }
    :host-context(.theme-app-dark) .meta-value.ofertes-badge {
      color: var(--color-text, #ffffff);
    }
    :host-context(.theme-app-dark) .pro-assigned-item {
      background: var(--pro-card-bg, rgba(16, 185, 129, 0.15));
      border-color: var(--pro-card-border, rgba(52, 211, 153, 0.38));
    }
    :host-context(.theme-app-dark) .pro-assigned-item .meta-label {
      color: var(--pro-card-label, #6ee7b7);
    }
    :host-context(.theme-app-dark) .pro-assigned-val,
    :host-context(.theme-app-dark) .pro-assigned-val strong {
      color: var(--pro-card-val, #a7f3d0);
    }
    :host-context(.theme-app-dark) .rating-item {
      background: var(--rating-card-bg, rgba(245, 158, 11, 0.15));
      border-color: var(--rating-card-border, rgba(245, 158, 11, 0.38));
    }
    :host-context(.theme-app-dark) .rating-item .meta-label {
      color: var(--rating-card-label, #fde68a);
    }
    :host-context(.theme-app-dark) .rating-stars {
      color: var(--rating-card-star, #fbbf24);
    }
    :host-context(.theme-app-dark) .rating-stars svg {
      color: var(--rating-card-star-icon, #fbbf24);
    }
    :host-context(.theme-app-dark) .rating-quote {
      color: var(--rating-card-text, #fef3c7);
    }
    :host-context(.theme-app-dark) .badge-categoria {
      background: var(--category-badge-bg, #272f42);
      border-color: var(--category-badge-border, #43506e);
      color: var(--category-badge-text, #ffffff);
    }
    :host-context(.theme-app-dark) .meta-value.budget {
      color: var(--meta-budget-color, #ff6b8b);
    }
    :host-context(.theme-app-dark) .btn-action.neutral {
      background: var(--bg-surface, #272f42);
      color: var(--color-text, #ffffff);
      border-color: var(--border-card, #43506e);
    }
    :host-context(.theme-app-dark) .btn-action.neutral:hover {
      background: #09090c;
      color: #ffffff;
    }
    :host-context(.theme-app-dark) .modal-dialog {
      background: var(--bg-card, #1e2433);
      border-color: var(--border-card, #43506e);
      color: var(--color-text, #ffffff);
    }
    :host-context(.theme-app-dark) .modal-header {
      background: var(--bg-surface, #272f42);
      border-color: var(--border-card, #43506e);
    }
    :host-context(.theme-app-dark) .modal-task-summary {
      background: var(--bg-surface, #272f42);
      border-color: var(--border-card, #43506e);
    }
    :host-context(.theme-app-dark) .summary-pro {
      color: var(--color-text-muted, #e2e8f0);
    }
    :host-context(.theme-app-dark) .comment-input-group textarea {
      background: var(--bg-input, #181d29);
      border-color: var(--border-card, #43506e);
      color: var(--color-text, #ffffff);
    }
    :host-context(.theme-app-dark) .btn-close-modal {
      background: var(--bg-surface-elevated, #323b52);
      color: var(--color-text, #ffffff);
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
  /** Estat del modal de finalització i avaluació */
  modalFinalitzarObert = false;
  tascaPerFinalitzar: Tasca | null = null;
  professionalPerFinalitzar = '';
  puntuacioSeleccionada = 5;
  ressenyaDescripcio = '';
  enviantRessenya = false;
  /** Tasca per a la qual s'està sol·licitant la cancel·lació */
  tascaPerCancellar: Tasca | null = null;

  constructor(
    private readonly incidenciaService: IncidenciaService,
    private readonly tascaService: TascaService,
    private readonly interesService: InteresService,
    private readonly pressupostService: PressupostService,
    private readonly resenyaService: ResenyaService,
    private readonly authService: AuthService,
    private readonly confirmService: ConfirmService,
    private readonly router: Router
  ) {}

  get isAppPage(): boolean {
    const url = this.router.url || '';
    return url.startsWith('/app');
  }

  goBack(): void {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      window.history.back();
    } else {
      this.router.navigate([this.getNavUrl('/inici')]);
    }
  }

  getNavUrl(path: string): string {
    if (this.isAppPage) {
      if (path === '/' || path === '/inici' || path === '/app') return '/app';
      if (path.startsWith('/app/')) return path;
      return path.startsWith('/') ? `/app${path}` : `/app/${path}`;
    }
    return path;
  }

  /**
   * Cicle de vida inicial del component: carrega les tasques del client connectat.
   */
  ngOnInit(): void {
    this.carregarTasques();
  }

  /** Una incidència pròpia, encara sense professional assignat */
  esIncidencia(t: Tasca): boolean {
    return t.tipus === 'incidencia';
  }

  /** Una sol·licitud d'oferta pendent que el professional encara ha d'acceptar */
  esSollicitud(t: Tasca): boolean {
    return t.tipus === 'sollicitud';
  }

  /** Treball acordat entre client i professional */
  isTascaConvergida(t: Tasca): boolean {
    return t.tipus === 'tasca';
  }

  /** El contacte només és visible quan el professional ja ha acceptat el treball */
  teContacte(t: Tasca): boolean {
    return !!t.professionalId && ['En curs', 'En revisió', 'Finalitzada'].includes(t.estat || '');
  }

  /**
   * Retorna les tasques o incidències filtrades segons la pestanya seleccionada.
   */
  get tasquesFiltrades(): Tasca[] {
    switch (this.filtreActiu) {
      case 'sollicitada': return this.tasques.filter(t => this.esSollicitud(t));
      case 'oberta': return this.tasques.filter(t => this.esIncidencia(t) && t.estat === 'Oberta');
      case 'en_curs': return this.tasques.filter(t => t.estat === 'En curs' || t.estat === 'En revisió');
      case 'finalitzada': return this.tasques.filter(t => t.estat === 'Finalitzada');
      case 'cancellada': return this.tasques.filter(t => t.estat === 'Cancel·lada');
      default: return this.tasques;
    }
  }

  countSollicituds(): number {
    return this.tasques.filter(t => this.esSollicitud(t)).length;
  }

  countIncidencies(): number {
    return this.tasques.filter(t => this.esIncidencia(t) && t.estat === 'Oberta').length;
  }

  countEnCurs(): number {
    return this.tasques.filter(t => t.estat === 'En curs' || t.estat === 'En revisió').length;
  }

  countFinalitzades(): number {
    return this.tasques.filter(t => t.estat === 'Finalitzada').length;
  }

  countCancellades(): number {
    return this.tasques.filter(t => t.estat === 'Cancel·lada').length;
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
   * Carrega les tasques, les incidències i les sol·licituds pendents del client actual.
   * Es consulta per identificador: dos usuaris poden compartir nom.
   */
  carregarTasques(): void {
    this.loading = true;
    this.errorMsg = '';
    const user = this.authService.getCurrentUser();

    if (!user) {
      this.router.navigate([this.getNavUrl('/login')]);
      return;
    }

    forkJoin({
      tasques: this.tascaService.getByClient(user.id).pipe(catchError(() => of([] as Tasca[]))),
      incidencies: this.incidenciaService.getByClient(user.id).pipe(catchError(() => of([]))),
      interessos: this.interesService.getByClient(user.id).pipe(catchError(() => of([] as Interes[])))
    }).subscribe({
      next: ({ tasques, incidencies, interessos }) => {
        // Només incidències obertes: si ja han passat a ser tasca, es retiren
        const tasquesPublicacioIds = new Set(tasques.map(t => (t as any).publicacioId || t.id));
        const incidenciesMapped: Tasca[] = incidencies
          .filter((inc) => (!inc.estat || inc.estat.toLowerCase() === 'oberta') && !tasquesPublicacioIds.has(inc.id))
          .map((inc) => ({
            id: inc.id,
            titol: inc.titol,
            descripcio: inc.descripcio,
            categoria: inc.categoria,
            clientId: inc.clientId,
            client: inc.clientNom || inc.client || user.nom,
            clientNom: inc.clientNom || inc.client || user.nom,
            professional: undefined,
            professionalNom: undefined,
            budget: inc.budget,
            estat: inc.estat || '',
            tipus: 'incidencia',
            createdAt: inc.createdAt
          }));

        // Només les sol·licituds que el professional encara no ha acceptat: les acceptades ja són tasques
        const sollicituds: Tasca[] = interessos
          .filter((i) => !i.tascaId)
          .map((i) => ({
            id: i.id,
            titol: i.publicacioTitol || '',
            descripcio: '',
            clientId: i.clientId,
            client: i.clientNom,
            clientNom: i.clientNom,
            professionalId: i.professionalId,
            professional: i.professionalNom,
            professionalNom: i.professionalNom,
            publicacioId: i.publicacioId,
            estat: 'Sol·licitada',
            tipus: 'sollicitud',
            createdAt: i.dataCreacio
          }));

        this.tasques = [...sollicituds, ...tasques, ...incidenciesMapped];
        this.loading = false;
        this.carregarRecompteOfertes();
      },
      error: () => {
        this.errorMsg = 'Error en carregar les teves tasques i incidències.';
        this.loading = false;
      }
    });
  }

  /**
   * Consulta el nombre de pressupostos vigents de cada incidència oberta.
   */
  private carregarRecompteOfertes(): void {
    this.tasques.filter(t => this.esIncidencia(t)).forEach(t => {
      this.pressupostService.getByIncidencia(t.id).subscribe({
        next: (pressupostos) => {
          this.ofertesCount[t.id] = pressupostos.length;
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
    switch (estat) {
      case 'Sol·licitada': return 'estat-sollicitada';
      case 'Oberta': return 'estat-oberta';
      case 'En curs': return 'estat-en-curs';
      case 'En revisió': return 'estat-revisio';
      case 'Finalitzada': return 'estat-finalitzada';
      case 'Cancel·lada': case 'Tancada': return 'estat-cancellada';
      default: return '';
    }
  }

  /**
   * Obre el modal per avaluar el professional i finalitzar la tasca.
   */
  obrirModalFinalitzar(t: Tasca): void {
    this.tascaPerFinalitzar = t;
    this.puntuacioSeleccionada = t.valoracio || 5;
    this.ressenyaDescripcio = t.comentari || '';
    this.professionalPerFinalitzar = t.professionalNom || t.professional || '';
    this.modalFinalitzarObert = true;
  }

  tancarModalFinalitzar(): void {
    this.modalFinalitzarObert = false;
    this.tascaPerFinalitzar = null;
    this.professionalPerFinalitzar = '';
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
   * Desa la valoració del client. Si la tasca encara és en curs, la finalitza i la valora d'una vegada.
   */
  confirmarFinalitzacioAmbRessenya(): void {
    if (!this.tascaPerFinalitzar) return;
    const t = this.tascaPerFinalitzar;
    this.enviantRessenya = true;
    const textDesc = this.ressenyaDescripcio.trim() || 'Feina completada amb èxit i total satisfacció.';
    const dades = { valoracio: this.puntuacioSeleccionada, comentari: textDesc };
    const peticio$ = t.estat === 'En curs' ? this.tascaService.complete(t.id, dades) : this.tascaService.avaluar(t.id, dades);

    peticio$.subscribe({
      next: () => {
        this.enviantRessenya = false;
        this.tancarModalFinalitzar();
        this.successMsg = 'Valoració enregistrada amb èxit!';
        this.carregarTasques();
        setTimeout(() => this.successMsg = '', 4000);
      },
      error: (e) => {
        this.enviantRessenya = false;
        this.errorMsg = e?.error?.error || 'Error en desar la valoració.';
      }
    });
  }

  /**
   * Finalitza la tasca sense emetre cap valoració.
   */
  finalitzarSenseRessenya(): void {
    if (!this.tascaPerFinalitzar) return;
    const id = this.tascaPerFinalitzar.id;
    this.enviantRessenya = true;

    this.tascaService.complete(id).subscribe({
      next: () => {
        this.enviantRessenya = false;
        this.tancarModalFinalitzar();
        this.successMsg = 'Tasca finalitzada correctament!';
        this.carregarTasques();
        setTimeout(() => this.successMsg = '', 3000);
      },
      error: (e) => {
        this.enviantRessenya = false;
        this.errorMsg = e?.error?.error || 'Error en finalitzar la tasca.';
      }
    });
  }

  alCancellacioSollicitada(tasca: Tasca): void {
    this.tascaPerCancellar = null;
    this.successMsg = 'TREBALL.CANCEL_SENT_OK';
    this.carregarTasques();
    setTimeout(() => this.successMsg = '', 4000);
  }

  /** Tanca la incidència: els pressupostos pendents es rebutgen i els professionals reben un avís */
  async tancarIncidencia(t: Tasca): Promise<void> {
    const confirmacio = await this.confirmService.confirm({
      title: 'TREBALL.CLOSE_INCIDENT_TITLE',
      message: 'TREBALL.CLOSE_INCIDENT_MSG',
      confirmText: 'TREBALL.CLOSE_INCIDENT_BTN',
      cancelText: 'COMMON.CANCEL_LAR',
      isDanger: true,
      icon: 'warning'
    });
    if (!confirmacio) return;
    this.incidenciaService.close(t.id).subscribe({
      next: () => {
        this.successMsg = 'TREBALL.CLOSE_INCIDENT_OK';
        this.carregarTasques();
        setTimeout(() => this.successMsg = '', 4000);
      },
      error: (e) => (this.errorMsg = e?.error?.error || 'Error en tancar la incidència.')
    });
  }

  /** El client retira la seua sol·licitud sense passar per l'administrador */
  async retirarSollicitud(t: Tasca): Promise<void> {
    const confirmacio = await this.confirmService.confirm({
      title: 'TREBALL.SOL_WITHDRAW_TITLE',
      message: 'TREBALL.SOL_WITHDRAW_MSG',
      confirmText: 'TREBALL.SOL_WITHDRAW',
      cancelText: 'COMMON.CANCEL_LAR',
      isDanger: true,
      icon: 'warning'
    });
    if (!confirmacio) return;
    this.interesService.withdraw(t.id).subscribe({
      next: () => {
        this.successMsg = 'TREBALL.SOL_WITHDRAW_OK';
        this.carregarTasques();
        setTimeout(() => this.successMsg = '', 4000);
      },
      error: (e) => (this.errorMsg = e?.error?.error || 'Error en retirar la sol·licitud.')
    });
  }

  /** Només s'esborra una incidència; si ja té pressupostos, el back ho rebutja amb un missatge */
  async eliminarIncidencia(t: Tasca): Promise<void> {
    const confirmacio = await this.confirmService.confirm({
      title: 'CONFIRM_MODAL.DELETE_TASK_TITLE',
      message: 'CONFIRM_MODAL.DELETE_TASK_MSG',
      confirmText: 'COMMON.BORRAR',
      cancelText: 'COMMON.CANCEL_LAR',
      isDanger: true,
      icon: 'danger'
    });
    if (!confirmacio) return;

    this.incidenciaService.delete(t.id).subscribe({
      next: () => {
        this.tasques = this.tasques.filter(item => item.id !== t.id);
        this.successMsg = 'Element eliminat amb èxit.';
        setTimeout(() => this.successMsg = '', 3000);
      },
      error: (e) => {
        this.errorMsg = e?.error?.error || 'Error en eliminar l’element.';
      }
    });
  }
}
