import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { TascaService } from '../../../services/tasca.service';
import { IncidenciaService } from '../../../services/incidencia.service';
import { OfertaService } from '../../../services/oferta.service';
import { ResenyaService } from '../../../services/resenya.service';
import { AuthService } from '../../../core/services/auth.service';
import { ConfirmService } from '../../../core/services/confirm.service';
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
 * - Accedir a la revisió d'ofertes o donar per finalitzat el servei amb valoració.
 * - Eliminar tasques publicades.
 */
import { TranslatePipe } from '../../../core/pipes/translate.pipe';

@Component({
  selector: 'app-les-meves-tasques',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TranslatePipe],
  template: `
    <div class="panell-container">
      <div class="panell-header">
        <div>
          <h2>{{ 'LES_MEVES_TASQUES.TITLE' | translate }}</h2>
          <p class="subtitle">{{ 'LES_MEVES_TASQUES.SUBTITLE' | translate }}</p>
        </div>
        <div>
          <a routerLink="/client/crear-tasca" class="btn-crear">
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
      </div>

      <!-- Missatges d'estat -->
      <div *ngIf="loading" class="state-box">{{ 'COMMON.CARREGANT' | translate }}</div>
      <div *ngIf="errorMsg" class="alert-error">{{ errorMsg }}</div>
      <div *ngIf="successMsg" class="alert-success">{{ successMsg }}</div>

      <!-- Llista de tasques -->
      <div class="tasques-grid" *ngIf="!loading && tasquesFiltrades.length > 0">
        <div *ngFor="let t of tasquesFiltrades" class="tasca-card" [class.converged-card]="isTascaConvergida(t)">
          <div class="card-header">
            <div class="header-nature-group">
              <span class="badge-nature" [ngClass]="isTascaConvergida(t) ? 'is-tasca' : 'is-incidencia'">
                {{ isTascaConvergida(t) ? ('LES_MEVES_TASQUES.NATURE_TASK' | translate) : ('LES_MEVES_TASQUES.NATURE_INCIDENCIA' | translate) }}
              </span>
              <span class="badge-categoria">{{ t.categoria ? (t.categoria | translate) : ('CATEGORIES.Altres Serveis' | translate) }}</span>
            </div>
            <span class="badge-estat" [ngClass]="getEstatClass(t.estat)">{{ t.estat ? (t.estat | translate) : '' }}</span>
          </div>

          <h3 class="tasca-titol">{{ t.titol }}</h3>
          <p class="tasca-desc">{{ t.descripcio }}</p>

          <div class="tasca-meta">
            <!-- Professional assignat si és tasca en curs o finalitzada -->
            <div class="meta-item pro-assigned-item" *ngIf="isTascaConvergida(t)">
              <span class="meta-label">{{ 'LES_MEVES_TASQUES.PRO_ASSIGNED' | translate }}</span>
              <span class="meta-value pro-assigned-val">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: -2px; margin-right: 4px;">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                <a [routerLink]="['/perfil', t.professionalNom || t.professional]" class="user-inline-link">
                  <strong>{{ t.professionalNom || t.professional }}</strong>
                </a>
              </span>
            </div>

            <!-- Sense professional si és incidència oberta -->
            <div class="meta-item waiting-item" *ngIf="!isTascaConvergida(t)">
              <span class="meta-label">{{ 'LES_MEVES_TASQUES.PRO_STATUS' | translate }}</span>
              <span class="meta-value waiting-badge">{{ 'LES_MEVES_TASQUES.NO_PRO_ASSIGNED' | translate }}</span>
            </div>

            <div class="meta-item">
              <span class="meta-label">{{ isTascaConvergida(t) ? ('LES_MEVES_TASQUES.AGREED_PRICE' | translate) : ('LES_MEVES_TASQUES.ESTIMATED_BUDGET' | translate) }}</span>
              <span class="meta-value budget">{{ t.budget }}</span>
            </div>

            <div class="meta-item" *ngIf="!isTascaConvergida(t) && ofertesCount[t.id] !== undefined">
              <span class="meta-label">{{ 'LES_MEVES_TASQUES.QUOTES_RECEIVED' | translate }}</span>
              <span class="meta-value ofertes-badge">{{ ofertesCount[t.id] }} {{ 'LES_MEVES_TASQUES.QUOTES_COUNT' | translate }}</span>
            </div>

            <!-- Mostra la valoració si ja ha estat avaluada -->
            <div class="meta-item rating-item" *ngIf="t.valoracio">
              <span class="meta-label">{{ 'LES_MEVES_TASQUES.YOUR_RATING' | translate }}</span>
              <span class="meta-value rating-stars">
                ★ {{ t.valoracio }}/5
                <span *ngIf="t.opinio" class="rating-quote">"{{ t.opinio }}"</span>
              </span>
            </div>
          </div>

          <div class="card-actions">
            <a [routerLink]="['/tasca-detall', t.id]" class="btn-action primary">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: -2px; margin-right: 5px;">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              {{ isTascaConvergida(t) ? ('TASQUES_OFERTES.VEURE_SEGUIMENT' | translate) : ('LES_MEVES_TASQUES.BTN_REVIEW_QUOTES' | translate) + ' (' + (ofertesCount[t.id] || 0) + ')' }}
            </a>

            <!-- Si ja està finalitzada però encara no s'ha avaluat -->
            <button
              *ngIf="isTascaConvergida(t) && t.estat === 'Finalitzada' && !t.valoracio"
              type="button"
              class="btn-action evaluate-btn"
              (click)="obrirModalFinalitzar(t)"
              title="Avaluar el servei rebut per a aquesta tasca"
            >
              ★ {{ 'TASCA_DETALL.BTN_EVALUATE' | translate }}
            </button>

            <button
              type="button"
              class="btn-action danger"
              (click)="eliminarTasca(t.id)"
            >
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: -2px; margin-right: 4px;">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
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
        <a routerLink="/client/crear-tasca" class="btn-crear">{{ 'LES_MEVES_TASQUES.BTN_NEW_INCIDENCIA' | translate }}</a>
      </div>

      <!-- MODAL D'AVALUACIÓ I FINALITZACIÓ DE TASCA -->
      <div class="modal-backdrop" *ngIf="modalFinalitzarObert" (click)="tancarModalFinalitzar()">
        <div class="modal-dialog" (click)="$event.stopPropagation()">
          <header class="modal-header">
            <div>
              <span class="modal-badge-tag">{{ 'TASCA_DETALL.REVIEW_HEADER' | translate }}</span>
              <h2>{{ 'TASCA_DETALL.MODAL_EVALUATE_TITLE' | translate }}</h2>
            </div>
            <button type="button" class="btn-close-modal" (click)="tancarModalFinalitzar()" aria-label="Tancar">✕</button>
          </header>

          <div class="modal-body" *ngIf="tascaPerFinalitzar">
            <div class="modal-task-summary">
              <span class="badge-categoria">{{ tascaPerFinalitzar.categoria ? (tascaPerFinalitzar.categoria | translate) : '' }}</span>
              <h3>{{ tascaPerFinalitzar.titol }}</h3>
              <p class="summary-pro">
                {{ 'LES_MEVES_TASQUES.PRO_ASSIGNED' | translate }} 
                <strong>
                  <a *ngIf="professionalPerFinalitzar; else noProModal" [routerLink]="['/perfil', professionalPerFinalitzar]" class="user-inline-link" title="Veure perfil de {{ professionalPerFinalitzar }}">
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
                  ★
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
      grid-column: 1 / -1;
      background: #ecfdf5;
      padding: 0.4rem 0.65rem;
      border-radius: 6px;
      border: 1px solid #d1fae5;
    }
    .pro-assigned-val strong {
      color: #059669;
    }
    .user-inline-link {
      color: inherit;
      text-decoration: underline;
      text-decoration-color: rgba(5, 150, 105, 0.45);
      text-underline-offset: 3px;
      transition: color 0.15s ease, text-decoration-color 0.15s ease;
      cursor: pointer;
    }
    .user-inline-link:hover {
      color: #059669 !important;
      text-decoration-color: #059669;
    }
    .waiting-badge {
      font-size: 0.8rem;
      color: #78716c;
      font-style: italic;
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
      background: #fffbeb;
      border: 1px solid #fef3c7;
      border-radius: 6px;
      padding: 0.35rem 0.6rem;
      grid-column: 1 / -1;
    }
    .rating-stars {
      color: #f59e0b;
      font-weight: 900;
      font-size: 0.92rem;
    }
    .rating-quote {
      color: #78350f;
      font-style: italic;
      font-weight: 500;
      font-size: 0.82rem;
      margin-left: 0.5rem;
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
        overflow-x: auto;
        padding-bottom: 0.5rem;
        flex-wrap: nowrap;
        -webkit-overflow-scrolling: touch;
      }
      .tab-btn {
        white-space: nowrap;
        padding: 0.45rem 0.85rem;
        font-size: 0.8rem;
        flex-shrink: 0;
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

  constructor(
    private readonly incidenciaService: IncidenciaService,
    private readonly tascaService: TascaService,
    private readonly ofertaService: OfertaService,
    private readonly resenyaService: ResenyaService,
    private readonly authService: AuthService,
    private readonly confirmService: ConfirmService,
    private readonly router: Router
  ) {}

  /**
   * Cicle de vida inicial del component: carrega les tasques del client connectat.
   */
  ngOnInit(): void {
    this.carregarTasques();
  }

  /**
   * Determina si l'element és una Tasca acordada (ja convergeixen client i professional)
   * o si és una Incidència oberta (sols té client, cercant professional).
   */
  isTascaConvergida(t: Tasca): boolean {
    return t.tipus === 'tasca' || !!(t.professional || t.professionalNom);
  }

  /**
   * Retorna les tasques o incidències filtrades segons la pestanya seleccionada.
   */
  get tasquesFiltrades(): Tasca[] {
    if (this.filtreActiu === 'oberta') {
      return this.tasques.filter(t => !this.isTascaConvergida(t) && t.estat?.toLowerCase().includes('obert'));
    }
    if (this.filtreActiu === 'en_curs') {
      return this.tasques.filter(t => this.isTascaConvergida(t) && t.estat?.toLowerCase().includes('curs'));
    }
    if (this.filtreActiu === 'finalitzada') {
      return this.tasques.filter(t => t.estat?.toLowerCase().includes('finalitzad'));
    }
    return this.tasques;
  }

  countIncidencies(): number {
    return this.tasques.filter(t => !this.isTascaConvergida(t) && t.estat?.toLowerCase().includes('obert')).length;
  }

  countEnCurs(): number {
    return this.tasques.filter(t => this.isTascaConvergida(t) && t.estat?.toLowerCase().includes('curs')).length;
  }

  countFinalitzades(): number {
    return this.tasques.filter(t => t.estat?.toLowerCase().includes('finalitzad')).length;
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
   * Carrega les tasques i incidències associades al client actual des de l'API.
   */
  carregarTasques(): void {
    this.loading = true;
    this.errorMsg = '';
    const user = this.authService.getCurrentUser();

    if (!user) {
      this.router.navigate(['/login']);
      return;
    }

    forkJoin({
      tasques: this.tascaService.getByClient(user.nom).pipe(catchError(() => of([]))),
      incidencies: this.incidenciaService.getByClient(user.nom).pipe(catchError(() => of([])))
    }).subscribe({
      next: ({ tasques, incidencies }) => {
        const incidenciesMapped: Tasca[] = incidencies.map((inc) => ({
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

        const existingIds = new Set(tasques.map((t) => t.id));
        const filteredInc = incidenciesMapped.filter((i) => !existingIds.has(i.id));

        this.tasques = [...tasques, ...filteredInc];
        this.loading = false;
        // Carrega el recompte d'ofertes per a cadascuna de les tasques / incidències
        this.carregarRecompteOfertes();
      },
      error: () => {
        this.errorMsg = 'Error en carregar les teves tasques i incidències.';
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
   * Obre el modal per avaluar el professional i finalitzar la tasca.
   */
  obrirModalFinalitzar(t: Tasca): void {
    this.tascaPerFinalitzar = t;
    this.puntuacioSeleccionada = t.valoracio || 5;
    this.ressenyaDescripcio = t.opinio || '';
    this.professionalPerFinalitzar = t.professionalNom || t.professional || '';
    this.modalFinalitzarObert = true;

    // Si encara no està definit el professional a la tasca, consulta l'oferta acceptada
    if (!this.professionalPerFinalitzar) {
      this.ofertaService.getByTasca(t.id).subscribe({
        next: (ofertes) => {
          const acc = ofertes.find(o => o.estat === 'Acceptada') || ofertes[0];
          if (acc) {
            this.professionalPerFinalitzar = acc.professional;
          }
        }
      });
    }
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
   * Envia la valoració del professional i marca la tasca com a Finalitzada (desat a la taula tasques).
   */
  confirmarFinalitzacioAmbRessenya(): void {
    if (!this.tascaPerFinalitzar) return;
    const t = this.tascaPerFinalitzar;
    this.enviantRessenya = true;
    const textDesc = this.ressenyaDescripcio.trim() || 'Feina completada amb èxit i total satisfacció.';

    this.tascaService.avaluar(t.id, {
      valoracio: this.puntuacioSeleccionada,
      opinio: textDesc
    }).subscribe({
      next: (updatedTask) => {
        this.enviantRessenya = false;
        this.tancarModalFinalitzar();
        this.successMsg = 'Valoració enregistrada amb èxit!';
        const target = this.tasques.find(item => item.id === t.id);
        if (target) {
          target.estat = 'Finalitzada';
          target.valoracio = this.puntuacioSeleccionada;
          target.opinio = textDesc;
        }
        setTimeout(() => this.successMsg = '', 4000);
      },
      error: (err) => {
        // Fallback per compatibilitat amb complete
        this.tascaService.complete(t.id, {
          valoracio: this.puntuacioSeleccionada,
          opinio: textDesc
        }).subscribe({
          next: () => {
            this.enviantRessenya = false;
            this.tancarModalFinalitzar();
            this.successMsg = 'Valoració enregistrada amb èxit!';
            const target = this.tasques.find(item => item.id === t.id);
            if (target) {
              target.estat = 'Finalitzada';
              target.valoracio = this.puntuacioSeleccionada;
              target.opinio = textDesc;
            }
            setTimeout(() => this.successMsg = '', 4000);
          },
          error: (e) => {
            this.enviantRessenya = false;
            this.errorMsg = e?.error || 'Error en desar la valoració. Recorda que només es pot avaluar un cop acabada la tasca.';
          }
        });
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
        const target = this.tasques.find(t => t.id === id);
        if (target) target.estat = 'Finalitzada';
        setTimeout(() => this.successMsg = '', 3000);
      },
      error: () => {
        this.enviantRessenya = false;
        this.errorMsg = 'Error en finalitzar la tasca.';
      }
    });
  }

  /**
   * Elimina una tasca o incidència de la base de dades.
   * @param id Identificador de l'element a suprimir
   */
  async eliminarTasca(id: string): Promise<void> {
    const confirmacio = await this.confirmService.confirm({
      title: 'CONFIRM_MODAL.DELETE_TASK_TITLE',
      message: 'CONFIRM_MODAL.DELETE_TASK_MSG',
      confirmText: 'COMMON.BORRAR',
      cancelText: 'COMMON.CANCEL_LAR',
      isDanger: true,
      icon: 'danger'
    });
    if (!confirmacio) return;

    const delete$ = id.startsWith('I-')
      ? this.incidenciaService.delete(id)
      : this.tascaService.delete(id);

    delete$.subscribe({
      next: () => {
        this.tasques = this.tasques.filter(t => t.id !== id);
        this.successMsg = 'Element eliminat amb èxit.';
        setTimeout(() => this.successMsg = '', 3000);
      },
      error: () => {
        this.errorMsg = 'Error en eliminar l’element.';
      }
    });
  }
}
