import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TascaService } from '../../../services/tasca.service';
import { OfertaService } from '../../../services/oferta.service';
import { IncidenciaService } from '../../../services/incidencia.service';
import { UsuariService } from '../../../services/usuari.service';
import { AvisService } from '../../../services/avis.service';
import { BlacklistService } from '../../../services/blacklist.service';
import { PressupostService } from '../../../services/pressupost.service';
import { ResenyaService } from '../../../services/resenya.service';
import { Tasca } from '../../../models/tasca.model';
import { Oferta } from '../../../models/oferta.model';
import { Incidencia } from '../../../models/incidencia.model';
import { Usuari } from '../../../models/usuari.model';
import { BlacklistTelefon } from '../../../models/blacklist.model';
import { Pressupost } from '../../../models/pressupost.model';
import { Resenya } from '../../../models/resenya.model';
import { Avis } from '../../../models/avis.model';
import { AuthService } from '../../../core/services/auth.service';
import { ConfirmService } from '../../../core/services/confirm.service';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';

/**
 * Pestanya activa al panell d'administració.
 */
type AdminTab = 'tasques' | 'ofertes' | 'incidencies' | 'pressupostos' | 'usuaris' | 'blacklist' | 'resenyes' | 'avisos';

/**
 * Component del Panell d'Administració Global (/admin/panell).
 * Accessible exclusivament per a usuaris amb rol d'administrador (`admin`, com `admin@admin`).
 * Proporciona:
 * 1. Resum i mètriques globals del sistema (usuaris, tasques, ofertes, avisos).
 * 2. Llistat complet i auditable de totes les tasques de la plataforma amb cerca i filtres.
 * 3. Llistat complet de totes les ofertes i propostes econòmiques presentades.
 * 4. Gestió d'usuaris registrats i visualització de rols.
 * 5. Accions administratives de moderació (finalitzar tasques, acceptar/rebutjar ofertes, eliminar elements).
 */
@Component({
  selector: 'app-admin-panell',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TranslatePipe],
  template: `
    <div class="admin-container">
      <!-- Capçalera del Panell -->
      <div class="admin-header">
        <div class="title-group">
          <div class="admin-badge">{{ 'ADMIN.BADGE' | translate }}</div>
          <h2>{{ 'ADMIN.TITLE' | translate }}</h2>
          <p class="subtitle">{{ 'ADMIN.SUBTITLE' | translate }}</p>
        </div>
        <div class="refresh-group">
          <button type="button" class="btn-refresh" (click)="carregarDades()" [disabled]="loading">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: -2px; margin-right: 4px;">
              <polyline points="23 4 23 10 17 10"></polyline>
              <polyline points="1 20 1 14 7 14"></polyline>
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
            </svg>
            {{ loading ? ('ADMIN.REFRESHING' | translate) : ('ADMIN.BTN_REFRESH' | translate) }}
          </button>
        </div>
      </div>

      <!-- Mètriques globals interactives -->
      <div class="metrics-grid">
        <div
          class="metric-card"
          [class.active-card]="tabActiva === 'tasques'"
          (click)="canviarTab('tasques')"
          role="button"
          tabindex="0"
          title="Veure i filtrar tasques"
        >
          <span class="metric-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
              <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
              <line x1="9" y1="12" x2="15" y2="12"></line>
              <line x1="9" y1="16" x2="15" y2="16"></line>
            </svg>
          </span>
          <div class="metric-info">
            <span class="metric-value">{{ tasques.length }}</span>
            <span class="metric-label">{{ 'ADMIN.METRIC_TASKS' | translate }}</span>
            <small class="metric-sub">
              <span class="clickable-sub" (click)="filtrarPerEstatTasca('curs', $event)">{{ countTasquesEnCurs() }} en curs</span> ·
              <span class="clickable-sub" (click)="filtrarPerEstatTasca('finalitzad', $event)">{{ countTasquesFinalitzades() }} fetes</span>
            </small>
          </div>
        </div>

        <div
          class="metric-card"
          [class.active-card]="tabActiva === 'ofertes'"
          (click)="canviarTab('ofertes')"
          role="button"
          tabindex="0"
          title="Veure llistat d'ofertes de professionals"
        >
          <span class="metric-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
            </svg>
          </span>
          <div class="metric-info">
            <span class="metric-value">{{ ofertes.length }}</span>
            <span class="metric-label">{{ 'ADMIN.METRIC_OFFERS' | translate }}</span>
            <small class="metric-sub">{{ ofertes.length }} {{ 'MERCAT.AVAILABLE' | translate }}</small>
          </div>
        </div>

        <div
          class="metric-card"
          [class.active-card]="tabActiva === 'incidencies'"
          (click)="canviarTab('incidencies')"
          role="button"
          tabindex="0"
          title="Veure llistat d'incidències de clients"
        >
          <span class="metric-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          </span>
          <div class="metric-info">
            <span class="metric-value">{{ incidencies.length }}</span>
            <span class="metric-label">{{ 'ADMIN.METRIC_INCIDENCIES' | translate }}</span>
            <small class="metric-sub">{{ incidencies.length }} {{ 'MERCAT.AVAILABLE' | translate }}</small>
          </div>
        </div>

        <div
          class="metric-card"
          [class.active-card]="tabActiva === 'usuaris'"
          (click)="canviarTab('usuaris')"
          role="button"
          tabindex="0"
          title="Veure usuaris del sistema"
        >
          <span class="metric-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
          </span>
          <div class="metric-info">
            <span class="metric-value">{{ usuaris.length }}</span>
            <span class="metric-label">{{ 'ADMIN.METRIC_USERS' | translate }}</span>
            <small class="metric-sub">
              <span class="clickable-sub" (click)="filtrarPerRolUsuari('client', $event)">{{ countClients() }} clients</span> ·
              <span class="clickable-sub" (click)="filtrarPerRolUsuari('professional', $event)">{{ countProfessionals() }} prof.</span>
            </small>
          </div>
        </div>

        <div
          class="metric-card"
          [class.active-card]="tabActiva === 'pressupostos'"
          (click)="canviarTab('pressupostos')"
          role="button"
          tabindex="0"
          title="Veure i supervisar pressupostos privats"
        >
          <span class="metric-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <rect x="2" y="4" width="20" height="16" rx="2"></rect>
              <line x1="2" y1="10" x2="22" y2="10"></line>
              <line x1="12" y1="14" x2="16" y2="14"></line>
            </svg>
          </span>
          <div class="metric-info">
            <span class="metric-value">{{ pressupostos.length }}</span>
            <span class="metric-label">{{ 'ADMIN.METRIC_PRESSUPOSTOS' | translate }}</span>
            <small class="metric-sub">{{ pressupostos.length }} propostes privades</small>
          </div>
        </div>

        <div
          class="metric-card"
          [class.active-card]="tabActiva === 'resenyes'"
          (click)="canviarTab('resenyes')"
          role="button"
          tabindex="0"
          title="Veure ressenyes i opinions"
        >
          <span class="metric-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="#f59e0b" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
            </svg>
          </span>
          <div class="metric-info">
            <span class="metric-value">{{ resenyes.length }}</span>
            <span class="metric-label">{{ 'ADMIN.METRIC_RESENYES' | translate }}</span>
            <small class="metric-sub">
              <svg viewBox="0 0 24 24" width="12" height="12" fill="#f59e0b" style="vertical-align: -1px; margin-right: 2px;" aria-hidden="true">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
              </svg>
              {{ mitjanaRessenyes() }} / 5.0 mitjana
            </small>
          </div>
        </div>

        <div
          class="metric-card"
          [class.active-card]="tabActiva === 'avisos'"
          (click)="canviarTab('avisos')"
          role="button"
          tabindex="0"
          title="Historial i emissió de notificacions"
        >
          <span class="metric-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
          </span>
          <div class="metric-info">
            <span class="metric-value">{{ totalAvisos }}</span>
            <span class="metric-label">{{ 'ADMIN.METRIC_NOTICES' | translate }}</span>
            <small class="metric-sub">{{ totalAvisos }} notificacions</small>
          </div>
        </div>

        <div
          class="metric-card"
          [class.active-card]="tabActiva === 'blacklist'"
          (click)="canviarTab('blacklist')"
          role="button"
          tabindex="0"
          title="Veure i gestionar la llista negra de telèfons"
        >
          <span class="metric-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="#ff1744" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
              <line x1="1" y1="1" x2="23" y2="23" stroke="#ff1744" stroke-width="2.2"></line>
            </svg>
          </span>
          <div class="metric-info">
            <span class="metric-value">{{ blacklist.length }}</span>
            <span class="metric-label">{{ 'ADMIN.METRIC_BLACKLIST' | translate }}</span>
            <small class="metric-sub">{{ blacklist.length }} {{ 'ADMIN.USER_PHONE_BLOCKED' | translate }}</small>
          </div>
        </div>
      </div>

      <!-- Missatges de feedback -->
      <div *ngIf="successMsg" class="alert-success">{{ successMsg }}</div>
      <div *ngIf="errorMsg" class="alert-error">{{ errorMsg }}</div>

      <!-- Pestanyes de navegació interna -->
      <div class="nav-tabs">
        <button
          type="button"
          class="tab-btn"
          [class.active]="tabActiva === 'tasques'"
          (click)="canviarTab('tasques')"
        >
          {{ 'ADMIN.TAB_TASKS' | translate }} ({{ tasques.length }})
        </button>
        <button
          type="button"
          class="tab-btn"
          [class.active]="tabActiva === 'ofertes'"
          (click)="canviarTab('ofertes')"
        >
          {{ 'ADMIN.TAB_OFFERS' | translate }} ({{ ofertes.length }})
        </button>
        <button
          type="button"
          class="tab-btn"
          [class.active]="tabActiva === 'incidencies'"
          (click)="canviarTab('incidencies')"
        >
          {{ 'ADMIN.TAB_INCIDENCIES' | translate }} ({{ incidencies.length }})
        </button>
        <button
          type="button"
          class="tab-btn"
          [class.active]="tabActiva === 'pressupostos'"
          (click)="canviarTab('pressupostos')"
        >
          {{ 'ADMIN.TAB_PRESSUPOSTOS' | translate }} ({{ pressupostos.length }})
        </button>
        <button
          type="button"
          class="tab-btn"
          [class.active]="tabActiva === 'usuaris'"
          (click)="canviarTab('usuaris')"
        >
          {{ 'ADMIN.TAB_USERS' | translate }} ({{ usuaris.length }})
        </button>
        <button
          type="button"
          class="tab-btn"
          [class.active]="tabActiva === 'blacklist'"
          (click)="canviarTab('blacklist')"
        >
          {{ 'ADMIN.TAB_BLACKLIST' | translate }} ({{ blacklist.length }})
        </button>
        <button
          type="button"
          class="tab-btn"
          [class.active]="tabActiva === 'resenyes'"
          (click)="canviarTab('resenyes')"
        >
          {{ 'ADMIN.TAB_RESENYES' | translate }} ({{ resenyes.length }})
        </button>
        <button
          type="button"
          class="tab-btn"
          [class.active]="tabActiva === 'avisos'"
          (click)="canviarTab('avisos')"
        >
          {{ 'ADMIN.TAB_AVISOS' | translate }} ({{ avisos.length }})
        </button>
      </div>

      <!-- ============================================================== -->
      <!-- PESTANYA 1: TOTES LES TASQUES -->
      <!-- ============================================================== -->
      <section class="tab-content" *ngIf="tabActiva === 'tasques'">
        <div class="filter-bar">
          <input
            type="text"
            [(ngModel)]="searchTasca"
            [placeholder]="'ADMIN.SEARCH_TASKS_PLACEHOLDER' | translate"
            class="search-input"
          />
          <select [(ngModel)]="filtreEstatTasca" class="select-filter">
            <option value="tots">{{ 'ADMIN.ALL_STATUSES' | translate }}</option>
            <option value="oberta">Obertes</option>
            <option value="curs">En curs</option>
            <option value="finalitzada">Finalitzades</option>
          </select>
        </div>

        <div class="table-wrapper" *ngIf="tasquesFiltrades.length > 0">
          <table class="data-table">
            <thead>
              <tr>
                <th>{{ 'ADMIN.TABLE_COL_ID' | translate }}</th>
                <th>{{ 'ADMIN.TABLE_COL_TITLE_DESC' | translate }}</th>
                <th>{{ 'ADMIN.TABLE_COL_CLIENT' | translate }}</th>
                <th>{{ 'ADMIN.TABLE_COL_CATEGORY' | translate }}</th>
                <th>{{ 'ADMIN.TABLE_COL_BUDGET' | translate }}</th>
                <th>{{ 'ADMIN.TABLE_COL_STATUS' | translate }}</th>
                <th>{{ 'ADMIN.TABLE_COL_ACTIONS' | translate }}</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let t of tasquesFiltrades">
                <td class="font-mono"><strong>{{ t.id }}</strong></td>
                <td>
                  <div class="table-titol">{{ t.titol }}</div>
                  <div class="table-desc">{{ t.descripcio }}</div>
                </td>
                <td>
                  <a [routerLink]="[getNavUrl('/perfil'), t.clientNom || t.client]" class="user-inline-link" title="Veure perfil">
                    {{ t.clientNom || t.client }}
                  </a>
                </td>
                <td><span class="tag-cat">{{ t.categoria | translate }}</span></td>
                <td><strong>{{ t.budget }}</strong></td>
                <td>
                  <span class="badge-status" [ngClass]="getEstatTascaClass(t.estat)">
                    {{ t.estat | translate }}
                  </span>
                </td>
                <td>
                  <div class="action-buttons">
                    <a [routerLink]="[getNavUrl('/tasca-detall'), t.id]" class="btn-sm btn-info" title="Revisar detall">
                      <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: -2px; margin-right: 4px;">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                      </svg>
                      {{ 'MERCAT.DETALL' | translate }}
                    </a>
                    <button
                      *ngIf="t.estat !== 'Finalitzada'"
                      type="button"
                      class="btn-sm btn-success"
                      (click)="finalitzarTasca(t.id)"
                      title="Forçar finalització"
                    >
                      <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: -2px; margin-right: 4px;">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                      {{ 'ADMIN.BTN_FINALIZE' | translate }}
                    </button>
                    <button
                      type="button"
                      class="btn-sm btn-danger"
                      (click)="eliminarTasca(t.id)"
                      title="Eliminar tasca de la base de dades"
                      aria-label="Eliminar"
                    >
                      <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: -2px; margin-right: 4px;">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      </svg>
                      {{ 'ADMIN.BTN_DELETE' | translate }}
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="empty-box" *ngIf="tasquesFiltrades.length === 0">
          {{ 'ADMIN.EMPTY_TASKS' | translate }}
        </div>
      </section>

      <!-- ============================================================== -->
      <!-- PESTANYA 2: TOTES LES OFERTES -->
      <!-- ============================================================== -->
      <section class="tab-content" *ngIf="tabActiva === 'ofertes'">
        <div class="filter-bar">
          <input
            type="text"
            [(ngModel)]="searchOferta"
            [placeholder]="'ADMIN.SEARCH_OFFERS_PLACEHOLDER' | translate"
            class="search-input"
          />
        </div>

        <div class="table-wrapper" *ngIf="ofertesFiltrades.length > 0">
          <table class="data-table">
            <thead>
              <tr>
                <th>{{ 'ADMIN.TABLE_COL_ID' | translate }}</th>
                <th>{{ 'ADMIN.TABLE_COL_REF_TASK' | translate }}</th>
                <th>{{ 'ADMIN.TABLE_COL_PRO' | translate }}</th>
                <th>{{ 'ADMIN.TABLE_COL_PRICE_PROPOSED' | translate }}</th>
                <th>{{ 'ADMIN.TABLE_COL_NOTE' | translate }}</th>
                <th>{{ 'ADMIN.TABLE_COL_ACTIONS' | translate }}</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let o of ofertesFiltrades">
                <td class="font-mono"><strong>{{ o.id }}</strong></td>
                <td>
                  <a *ngIf="o.tascaId" [routerLink]="[getNavUrl('/tasca-detall'), o.tascaId]" class="link-ref">
                    {{ o.tascaId }}
                  </a>
                  <span *ngIf="!o.tascaId">-</span>
                </td>
                <td>
                  <a [routerLink]="[getNavUrl('/perfil'), o.professionalNom || o.professional]" class="user-inline-link" title="Veure perfil">
                    <strong>{{ o.professionalNom || o.professional }}</strong>
                  </a>
                </td>
                <td class="price-cell">{{ o.price }}</td>
                <td class="note-cell">{{ o.note || '-' }}</td>
                <td>
                  <div class="action-buttons">
                    <button
                      type="button"
                      class="btn-sm btn-success"
                      (click)="acceptarOferta(o.id)"
                      title="Acceptar oferta"
                    >
                      <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: -2px; margin-right: 4px;">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                      {{ 'ADMIN.BTN_ACCEPT' | translate }}
                    </button>
                    <button
                      type="button"
                      class="btn-sm btn-danger"
                      (click)="eliminarOferta(o.id)"
                      title="Borrar oferta"
                    >
                      <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: -2px; margin-right: 4px;">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      </svg>
                      {{ 'ADMIN.BTN_DELETE' | translate }}
                    </button>
                    <a *ngIf="o.tascaId" [routerLink]="[getNavUrl('/tasca-detall'), o.tascaId]" class="btn-sm btn-info" title="Anar a la tasca">
                      <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: -2px; margin-right: 4px;">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                      </svg>
                      {{ 'MERCAT.DETALL' | translate }}
                    </a>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="empty-box" *ngIf="ofertesFiltrades.length === 0">
          {{ 'ADMIN.EMPTY_OFFERS' | translate }}
        </div>
      </section>

      <!-- ============================================================== -->
      <!-- PESTANYA: INCIDÈNCIES DE CLIENTS (SENSE ESTAT) -->
      <!-- ============================================================== -->
      <section class="tab-content" *ngIf="tabActiva === 'incidencies'">
        <div class="filter-bar">
          <input
            type="text"
            [(ngModel)]="searchIncidencia"
            [placeholder]="'ADMIN.SEARCH_INCIDENCIES_PLACEHOLDER' | translate"
            class="search-input"
          />
        </div>

        <div class="table-wrapper" *ngIf="incidenciesFiltrades.length > 0">
          <table class="data-table">
            <thead>
              <tr>
                <th>{{ 'ADMIN.TABLE_COL_ID' | translate }}</th>
                <th>{{ 'ADMIN.TABLE_COL_TITLE_DESC' | translate }}</th>
                <th>{{ 'ADMIN.TABLE_COL_CLIENT' | translate }}</th>
                <th>{{ 'ADMIN.TABLE_COL_CATEGORY' | translate }}</th>
                <th>{{ 'ADMIN.TABLE_COL_MAX_BUDGET' | translate }}</th>
                <th>{{ 'ADMIN.TABLE_COL_ACTIONS' | translate }}</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let inc of incidenciesFiltrades">
                <td class="font-mono"><strong>{{ inc.id }}</strong></td>
                <td>
                  <div class="table-titol">{{ inc.titol }}</div>
                  <div class="table-desc">{{ inc.descripcio }}</div>
                </td>
                <td>
                  <a [routerLink]="[getNavUrl('/perfil'), inc.clientNom || inc.client]" class="user-inline-link" title="Veure perfil">
                    {{ inc.clientNom || inc.client }}
                  </a>
                </td>
                <td><span class="tag-cat">{{ inc.categoria | translate }}</span></td>
                <td><strong>{{ inc.budget }}</strong></td>
                <td>
                  <div class="action-buttons">
                    <a [routerLink]="[getNavUrl('/tasca-detall'), inc.id]" class="btn-sm btn-info" title="Revisar incidència">
                      <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: -2px; margin-right: 4px;">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                      </svg>
                      {{ 'MERCAT.DETALL' | translate }}
                    </a>
                    <button
                      type="button"
                      class="btn-sm btn-danger"
                      (click)="eliminarIncidencia(inc.id)"
                      title="Borrar incidència"
                    >
                      <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: -2px; margin-right: 4px;">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      </svg>
                      {{ 'ADMIN.BTN_DELETE' | translate }}
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="empty-box" *ngIf="incidenciesFiltrades.length === 0">
          {{ 'ADMIN.EMPTY_INCIDENCIES' | translate }}
        </div>
      </section>

      <!-- ============================================================== -->
      <!-- PESTANYA 3: TOTS ELS USUARIS -->
      <!-- ============================================================== -->
      <section class="tab-content" *ngIf="tabActiva === 'usuaris'">
        <div class="filter-bar">
          <input
            type="text"
            [(ngModel)]="searchUsuari"
            [placeholder]="'ADMIN.SEARCH_USERS_PLACEHOLDER' | translate"
            class="search-input"
          />
          <select [(ngModel)]="filtreRolUsuari" class="select-filter">
            <option value="tots">{{ 'ADMIN.ALL_ROLES' | translate }}</option>
            <option value="client">Client</option>
            <option value="professional">Professional</option>
            <option value="admin">Administrador</option>
          </select>
        </div>

        <div class="table-wrapper" *ngIf="usuarisFiltrats.length > 0">
          <table class="data-table">
            <thead>
              <tr>
                <th>{{ 'ADMIN.TABLE_COL_ID' | translate }}</th>
                <th>{{ 'ADMIN.TABLE_COL_USERNAME' | translate }}</th>
                <th>{{ 'ADMIN.TABLE_COL_EMAIL' | translate }}</th>
                <th>{{ 'ADMIN.TABLE_COL_ROLE' | translate }}</th>
                <th>{{ 'ADMIN.TABLE_COL_PHONE' | translate }}</th>
                <th>{{ 'ADMIN.TABLE_COL_BIO' | translate }}</th>
                <th>{{ 'ADMIN.TABLE_COL_ACTIONS' | translate }}</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let u of usuarisFiltrats">
                <td class="font-mono"><strong>{{ u.id }}</strong></td>
                <td>
                  <div class="user-name-cell">
                    <a [routerLink]="[getNavUrl('/perfil'), u.id]" class="user-inline-link" title="Veure perfil">
                      <strong>{{ u.nom }}</strong>
                    </a>
                    <span *ngIf="u.rol === 'professional' && u.foto" class="badge-has-photo" [title]="'ADMIN.USER_HAS_PHOTO' | translate">
                      <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                        <circle cx="8.5" cy="8.5" r="1.5"></circle>
                        <polyline points="21 15 16 10 5 21"></polyline>
                      </svg>
                      {{ 'ADMIN.USER_HAS_PHOTO' | translate }}
                    </span>
                  </div>
                </td>
                <td>{{ u.email }}</td>
                <td>
                  <span class="user-badge-tag" [ngClass]="u.rol">
                    {{ u.rol | uppercase }}
                  </span>
                </td>
                <td>
                  <div class="user-phone-cell">
                    <span>{{ u.telefon || '-' }}</span>
                    <span *ngIf="u.telefon && isTelefonBloquejat(u.telefon)" class="badge-blacklisted">
                      {{ 'ADMIN.USER_PHONE_BLOCKED' | translate }}
                    </span>
                  </div>
                </td>
                <td class="bio-cell">{{ u.bio || '-' }}</td>
                <td>
                  <div class="action-buttons">
                    <a [routerLink]="[getNavUrl('/perfil'), u.id]" class="btn-sm btn-info" title="Veure perfil">
                      <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: -2px; margin-right: 4px;">
                        <circle cx="12" cy="7" r="4"></circle>
                        <path d="M5.5 21a6.5 6.5 0 0 1 13 0"></path>
                      </svg>
                      {{ 'PERFIL.TITLE_OWN' | translate }}
                    </a>
                    <button
                      type="button"
                      class="btn-sm btn-password"
                      (click)="obrirModalPassword(u)"
                      title="Canviar contrasenya d'aquest usuari"
                    >
                      <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: -2px; margin-right: 4px;">
                        <circle cx="8" cy="8" r="5"></circle>
                        <path d="M11.5 11.5 21 21m-4 0 2-2m-2-2 2-2"></path>
                      </svg>
                      {{ 'ADMIN.BTN_NEW_PASSWORD' | translate }}
                    </button>
                    <button
                      *ngIf="u.rol === 'professional'"
                      type="button"
                      class="btn-sm btn-foto"
                      (click)="obrirModalFoto(u)"
                      [title]="u.foto ? ('ADMIN.BTN_CHANGE_PHOTO' | translate) : ('ADMIN.BTN_ASSIGN_PHOTO' | translate)"
                    >
                      <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: -2px; margin-right: 4px;">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                        <circle cx="8.5" cy="8.5" r="1.5"></circle>
                        <polyline points="21 15 16 10 5 21"></polyline>
                      </svg>
                      {{ u.foto ? ('ADMIN.BTN_CHANGE_PHOTO' | translate) : ('ADMIN.BTN_ASSIGN_PHOTO' | translate) }}
                    </button>
                    <button
                      *ngIf="u.telefon && !isTelefonBloquejat(u.telefon)"
                      type="button"
                      class="btn-sm btn-blacklist-action"
                      (click)="bloquejarTelefonUsuari(u)"
                      title="Bloquejar telèfon a la llista negra"
                    >
                      <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: -2px; margin-right: 4px;">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line>
                      </svg>
                      {{ 'ADMIN.BTN_BLOCK_PHONE' | translate }}
                    </button>
                    <button
                      *ngIf="u.telefon && isTelefonBloquejat(u.telefon)"
                      type="button"
                      class="btn-sm btn-unblock-action"
                      (click)="desbloquejarPerTelefon(u.telefon)"
                      title="Desbloquejar aquest telèfon"
                    >
                      <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: -2px; margin-right: 4px;">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                      {{ 'ADMIN.BTN_UNBLOCK_PHONE' | translate }}
                    </button>
                    <button
                      type="button"
                      class="btn-sm btn-avis-action"
                      (click)="prepararAvisUsuari(u)"
                      title="Enviar una notificació o alerta a aquest usuari"
                    >
                      <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: -2px; margin-right: 4px;">
                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                        <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                      </svg>
                      {{ 'ADMIN.BTN_SEND_NOTICE' | translate }}
                    </button>
                    <button
                      *ngIf="u.id !== 'u-admin' && u.email !== 'admin@admin' && u.email !== 'admin@admin.es'"
                      type="button"
                      class="btn-sm btn-danger"
                      (click)="eliminarUsuari(u)"
                      title="Eliminar aquest usuari de la base de dades"
                    >
                      <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: -2px; margin-right: 4px;">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      </svg>
                      {{ 'ADMIN.BTN_DELETE' | translate }}
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="empty-box" *ngIf="usuarisFiltrats.length === 0">
          {{ 'ADMIN.EMPTY_USERS' | translate }}
        </div>
      </section>

      <!-- ============================================================== -->
      <!-- PESTANYA 5: LLISTA NEGRA DE TELÈFONS -->
      <!-- ============================================================== -->
      <section class="tab-content" *ngIf="tabActiva === 'blacklist'">
        <!-- Formulari d'afegir telèfon a la llista negra -->
        <div class="blacklist-add-card">
          <form (ngSubmit)="afegirABlacklist()" class="blacklist-add-form">
            <div class="form-field">
              <label>{{ 'ADMIN.BLACKLIST_PHONE_LABEL' | translate }}</label>
              <input
                type="text"
                [(ngModel)]="nouTelefonBlacklist"
                name="nouTelefonBlacklist"
                required
                [placeholder]="'ADMIN.BLACKLIST_PHONE_PLACEHOLDER' | translate"
              />
            </div>
            <div class="form-field flex-grow">
              <label>{{ 'ADMIN.BLACKLIST_REASON_LABEL' | translate }}</label>
              <input
                type="text"
                [(ngModel)]="nouMotiuBlacklist"
                name="nouMotiuBlacklist"
                [placeholder]="'ADMIN.BLACKLIST_REASON_PLACEHOLDER' | translate"
              />
            </div>
            <button
              type="submit"
              class="btn-blacklist-submit"
              [disabled]="afegintBlacklist || !nouTelefonBlacklist.trim()"
            >
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: -2px; margin-right: 4px;">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line>
              </svg>
              {{ afegintBlacklist ? ('ADMIN.BLACKLIST_ADDING' | translate) : ('ADMIN.BLACKLIST_ADD_BTN' | translate) }}
            </button>
          </form>
        </div>

        <div class="filter-bar" *ngIf="blacklist.length > 0">
          <input
            type="text"
            [(ngModel)]="searchBlacklist"
            placeholder="Cerca per telèfon, motiu o qui ho ha bloquejat..."
            class="search-input"
          />
        </div>

        <div class="table-wrapper" *ngIf="blacklistFiltrada.length > 0">
          <table class="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>{{ 'ADMIN.BLACKLIST_TABLE_PHONE' | translate }}</th>
                <th>{{ 'ADMIN.BLACKLIST_TABLE_REASON' | translate }}</th>
                <th>{{ 'ADMIN.BLACKLIST_TABLE_BY' | translate }}</th>
                <th>{{ 'ADMIN.BLACKLIST_TABLE_DATE' | translate }}</th>
                <th>{{ 'ADMIN.BLACKLIST_TABLE_ACTIONS' | translate }}</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let bl of blacklistFiltrada">
                <td class="font-mono"><strong>{{ bl.id }}</strong></td>
                <td>
                  <span class="phone-highlight">
                    <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: -2px; margin-right: 4px;" aria-hidden="true">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line>
                    </svg>
                    {{ bl.telefon }}
                  </span>
                </td>
                <td>{{ bl.motiu || '-' }}</td>
                <td><span class="user-badge-tag admin">{{ bl.bloquejatPer || 'admin' }}</span></td>
                <td>{{ bl.createdAt ? (bl.createdAt | date:'dd/MM/yyyy HH:mm') : '-' }}</td>
                <td>
                  <button
                    type="button"
                    class="btn-sm btn-unblock-action"
                    (click)="eliminarDeBlacklist(bl)"
                    title="Desbloquejar aquest número"
                  >
                    <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: -2px; margin-right: 4px;">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    {{ 'ADMIN.BLACKLIST_BTN_UNBLOCK' | translate }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="empty-box" *ngIf="blacklist.length === 0">
          {{ 'ADMIN.BLACKLIST_EMPTY' | translate }}
        </div>
      </section>

      <!-- ============================================================== -->
      <!-- PESTANYA 6: PRESSUPOSTOS PRIVATS -->
      <!-- ============================================================== -->
      <section class="tab-content" *ngIf="tabActiva === 'pressupostos'">
        <div class="filter-bar">
          <input
            type="text"
            [(ngModel)]="searchPressupost"
            [placeholder]="'ADMIN.SEARCH_PRESSUPOSTOS_PLACEHOLDER' | translate"
            class="search-input"
          />
        </div>

        <div class="table-wrapper" *ngIf="pressupostosFiltrats.length > 0">
          <table class="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Incidència</th>
                <th>Professional</th>
                <th>Preu Proposat</th>
                <th>Termini Estimat</th>
                <th>Proposta / Nota</th>
                <th>Accions Administrador</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let p of pressupostosFiltrats">
                <td class="font-mono"><strong>{{ p.id }}</strong></td>
                <td>
                  <a [routerLink]="[getNavUrl('/tasca-detall'), p.incidenciaId]" class="table-titol user-inline-link" title="Veure incidència">
                    {{ p.incidenciaTitol || p.incidenciaId }}
                  </a>
                  <div class="table-desc">Ref: {{ p.incidenciaId }}</div>
                </td>
                <td>
                  <a [routerLink]="[getNavUrl('/perfil'), p.professionalNom]" class="user-inline-link" title="Veure perfil professional">
                    {{ p.professionalNom }}
                  </a>
                </td>
                <td><strong class="budget-highlight">{{ p.preu }}</strong></td>
                <td><span>{{ p.duracioEstimada || 'No indicada' }}</span></td>
                <td><div class="table-desc">{{ p.descripcio }}</div></td>
                <td>
                  <div class="action-buttons">
                    <button
                      type="button"
                      class="btn-sm btn-danger"
                      (click)="eliminarPressupost(p.id)"
                      title="Cancel·lar i eliminar aquest pressupost del sistema"
                    >
                      <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: -2px; margin-right: 4px;">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      </svg>
                      {{ 'ADMIN.BTN_DELETE' | translate }}
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="empty-box" *ngIf="pressupostosFiltrats.length === 0">
          {{ 'ADMIN.EMPTY_PRESSUPOSTOS' | translate }}
        </div>
      </section>

      <!-- ============================================================== -->
      <!-- PESTANYA 7: RESSENYES I VALORACIONS -->
      <!-- ============================================================== -->
      <section class="tab-content" *ngIf="tabActiva === 'resenyes'">
        <div class="filter-bar">
          <input
            type="text"
            [(ngModel)]="searchResenya"
            [placeholder]="'ADMIN.SEARCH_RESENYES_PLACEHOLDER' | translate"
            class="search-input"
          />
          <div class="rating-summary-badge" *ngIf="resenyes.length > 0">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="#f59e0b" style="vertical-align: -2px; margin-right: 3px;" aria-hidden="true">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
            </svg>
            Mitjana plataforma: <strong>{{ mitjanaRessenyes() }} / 5.0</strong> ({{ resenyes.length }} valoracions)
          </div>
        </div>

        <div class="table-wrapper" *ngIf="resenyesFiltrades.length > 0">
          <table class="admin-table">
            <thead>
              <tr>
                <th>Puntuació</th>
                <th>Client Autor</th>
                <th>Professional Valorat</th>
                <th>Ref. Tasca</th>
                <th>Comentari / Opinió</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let r of resenyesFiltrades">
                <td>
                  <span class="stars-badge">
                    <svg viewBox="0 0 24 24" width="13" height="13" fill="#f59e0b" style="vertical-align: -1px; margin-right: 3px;" aria-hidden="true">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                    </svg>
                    {{ r.puntuacio }}.0
                  </span>
                </td>
                <td>
                  <a [routerLink]="[getNavUrl('/perfil'), r.clientNom || r.clientId]" class="user-inline-link">
                    {{ r.clientNom || r.clientId }}
                  </a>
                </td>
                <td>
                  <a [routerLink]="[getNavUrl('/perfil'), r.treballadorNom || r.treballadorId]" class="user-inline-link">
                    {{ r.treballadorNom || r.treballadorId }}
                  </a>
                </td>
                <td>
                  <a *ngIf="r.tascaId" [routerLink]="[getNavUrl('/tasca-detall'), r.tascaId]" class="font-mono user-inline-link">
                    {{ r.tascaId }}
                  </a>
                  <span *ngIf="!r.tascaId">—</span>
                </td>
                <td>
                  <div class="table-desc">{{ r.descripcio }}</div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="empty-box" *ngIf="resenyesFiltrades.length === 0">
          {{ 'ADMIN.EMPTY_RESENYES' | translate }}
        </div>
      </section>

      <!-- ============================================================== -->
      <!-- PESTANYA 8: AVISOS I NOTIFICACIONS DEL SISTEMA -->
      <!-- ============================================================== -->
      <section class="tab-content" *ngIf="tabActiva === 'avisos'">
        <!-- Formulari d'emissió de nou avís -->
        <div class="blacklist-add-card" style="margin-bottom: 1.5rem;">
          <div class="blacklist-card-header">
            <h3>
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#2563eb" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
              </svg>
              Emetre Notificació a un Usuari
            </h3>
            <p class="blacklist-card-sub">Envia un missatge oficial a la safata d'entrada de qualsevol client o professional.</p>
          </div>

          <form (ngSubmit)="enviarNouAvis()" class="blacklist-add-form" style="display: flex; flex-direction: column; gap: 1rem;">
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem;">
              <div class="form-field">
                <label for="destinatariAvis">Usuari Destinatari:</label>
                <select id="destinatariAvis" [(ngModel)]="nouAvis.usuariId" name="usuariId" class="search-input" required>
                  <option value="" disabled>-- Tria un usuari registrat --</option>
                  <option *ngFor="let u of usuaris" [value]="u.id">
                    {{ u.nom }} ({{ u.email }}) — {{ u.rol | uppercase }}
                  </option>
                </select>
              </div>

              <div class="form-field">
                <label for="enllacAvis">Enllaç opcional (ruta):</label>
                <input
                  id="enllacAvis"
                  type="text"
                  [(ngModel)]="nouAvis.enllac"
                  name="enllac"
                  placeholder="Ex: /tasques-ofertes o /perfil"
                  class="search-input"
                />
              </div>
            </div>

            <div class="form-field">
              <label for="missatgeAvis">Missatge de la notificació:</label>
              <textarea
                id="missatgeAvis"
                rows="2"
                [(ngModel)]="nouAvis.missatge"
                name="missatge"
                placeholder="Escriu aquí el text de l'avís que rebrà l'usuari..."
                class="search-input"
                required
                style="height: auto; resize: vertical;"
              ></textarea>
            </div>

            <div style="display: flex; justify-content: flex-end;">
              <button
                type="submit"
                class="btn-primary"
                [disabled]="enviantAvis || !nouAvis.usuariId || !nouAvis.missatge.trim()"
                style="padding: 0.6rem 1.5rem;"
              >
                {{ enviantAvis ? 'Enviant...' : 'Emetre Notificació' }}
              </button>
            </div>
          </form>
        </div>

        <div class="filter-bar">
          <input
            type="text"
            [(ngModel)]="searchAvis"
            [placeholder]="'ADMIN.SEARCH_AVISOS_PLACEHOLDER' | translate"
            class="search-input"
          />
        </div>

        <div class="table-wrapper" *ngIf="avisosFiltrats.length > 0">
          <table class="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Destinatari</th>
                <th>Missatge</th>
                <th>Enllaç de Navegació</th>
                <th>Estat</th>
                <th>Data</th>
                <th>Accions Administrador</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let a of avisosFiltrats">
                <td class="font-mono"><strong>{{ a.id }}</strong></td>
                <td>
                  <span class="user-badge-tag">{{ a.usuariId }}</span>
                </td>
                <td>
                  <div class="table-titol">{{ a.missatge }}</div>
                </td>
                <td>
                  <code *ngIf="a.enllac">{{ a.enllac }}</code>
                  <span *ngIf="!a.enllac">—</span>
                </td>
                <td>
                  <span class="badge-estat" [ngClass]="a.llegit ? 'estat-finalitzada' : 'estat-oberta'">
                    {{ a.llegit ? 'Llegit' : 'Pendent' }}
                  </span>
                </td>
                <td><small>{{ a.data }}</small></td>
                <td>
                  <div class="action-buttons">
                    <button
                      type="button"
                      class="btn-sm btn-danger"
                      (click)="eliminarAvis(a.id)"
                      title="Eliminar aquest avís del sistema"
                    >
                      <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: -2px; margin-right: 4px;">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      </svg>
                      {{ 'ADMIN.BTN_DELETE' | translate }}
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="empty-box" *ngIf="avisosFiltrats.length === 0">
          {{ 'ADMIN.EMPTY_AVISOS' | translate }}
        </div>
      </section>

      <!-- ============================================================== -->
      <!-- MODAL D'ADMINISTRADOR: ASSIGNAR NOVA CONTRASENYA SENSE ANTIGA -->
      <!-- ============================================================== -->
      <div class="modal-backdrop" *ngIf="modalPasswordObert">
        <div class="modal-card">
          <div class="modal-header">
            <h3>{{ 'ADMIN.BTN_NEW_PASSWORD' | translate }}</h3>
            <button type="button" class="btn-close" (click)="tancarModalPassword()" aria-label="Tancar">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <div class="modal-body" *ngIf="usuariSeleccionat">
            <div class="user-highlight">
              <div>
                <strong>Usuari:</strong> {{ usuariSeleccionat.nom }}
              </div>
              <div class="user-subinfo">
                <span>{{ usuariSeleccionat.email }}</span>
                <span class="user-badge-tag" [ngClass]="usuariSeleccionat.rol">{{ usuariSeleccionat.rol | uppercase }}</span>
              </div>
            </div>

            <div class="alert-info-box">
              <strong>Privilegi d'Administrador:</strong> Pots assignar directament una nova contrasenya sense conèixer ni veure la contrasenya anterior de l'usuari.
            </div>

            <div class="form-group">
              <label for="adminNovaPass">{{ 'PERFIL.NEW_PASSWORD' | translate }}:</label>
              <div class="input-password-wrapper">
                <input
                  id="adminNovaPass"
                  [type]="mostrarPassword ? 'text' : 'password'"
                  [(ngModel)]="novaContrasenya"
                  placeholder="Mínim 6 caràcters..."
                  class="form-control"
                />
                <button type="button" class="btn-toggle-eye" (click)="mostrarPassword = !mostrarPassword" title="Mostrar/Amagar" aria-label="Mostrar o amagar contrasenya">
                  <svg *ngIf="mostrarPassword" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                  </svg>
                  <svg *ngIf="!mostrarPassword" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                </button>
              </div>
            </div>

            <div class="form-group">
              <label for="adminConfirmaPass">{{ 'PERFIL.REPEAT_PASSWORD' | translate }}:</label>
              <input
                id="adminConfirmaPass"
                [type]="mostrarPassword ? 'text' : 'password'"
                [(ngModel)]="confirmarContrasenya"
                placeholder="Torna a escriure la nova contrasenya..."
                class="form-control"
              />
            </div>

            <div class="modal-error" *ngIf="errorModalPassword">
              {{ errorModalPassword }}
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn-secondary" (click)="tancarModalPassword()" [disabled]="savingPassword">
              {{ 'CONFIRM_MODAL.DEFAULT_CANCEL' | translate }}
            </button>
            <button type="button" class="btn-primary" (click)="guardarNovaPassword()" [disabled]="savingPassword">
              {{ savingPassword ? ('PERFIL.UPDATING_PASSWORD' | translate) : ('PERFIL.UPDATE_PASSWORD' | translate) }}
            </button>
          </div>
        </div>
      </div>

      <!-- ============================================================== -->
      <!-- MODAL D'ADMINISTRADOR: ASSIGNAR FOTOGRAFIA DE FONS PROFESSIONAL-->
      <!-- ============================================================== -->
      <div class="modal-backdrop" *ngIf="modalFotoObert" (click)="tancarModalFoto()">
        <div class="modal-card modal-photo-card" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#ff1744" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                <polyline points="21 15 16 10 5 21"></polyline>
              </svg>
              {{ 'ADMIN.PHOTO_MODAL_TITLE' | translate }}
            </h3>
            <button type="button" class="btn-close" (click)="tancarModalFoto()" aria-label="Tancar">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <div class="modal-body" *ngIf="usuariFotoSeleccionat">
            <div class="user-highlight">
              <div><strong>Professional:</strong> {{ usuariFotoSeleccionat.nom }}</div>
              <div class="user-subinfo">
                <span>ID: {{ usuariFotoSeleccionat.id }}</span>
                <span>•</span>
                <span>{{ usuariFotoSeleccionat.email }}</span>
              </div>
            </div>

            <p class="photo-modal-desc">{{ 'ADMIN.PHOTO_MODAL_DESC' | translate }}</p>

            <!-- Galeria d'oficis recomanats / Presets ràpids -->
            <div class="form-group">
              <label>{{ 'ADMIN.PHOTO_PRESETS_LABEL' | translate }}</label>
              <div class="presets-gallery-grid">
                <button
                  type="button"
                  class="preset-card-btn"
                  *ngFor="let p of fotoPresets"
                  [class.active-preset]="fotoUrlInput === p.url"
                  (click)="seleccionarPresetFoto(p.url)"
                >
                  <img [src]="p.url" [alt]="p.nom" class="preset-thumbnail" />
                  <span class="preset-label">{{ p.nom }}</span>
                </button>
              </div>
            </div>

            <!-- Entrada d'URL lliure -->
            <div class="form-group">
              <label for="adminFotoUrl">{{ 'ADMIN.PHOTO_INPUT_LABEL' | translate }}:</label>
              <input
                id="adminFotoUrl"
                type="url"
                [(ngModel)]="fotoUrlInput"
                class="form-control"
                [placeholder]="'ADMIN.PHOTO_INPUT_PLACEHOLDER' | translate"
              />
            </div>

            <!-- Vista prèvia de la targeta de recomanats -->
            <div class="form-group">
              <label>{{ 'ADMIN.PHOTO_PREVIEW_LABEL' | translate }}</label>
              <div
                class="card-live-preview"
                [style.background-image]="fotoUrlInput ? ('linear-gradient(180deg, rgba(15, 23, 42, 0.72) 0%, rgba(15, 23, 42, 0.90) 100%), url(' + fotoUrlInput + ')') : 'linear-gradient(135deg, #1e293b, #0f172a)'"
              >
                <div class="preview-tag-wrap">
                  <span class="preview-verified-tag">VERIFICAT OFICIAL</span>
                  <span class="preview-spec-tag">{{ getEspecialitatNom(usuariFotoSeleccionat) }}</span>
                </div>
                <h4 class="preview-pro-name">{{ usuariFotoSeleccionat.nom }}</h4>
                <div class="preview-rating-row">
                  <span class="preview-star-pill">
                    <svg viewBox="0 0 24 24" width="12" height="12" fill="#f59e0b" style="vertical-align: -1px; margin-right: 2px;" aria-hidden="true">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                    </svg>
                    4.9
                  </span>
                  <span class="preview-stars" aria-hidden="true">
                    <svg *ngFor="let s of [1,2,3,4,5]" viewBox="0 0 24 24" width="11" height="11" fill="#f59e0b" style="margin-right: 1px;">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                    </svg>
                  </span>
                  <span class="preview-opinions">(12 opinions)</span>
                </div>
                <p class="preview-pro-bio">
                  {{ usuariFotoSeleccionat.bio || 'Servei professional certificat per AVISA amb atenció a València i comarques.' }}
                </p>
                <div class="preview-btn-fake">
                  Veure perfil complet →
                </div>
              </div>
            </div>

            <div *ngIf="errorFoto" class="modal-error">
              {{ errorFoto }}
            </div>
          </div>

          <div class="modal-footer" style="justify-content: space-between;">
            <div>
              <button
                *ngIf="usuariFotoSeleccionat?.foto"
                type="button"
                class="btn-danger-outline"
                (click)="eliminarFoto()"
                [disabled]="guardantFoto"
              >
                {{ 'ADMIN.PHOTO_REMOVE_BTN' | translate }}
              </button>
            </div>
            <div style="display: flex; gap: 0.75rem;">
              <button type="button" class="btn-secondary" (click)="tancarModalFoto()" [disabled]="guardantFoto">
                {{ 'CONFIRM_MODAL.DEFAULT_CANCEL' | translate }}
              </button>
              <button type="button" class="btn-primary" (click)="guardarFoto()" [disabled]="guardantFoto">
                {{ guardantFoto ? ('ADMIN.PHOTO_SAVING' | translate) : ('ADMIN.PHOTO_SAVE_BTN' | translate) }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .admin-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 1.5rem 1rem;
    }
    .admin-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 2rem;
      gap: 1rem;
      flex-wrap: wrap;
    }
    .admin-badge {
      display: inline-block;
      background: rgba(255, 23, 68, 0.08);
      color: #ff1744;
      border: 1px solid rgba(255, 23, 68, 0.3);
      font-size: 0.72rem;
      font-weight: 900;
      letter-spacing: 0.12em;
      padding: 0.25rem 0.65rem;
      border-radius: 4px;
      margin-bottom: 0.5rem;
    }
    .title-group h2 {
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
    .btn-refresh {
      background: #ffffff;
      border: 1px solid #d6d0c4;
      padding: 0.65rem 1.25rem;
      border-radius: 8px;
      font-weight: 800;
      font-size: 0.88rem;
      color: #09090c;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .btn-refresh:hover:not(:disabled) {
      border-color: #09090c;
      background: #09090c;
      color: #ffffff;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
    .btn-refresh:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 1.25rem;
      margin-bottom: 2rem;
    }
    .metric-card {
      background: var(--bg-card, #ffffff);
      border: 1.5px solid var(--border-subtle, #e5e0d7);
      border-radius: var(--radius-md, 14px);
      padding: 1.35rem;
      display: flex;
      align-items: center;
      gap: 1.1rem;
      box-shadow: var(--shadow-sm, 0 4px 16px rgba(0, 0, 0, 0.04));
      transition: all var(--transition-fast, 0.2s ease);
      cursor: pointer;
      user-select: none;
    }
    .metric-card:hover {
      border-color: #ff1744;
      transform: translateY(-2px);
      box-shadow: 0 6px 18px rgba(255, 23, 68, 0.12);
    }
    .metric-card.active-card {
      border-color: #ff1744;
      background: #fffafa;
      box-shadow: 0 6px 20px rgba(255, 23, 68, 0.16);
      position: relative;
    }
    .metric-card.active-card::after {
      content: '';
      position: absolute;
      bottom: -6px;
      left: 50%;
      transform: translateX(-50%);
      width: 28px;
      height: 4px;
      background: #ff1744;
      border-radius: 2px;
    }
    .clickable-sub {
      cursor: pointer;
      text-decoration: underline;
      text-decoration-style: dotted;
      text-underline-offset: 2px;
      transition: color 0.15s ease;
    }
    .clickable-sub:hover {
      color: #ff1744;
    }
    .metric-icon {
      font-size: 2.2rem;
    }
    .metric-info {
      display: flex;
      flex-direction: column;
    }
    .metric-value {
      font-size: 1.85rem;
      font-weight: 900;
      color: #09090c;
      line-height: 1.1;
    }
    .metric-label {
      font-size: 0.85rem;
      color: #636058;
      font-weight: 700;
      margin-top: 0.25rem;
    }
    .metric-sub {
      font-size: 0.75rem;
      color: #8c887e;
      margin-top: 0.2rem;
      font-weight: 600;
    }
    .nav-tabs {
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
      padding: 0.65rem 1.25rem;
      border-radius: 8px;
      font-size: 0.92rem;
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
    .filter-bar {
      display: flex;
      gap: 1rem;
      margin-bottom: 1.25rem;
      flex-wrap: wrap;
    }
    .search-input {
      flex: 1;
      min-width: 260px;
      padding: 0.75rem 1rem;
      background: #ffffff;
      border: 1.5px solid #d6d0c4;
      border-radius: 8px;
      font-size: 0.9rem;
      color: #09090c;
      font-weight: 600;
    }
    .search-input:focus {
      outline: none;
      border-color: #ff1744;
      box-shadow: 0 0 10px rgba(255, 23, 68, 0.2);
    }
    .select-filter {
      padding: 0.75rem 1rem;
      background: #ffffff;
      border: 1.5px solid #d6d0c4;
      border-radius: 8px;
      font-size: 0.9rem;
      color: #09090c;
      font-weight: 700;
      cursor: pointer;
    }
    .select-filter:focus {
      outline: none;
      border-color: #ff1744;
    }
    .table-wrapper {
      background: var(--bg-card, #ffffff);
      border: 1px solid var(--border-subtle, #e5e0d7);
      border-radius: var(--radius-md, 12px);
      overflow-x: auto;
      box-shadow: var(--shadow-sm, 0 4px 20px rgba(0, 0, 0, 0.04));
    }
    .data-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
      font-size: 0.9rem;
    }
    .data-table th {
      background: var(--bg-surface, #faf8f4);
      color: var(--color-text, #09090c);
      padding: 0.9rem 1rem;
      font-weight: 800;
      border-bottom: 1px solid #e5e0d7;
      white-space: nowrap;
      letter-spacing: 0.03em;
    }
    .data-table td {
      padding: 0.9rem 1rem;
      border-bottom: 1px solid #f0ece3;
      vertical-align: middle;
      color: #09090c;
    }
    .data-table tr:hover {
      background: #faf8f4;
    }
    .font-mono {
      font-family: monospace;
      color: #ff1744;
      font-weight: 800;
    }
    .table-titol {
      font-weight: 800;
      color: #09090c;
      margin-bottom: 0.2rem;
    }
    .table-desc {
      font-size: 0.8rem;
      color: #636058;
      max-width: 280px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .tag-cat {
      background: #f0ece3;
      border: 1px solid #dcd6cb;
      color: #09090c;
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
      font-size: 0.78rem;
      font-weight: 700;
    }
    .badge-status {
      padding: 0.25rem 0.6rem;
      border-radius: 5px;
      font-size: 0.78rem;
      font-weight: 800;
      display: inline-block;
    }
    .badge-oberta {
      background: rgba(255, 23, 68, 0.08);
      color: #ff1744;
      border: 1px solid rgba(255, 23, 68, 0.25);
    }
    .badge-en-curs {
      background: rgba(245, 158, 11, 0.12);
      color: #b45309;
      border: 1px solid rgba(245, 158, 11, 0.3);
    }
    .badge-finalitzada {
      background: rgba(148, 163, 184, 0.15);
      color: #475569;
      border: 1px solid rgba(148, 163, 184, 0.3);
    }
    .badge-pendent {
      background: rgba(245, 158, 11, 0.12);
      color: #b45309;
      border: 1px solid rgba(245, 158, 11, 0.3);
    }
    .badge-acceptada {
      background: rgba(255, 23, 68, 0.08);
      color: #ff1744;
      border: 1px solid rgba(255, 23, 68, 0.25);
    }
    .badge-rebutjada {
      background: rgba(239, 68, 68, 0.1);
      color: #dc2626;
      border: 1px solid rgba(239, 68, 68, 0.3);
    }
    .price-cell {
      font-weight: 900;
      color: #ff1744;
      font-size: 0.95rem;
    }
    .note-cell {
      max-width: 220px;
      font-size: 0.82rem;
      color: #636058;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      font-style: italic;
    }
    .user-inline-link {
      color: inherit;
      text-decoration: underline;
      text-decoration-color: rgba(255, 23, 68, 0.4);
      text-underline-offset: 3px;
      transition: color 0.15s ease, text-decoration-color 0.15s ease;
      cursor: pointer;
    }
    .user-inline-link:hover {
      color: #ff1744 !important;
      text-decoration-color: #ff1744;
    }
    .link-ref {
      color: #ff1744;
      text-decoration: underline;
      font-weight: 700;
    }
    .action-buttons {
      display: flex;
      gap: 0.4rem;
      flex-wrap: wrap;
    }
    .btn-sm {
      padding: 0.35rem 0.65rem;
      border-radius: 6px;
      font-size: 0.78rem;
      font-weight: 800;
      cursor: pointer;
      border: 1px solid transparent;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      transition: all 0.15s;
    }
    .btn-info {
      background: #f0ece3;
      color: #09090c;
      border-color: #dcd6cb;
    }
    .btn-info:hover {
      border-color: #ff1744;
      color: #ff1744;
    }
    .btn-success {
      background: rgba(255, 23, 68, 0.08);
      color: #ff1744;
      border-color: rgba(255, 23, 68, 0.3);
    }
    .btn-success:hover {
      background: #ff1744;
      color: #ffffff;
    }
    .btn-warning {
      background: rgba(245, 158, 11, 0.1);
      color: #b45309;
      border-color: rgba(245, 158, 11, 0.3);
    }
    .btn-warning:hover {
      background: rgba(245, 158, 11, 0.2);
    }
    .btn-danger {
      background: rgba(239, 68, 68, 0.1);
      color: #dc2626;
      border-color: rgba(239, 68, 68, 0.3);
    }
    .btn-danger:hover {
      background: rgba(239, 68, 68, 0.2);
    }
    .user-badge-tag {
      padding: 0.2rem 0.55rem;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: 800;
    }
    .user-badge-tag.client {
      background: #eff6ff;
      color: #1d4ed8;
      border: 1px solid #bfdbfe;
    }
    .user-badge-tag.professional {
      background: rgba(255, 23, 68, 0.08);
      color: #ff1744;
      border: 1px solid rgba(255, 23, 68, 0.25);
    }
    .user-badge-tag.ambdos {
      background: #f5f3ff;
      color: #6d28d9;
      border: 1px solid #ddd6fe;
    }
    .user-badge-tag.admin {
      background: #09090c;
      color: #ffffff;
      border: 1px solid #ff1744;
    }
    .bio-cell {
      max-width: 250px;
      font-size: 0.8rem;
      color: #636058;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .empty-box {
      text-align: center;
      padding: 2.5rem;
      background: #ffffff;
      border-radius: 12px;
      border: 1px dashed #d6d0c4;
      color: #636058;
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
    .alert-error {
      background: #fef2f2;
      color: #dc2626;
      border: 1px solid #fecaca;
      padding: 0.75rem 1rem;
      border-radius: 8px;
      margin-bottom: 1rem;
      font-weight: 700;
    }
    .btn-password {
      background: rgba(255, 23, 68, 0.08);
      color: #ff1744;
      border: 1px solid rgba(255, 23, 68, 0.3);
      padding: 0.35rem 0.65rem;
      border-radius: 6px;
      font-size: 0.8rem;
      cursor: pointer;
      font-weight: 800;
      transition: all 0.2s;
    }
    .btn-password:hover {
      background: #ff1744;
      color: #ffffff;
      box-shadow: 0 4px 10px rgba(255, 23, 68, 0.35);
    }
    .btn-foto {
      background: rgba(37, 99, 235, 0.08);
      color: #2563eb;
      border: 1px solid rgba(37, 99, 235, 0.3);
      padding: 0.35rem 0.65rem;
      border-radius: 6px;
      font-size: 0.8rem;
      cursor: pointer;
      font-weight: 800;
      transition: all 0.2s;
    }
    .btn-foto:hover {
      background: #2563eb;
      color: #ffffff;
      box-shadow: 0 4px 10px rgba(37, 99, 235, 0.35);
    }
    .user-name-cell {
      display: flex;
      align-items: center;
      gap: 0.45rem;
      flex-wrap: wrap;
    }
    .badge-has-photo {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      background: rgba(16, 185, 129, 0.1);
      color: #059669;
      border: 1px solid rgba(16, 185, 129, 0.3);
      font-size: 0.68rem;
      font-weight: 800;
      padding: 0.15rem 0.45rem;
      border-radius: 4px;
    }
    .modal-photo-card {
      max-width: 640px !important;
    }
    .photo-modal-desc {
      font-size: 0.85rem;
      color: #57554e;
      margin: 0;
      line-height: 1.45;
    }
    .presets-gallery-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 0.55rem;
      margin-top: 0.35rem;
    }
    .preset-card-btn {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.3rem;
      padding: 0.4rem;
      background: #faf8f4;
      border: 2px solid #e5e0d7;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .preset-card-btn:hover {
      border-color: #ff1744;
      transform: translateY(-2px);
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
    }
    .preset-card-btn.active-preset {
      border-color: #ff1744;
      background: rgba(255, 23, 68, 0.06);
      box-shadow: 0 0 0 2px rgba(255, 23, 68, 0.2);
    }
    .preset-thumbnail {
      width: 100%;
      height: 48px;
      object-fit: cover;
      border-radius: 5px;
    }
    .preset-label {
      font-size: 0.72rem;
      font-weight: 700;
      color: #1c1c28;
    }
    .card-live-preview {
      border-radius: 14px;
      padding: 1.25rem;
      background-size: cover !important;
      background-position: center !important;
      background-repeat: no-repeat !important;
      display: flex;
      flex-direction: column;
      gap: 0.65rem;
      border: 1px solid rgba(255, 255, 255, 0.2);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
      color: #ffffff;
      min-height: 180px;
      box-sizing: border-box;
      transition: background 0.3s ease;
    }
    .preview-tag-wrap {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      flex-wrap: wrap;
    }
    .preview-verified-tag {
      background: #10b981;
      color: #ffffff;
      font-size: 0.68rem;
      font-weight: 900;
      padding: 0.2rem 0.5rem;
      border-radius: 100px;
      letter-spacing: 0.04em;
    }
    .preview-spec-tag {
      background: rgba(255, 255, 255, 0.18);
      backdrop-filter: blur(4px);
      color: #ffffff;
      font-size: 0.72rem;
      font-weight: 700;
      padding: 0.15rem 0.5rem;
      border-radius: 6px;
    }
    .preview-pro-name {
      margin: 0;
      font-size: 1.15rem;
      font-weight: 800;
      color: #ffffff;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.6);
    }
    .preview-rating-row {
      display: flex;
      align-items: center;
      gap: 0.35rem;
      font-size: 0.8rem;
    }
    .preview-star-pill {
      background: #fffbeb;
      color: #b45309;
      font-weight: 800;
      padding: 0.1rem 0.4rem;
      border-radius: 4px;
      font-size: 0.75rem;
    }
    .preview-stars {
      color: #fbbf24;
      letter-spacing: 1px;
    }
    .preview-opinions {
      color: #cbd5e1;
      font-size: 0.75rem;
    }
    .preview-pro-bio {
      margin: 0;
      font-size: 0.82rem;
      line-height: 1.4;
      color: #e2e8f0;
      text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .preview-btn-fake {
      margin-top: auto;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0.5rem 0.85rem;
      background: #ff1744;
      color: #ffffff;
      font-size: 0.78rem;
      font-weight: 800;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(255, 23, 68, 0.35);
      width: fit-content;
    }
    .btn-danger-outline {
      background: transparent;
      color: #dc2626;
      border: 1.5px solid #f87171;
      padding: 0.6rem 1rem;
      border-radius: 6px;
      font-size: 0.85rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn-danger-outline:hover {
      background: #fee2e2;
      border-color: #dc2626;
    }
    .modal-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(9, 9, 12, 0.65);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      backdrop-filter: blur(4px);
    }
    .modal-card {
      background: #ffffff;
      width: 100%;
      max-width: 480px;
      border-radius: 14px;
      border: 1px solid #e5e0d7;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
      overflow: hidden;
      display: flex;
      flex-direction: column;
      animation: modalFadeIn 0.2s ease-out;
    }
    @keyframes modalFadeIn {
      from { opacity: 0; transform: translateY(-10px) scale(0.98); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }
    .modal-header {
      padding: 1.1rem 1.4rem;
      background: #faf8f4;
      border-bottom: 1px solid #e5e0d7;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .modal-header h3 {
      margin: 0;
      font-size: 1.15rem;
      color: #09090c;
      font-weight: 800;
      display: flex;
      align-items: center;
      gap: 0.4rem;
    }
    .btn-close {
      background: none;
      border: none;
      font-size: 1.25rem;
      color: #636058;
      cursor: pointer;
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
    }
    .btn-close:hover {
      color: #ff1744;
    }
    .modal-body {
      padding: 1.4rem;
      display: flex;
      flex-direction: column;
      gap: 1.1rem;
    }
    .user-highlight {
      background: #faf8f4;
      border: 1px solid #e5e0d7;
      padding: 0.75rem 1rem;
      border-radius: 8px;
      font-size: 0.9rem;
      color: #09090c;
      font-weight: 700;
    }
    .user-subinfo {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-top: 0.25rem;
      color: #636058;
      font-weight: 500;
    }
    .alert-info-box {
      background: rgba(255, 23, 68, 0.04);
      border-left: 3px solid #ff1744;
      color: #57554e;
      padding: 0.75rem;
      border-radius: 4px;
      font-size: 0.82rem;
      line-height: 1.4;
    }
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }
    .form-group label {
      font-weight: 800;
      font-size: 0.85rem;
      color: #09090c;
    }
    .input-password-wrapper {
      position: relative;
      display: flex;
      align-items: center;
    }
    .input-password-wrapper input {
      padding-right: 2.5rem;
    }
    .btn-toggle-eye {
      position: absolute;
      right: 0.5rem;
      background: none;
      border: none;
      cursor: pointer;
      font-size: 1rem;
    }
    .form-control {
      width: 100%;
      padding: 0.7rem 0.85rem;
      background: #ffffff;
      border: 1.5px solid #d6d0c4;
      border-radius: 6px;
      font-size: 0.9rem;
      color: #09090c;
      box-sizing: border-box;
      outline: none;
      transition: border-color 0.2s;
    }
    .form-control:focus {
      border-color: #ff1744;
      box-shadow: 0 0 10px rgba(255, 23, 68, 0.2);
    }
    .modal-error {
      background: #fef2f2;
      color: #dc2626;
      border: 1px solid #fecaca;
      padding: 0.6rem 0.8rem;
      border-radius: 6px;
      font-size: 0.82rem;
      font-weight: 700;
    }
    .modal-footer {
      padding: 1rem 1.4rem;
      background: #faf8f4;
      border-top: 1px solid #e5e0d7;
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
    }
    .btn-secondary {
      padding: 0.6rem 1.1rem;
      background: #f0ece3;
      border: 1px solid #dcd6cb;
      border-radius: 6px;
      color: #09090c;
      font-weight: 800;
      font-size: 0.85rem;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn-secondary:hover {
      border-color: #09090c;
      background: #09090c;
      color: #ffffff;
    }
    .btn-primary {
      padding: 0.6rem 1.25rem;
      background: #ff1744;
      border: 1px solid #ff1744;
      border-radius: 6px;
      color: #ffffff;
      font-weight: 900;
      font-size: 0.85rem;
      cursor: pointer;
      transition: all 0.2s;
      box-shadow: 0 4px 12px rgba(255, 23, 68, 0.3);
    }
    .btn-primary:hover:not(:disabled) {
      background: #09090c;
      border-color: #09090c;
      box-shadow: 0 4px 14px rgba(0, 0, 0, 0.2);
    }
    .btn-primary:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    /* ESTILS ESPECÍFICS DE LA LLISTA NEGRA */
    .badge-danger-count {
      background: #ff1744;
      color: #ffffff;
      padding: 0.15rem 0.45rem;
      border-radius: 10px;
      font-size: 0.72rem;
      font-weight: 800;
      margin-left: 0.35rem;
    }
    .user-phone-cell {
      display: flex;
      flex-direction: column;
      gap: 0.3rem;
      align-items: flex-start;
    }
    .badge-blacklisted {
      background: rgba(239, 68, 68, 0.12);
      color: #dc2626;
      border: 1px solid rgba(239, 68, 68, 0.3);
      padding: 0.15rem 0.4rem;
      border-radius: 4px;
      font-size: 0.7rem;
      font-weight: 800;
      white-space: nowrap;
    }
    .btn-blacklist-action {
      background: rgba(239, 68, 68, 0.1);
      color: #dc2626;
      border-color: rgba(239, 68, 68, 0.3);
    }
    .btn-blacklist-action:hover {
      background: #dc2626;
      color: #ffffff;
    }
    .btn-unblock-action {
      background: rgba(16, 185, 129, 0.1);
      color: #059669;
      border-color: rgba(16, 185, 129, 0.3);
    }
    .btn-unblock-action:hover {
      background: #059669;
      color: #ffffff;
    }
    .blacklist-add-card {
      background: #ffffff;
      border: 1px solid #e5e0d7;
      border-radius: 12px;
      padding: 1.25rem;
      margin-bottom: 1.5rem;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
    }
    .blacklist-add-form {
      display: flex;
      gap: 1rem;
      align-items: flex-end;
      flex-wrap: wrap;
    }
    .blacklist-add-form .form-field {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
      font-size: 0.8rem;
      font-weight: 800;
      color: #09090c;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .blacklist-add-form .form-field input {
      padding: 0.65rem 0.85rem;
      border: 1px solid #dcd7ce;
      border-radius: 8px;
      font-size: 0.9rem;
      outline: none;
      min-width: 200px;
      transition: border-color 0.2s;
    }
    .blacklist-add-form .form-field input:focus {
      border-color: #ff1744;
    }
    .blacklist-add-form .flex-grow {
      flex: 1;
      min-width: 240px;
    }
    .btn-blacklist-submit {
      background: #dc2626;
      color: #ffffff;
      border: none;
      padding: 0.72rem 1.25rem;
      border-radius: 8px;
      font-weight: 800;
      font-size: 0.88rem;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      transition: all 0.15s ease;
      box-shadow: 0 4px 12px rgba(220, 38, 38, 0.25);
    }
    .btn-blacklist-submit:hover:not(:disabled) {
      background: #991b1b;
      transform: translateY(-1px);
    }
    .btn-blacklist-submit:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    .phone-highlight {
      color: #dc2626;
      font-weight: 800;
      font-size: 0.92rem;
    }
    .budget-highlight {
      color: #10b981;
      font-weight: 800;
      font-size: 0.95rem;
    }
    .rating-summary-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.45rem 0.85rem;
      background: #fef3c7;
      border: 1px solid #fde68a;
      border-radius: 9999px;
      color: #92400e;
      font-weight: 700;
      font-size: 0.85rem;
    }
    .stars-badge {
      display: inline-flex;
      align-items: center;
      padding: 0.25rem 0.6rem;
      border-radius: 6px;
      font-weight: 800;
      font-size: 0.82rem;
      background: #fef3c7;
      color: #d97706;
      border: 1px solid #fde68a;
    }
    .btn-avis-action {
      background: rgba(37, 99, 235, 0.1);
      color: #2563eb;
      border-color: rgba(37, 99, 235, 0.3);
    }
    .btn-avis-action:hover {
      background: #2563eb;
      color: #ffffff;
    }

    @media (max-width: 768px) {
      .admin-container {
        padding: 1rem 0.5rem;
      }
      .admin-header {
        flex-direction: column;
        align-items: stretch;
        gap: 0.85rem;
      }
      .title-group h2 {
        font-size: 1.45rem;
      }
      .btn-refresh {
        width: 100%;
        text-align: center;
      }
      .metrics-grid {
        grid-template-columns: 1fr 1fr;
        gap: 0.75rem;
      }
      .metric-card {
        padding: 0.95rem;
        gap: 0.65rem;
      }
      .metric-icon svg {
        width: 24px;
        height: 24px;
      }
      .metric-value {
        font-size: 1.4rem;
      }
      .metric-label {
        font-size: 0.75rem;
      }
      .nav-tabs {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 0.45rem;
      }
      .tab-btn {
        width: 100%;
        text-align: center;
        padding: 0.55rem 0.65rem;
        font-size: 0.8rem;
      }
      .filter-bar {
        flex-direction: column;
        gap: 0.5rem;
      }
      .search-input {
        min-width: 100%;
      }
      .select-filter {
        width: 100%;
      }
      .modal-card {
        margin: 1rem;
        max-width: calc(100vw - 2rem);
      }
    }

    @media (max-width: 480px) {
      .metrics-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class AdminPanellComponent implements OnInit {
  /** Llista de totes les tasques de la plataforma */
  tasques: Tasca[] = [];
  /** Llista de totes les ofertes i pressupostos presentats */
  ofertes: Oferta[] = [];
  /** Llista de totes les incidències registrades */
  incidencies: Incidencia[] = [];
  /** Llista de tots els usuaris donats d'alta */
  usuaris: Usuari[] = [];
  /** Llista de tots els pressupostos privats per a incidències */
  pressupostos: Pressupost[] = [];
  /** Llista de totes les ressenyes registrades */
  resenyes: Resenya[] = [];
  /** Llista de tots els avisos i notificacions */
  avisos: Avis[] = [];
  /** Total de notificacions i avisos */
  totalAvisos = 0;
  /** Llista de tots els telèfons a la llista negra */
  blacklist: BlacklistTelefon[] = [];

  /** Pestanya actual seleccionada */
  tabActiva: AdminTab = 'tasques';

  /** Criteris de cerca i filtres */
  searchTasca = '';
  filtreEstatTasca = 'tots';

  searchOferta = '';

  searchIncidencia = '';

  searchPressupost = '';

  searchResenya = '';

  searchAvis = '';
  nouAvis = { usuariId: '', missatge: '', enllac: '' };
  enviantAvis = false;

  searchUsuari = '';
  filtreRolUsuari = 'tots';

  searchBlacklist = '';
  nouTelefonBlacklist = '';
  nouMotiuBlacklist = '';
  afegintBlacklist = false;

  /** Estat de càrrega */
  loading = true;
  /** Missatges informatius */
  successMsg = '';
  errorMsg = '';

  /** Estat del modal d'assignació de nova contrasenya (l'administrador no necessita la contrasenya antiga) */
  modalPasswordObert = false;
  usuariSeleccionat: Usuari | null = null;
  novaContrasenya = '';
  confirmarContrasenya = '';
  mostrarPassword = false;
  savingPassword = false;
  errorModalPassword = '';

  /** Estat del modal d'assignació de fotografia de fons per a professionals recomanats */
  modalFotoObert = false;
  usuariFotoSeleccionat: Usuari | null = null;
  fotoUrlInput = '';
  guardantFoto = false;
  errorFoto = '';

  /** Galeria de fotografies recomanades per a diferents oficis de la llar */
  readonly fotoPresets = [
    { nom: 'Lampisteria', url: 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?w=800&auto=format&fit=crop&q=80' },
    { nom: 'Electricitat', url: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&auto=format&fit=crop&q=80' },
    { nom: 'Pintura', url: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=800&auto=format&fit=crop&q=80' },
    { nom: 'Climatització', url: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=800&auto=format&fit=crop&q=80' },
    { nom: 'Fusteria', url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&auto=format&fit=crop&q=80' },
    { nom: 'Reformes', url: 'https://images.unsplash.com/photo-1541888946425-d0fbb186156f?w=800&auto=format&fit=crop&q=80' },
    { nom: 'Neteja', url: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&auto=format&fit=crop&q=80' },
    { nom: 'Jardineria', url: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=800&auto=format&fit=crop&q=80' }
  ];

  constructor(
    private readonly tascaService: TascaService,
    private readonly ofertaService: OfertaService,
    private readonly pressupostService: PressupostService,
    private readonly incidenciaService: IncidenciaService,
    private readonly usuariService: UsuariService,
    private readonly avisService: AvisService,
    private readonly resenyaService: ResenyaService,
    private readonly blacklistService: BlacklistService,
    private readonly authService: AuthService,
    private readonly confirmService: ConfirmService,
    private readonly router: Router
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

  /**
   * Cicle de vida inicial del component: obté totes les dades del backend.
   */
  ngOnInit(): void {
    this.carregarDades();
  }

  /**
   * Carrega en paral·lel totes les tasques, ofertes, incidències, usuaris i avisos de PostgreSQL.
   */
  carregarDades(): void {
    this.loading = true;
    this.errorMsg = '';

    this.tascaService.getAll().subscribe({
      next: (t) => this.tasques = t,
      error: () => this.errorMsg = 'Error en carregar les tasques.'
    });

    this.ofertaService.getAll().subscribe({
      next: (o) => this.ofertes = o,
      error: () => this.errorMsg = 'Error en carregar les ofertes.'
    });

    this.incidenciaService.getAll().subscribe({
      next: (i) => this.incidencies = i,
      error: () => this.errorMsg = 'Error en carregar les incidències.'
    });

    this.pressupostService.getAll().subscribe({
      next: (p) => this.pressupostos = p,
      error: () => {}
    });

    this.resenyaService.getAll().subscribe({
      next: (r) => this.resenyes = r,
      error: () => {}
    });

    this.usuariService.getAll().subscribe({
      next: (u) => {
        this.usuaris = u;
        this.loading = false;
      },
      error: () => {
        this.errorMsg = 'Error en carregar els usuaris.';
        this.loading = false;
      }
    });

    this.avisService.getAll().subscribe({
      next: (a) => {
        this.avisos = a;
        this.totalAvisos = a.length;
      },
      error: () => {
        this.avisos = [];
        this.totalAvisos = 0;
      }
    });

    this.blacklistService.getAll().subscribe({
      next: (bl) => this.blacklist = bl,
      error: () => this.blacklist = []
    });
  }

  /**
   * Canvia la pestanya de supervisió activa.
   * @param tab Nova pestanya seleccionada
   */
  canviarTab(tab: AdminTab): void {
    this.tabActiva = tab;
  }

  /**
   * Filtra les tasques segons el text de cerca i l'estat seleccionat.
   */
  get tasquesFiltrades(): Tasca[] {
    return this.tasques.filter(t => {
      const clientName = t.clientNom || t.client || '';
      const matchSearch =
        !this.searchTasca ||
        t.titol?.toLowerCase().includes(this.searchTasca.toLowerCase()) ||
        clientName.toLowerCase().includes(this.searchTasca.toLowerCase()) ||
        t.descripcio?.toLowerCase().includes(this.searchTasca.toLowerCase()) ||
        t.categoria?.toLowerCase().includes(this.searchTasca.toLowerCase());

      const matchEstat =
        this.filtreEstatTasca === 'tots' ||
        t.estat?.toLowerCase().includes(this.filtreEstatTasca);

      return matchSearch && matchEstat;
    });
  }

  /**
   * Filtra les ofertes segons el text de cerca i l'estat seleccionat.
   */
  get ofertesFiltrades(): Oferta[] {
    return this.ofertes.filter(o => {
      const proName = o.professionalNom || o.professional || '';
      return (
        !this.searchOferta ||
        proName.toLowerCase().includes(this.searchOferta.toLowerCase()) ||
        o.tascaId?.toLowerCase().includes(this.searchOferta.toLowerCase()) ||
        o.note?.toLowerCase().includes(this.searchOferta.toLowerCase()) ||
        o.price?.toLowerCase().includes(this.searchOferta.toLowerCase())
      );
    });
  }

  /**
   * Filtra les incidències segons el text de cerca (sense filtre d'estat ja que les incidències no tenen estat).
   */
  get incidenciesFiltrades(): Incidencia[] {
    return this.incidencies.filter(i => {
      const clientName = i.clientNom || i.client || '';
      return (
        !this.searchIncidencia ||
        i.titol?.toLowerCase().includes(this.searchIncidencia.toLowerCase()) ||
        clientName.toLowerCase().includes(this.searchIncidencia.toLowerCase()) ||
        i.descripcio?.toLowerCase().includes(this.searchIncidencia.toLowerCase()) ||
        i.categoria?.toLowerCase().includes(this.searchIncidencia.toLowerCase())
      );
    });
  }

  /**
   * Filtra els usuaris segons el text de cerca i el rol seleccionat.
   */
  get usuarisFiltrats(): Usuari[] {
    return this.usuaris.filter(u => {
      const matchSearch =
        !this.searchUsuari ||
        u.nom?.toLowerCase().includes(this.searchUsuari.toLowerCase()) ||
        u.email?.toLowerCase().includes(this.searchUsuari.toLowerCase()) ||
        u.telefon?.toLowerCase().includes(this.searchUsuari.toLowerCase());

      const matchRol =
        this.filtreRolUsuari === 'tots' ||
        u.rol?.toLowerCase() === this.filtreRolUsuari;

      return matchSearch && matchRol;
    });
  }

  /**
   * Acció d'administrador: finalitza una tasca canviant el seu estat a 'Finalitzada'.
   * @param id Identificador de la tasca
   */
  async finalitzarTasca(id: string): Promise<void> {
    const confirmacio = await this.confirmService.confirm({
      title: 'Finalitzar Tasca (Admin)',
      message: `Com a Administrador, segur que vols marcar la tasca ${id} com a finalitzada?`,
      confirmText: 'Finalitzar Tasca',
      cancelText: 'Cancel·lar',
      icon: 'question'
    });
    if (!confirmacio) return;

    this.tascaService.complete(id).subscribe({
      next: () => {
        this.successMsg = `Tasca ${id} finalitzada amb èxit!`;
        const t = this.tasques.find(x => x.id === id);
        if (t) t.estat = 'Finalitzada';
        setTimeout(() => this.successMsg = '', 3500);
      },
      error: () => this.errorMsg = 'Error en finalitzar la tasca.'
    });
  }

  /**
   * Acció d'administrador: elimina una tasca del sistema.
   * @param id Identificador de la tasca a suprimir
   */
  async eliminarTasca(id: string): Promise<void> {
    const confirmacio = await this.confirmService.confirm({
      title: 'CONFIRM_MODAL.DELETE_TASK_TITLE',
      message: 'CONFIRM_MODAL.DELETE_TASK_MSG',
      confirmText: 'CONFIRM_MODAL.DEFAULT_CONFIRM',
      cancelText: 'CONFIRM_MODAL.DEFAULT_CANCEL',
      isDanger: true,
      icon: 'danger'
    });
    if (!confirmacio) return;

    this.tascaService.delete(id).subscribe({
      next: () => {
        this.tasques = this.tasques.filter(t => t.id !== id);
        this.ofertes = this.ofertes.filter(o => o.tascaId !== id);
        this.successMsg = `Tasca ${id} eliminada correctament.`;
        setTimeout(() => this.successMsg = '', 3500);
      },
      error: () => this.errorMsg = 'Error en eliminar la tasca.'
    });
  }

  /**
   * Acció d'administrador: accepta una oferta i adjudica la tasca.
   * @param offerId Identificador de l'oferta
   */
  acceptarOferta(offerId: string): void {
    this.ofertaService.accept(offerId).subscribe({
      next: () => {
        this.successMsg = `Oferta ${offerId} acceptada com a Administrador!`;
        this.carregarDades();
        setTimeout(() => this.successMsg = '', 3500);
      },
      error: () => this.errorMsg = 'Error en acceptar l’oferta.'
    });
  }

  /**
   * Acció d'administrador: elimina/borra una oferta concreta.
   * Les ofertes no tenen estat: s'accepten o es borren.
   * @param offerId Identificador de l'oferta
   */
  async eliminarOferta(offerId: string): Promise<void> {
    const confirmacio = await this.confirmService.confirm({
      title: 'CONFIRM_MODAL.DELETE_OFFER_TITLE',
      message: 'CONFIRM_MODAL.DELETE_OFFER_MSG',
      confirmText: 'CONFIRM_MODAL.DEFAULT_CONFIRM',
      cancelText: 'CONFIRM_MODAL.DEFAULT_CANCEL',
      isDanger: true,
      icon: 'danger'
    });
    if (!confirmacio) return;

    this.ofertaService.delete(offerId).subscribe({
      next: () => {
        this.ofertes = this.ofertes.filter(x => x.id !== offerId);
        this.successMsg = `Oferta ${offerId} borrada correctament.`;
        setTimeout(() => this.successMsg = '', 3500);
      },
      error: () => this.errorMsg = 'Error en borrar l’oferta.'
    });
  }

  /**
   * Acció d'administrador: elimina definitivament una incidència del sistema.
   * Les incidències no tenen estat: o es mantenen actives o es borren / passen a tasca.
   * @param id Identificador de la incidència
   */
  async eliminarIncidencia(id: string): Promise<void> {
    const confirmacio = await this.confirmService.confirm({
      title: 'CONFIRM_MODAL.DELETE_TASK_TITLE',
      message: 'CONFIRM_MODAL.DELETE_TASK_MSG',
      confirmText: 'CONFIRM_MODAL.DEFAULT_CONFIRM',
      cancelText: 'CONFIRM_MODAL.DEFAULT_CANCEL',
      isDanger: true,
      icon: 'danger'
    });
    if (!confirmacio) return;

    this.incidenciaService.delete(id).subscribe({
      next: () => {
        this.incidencies = this.incidencies.filter(x => x.id !== id);
        this.successMsg = `Incidència ${id} eliminada correctament.`;
        setTimeout(() => this.successMsg = '', 3500);
      },
      error: () => this.errorMsg = 'Error en eliminar la incidència.'
    });
  }

  /**
   * Filtra els pressupostos segons el terme de cerca de l'administrador.
   */
  get pressupostosFiltrats(): Pressupost[] {
    if (!this.searchPressupost.trim()) return this.pressupostos;
    const q = this.searchPressupost.toLowerCase();
    return this.pressupostos.filter(p =>
      p.id?.toLowerCase().includes(q) ||
      p.incidenciaId?.toLowerCase().includes(q) ||
      p.incidenciaTitol?.toLowerCase().includes(q) ||
      p.professionalNom?.toLowerCase().includes(q) ||
      p.descripcio?.toLowerCase().includes(q) ||
      p.preu?.toLowerCase().includes(q)
    );
  }

  /**
   * Acció d'administrador: elimina definitivament un pressupost privat del sistema.
   * @param id Identificador del pressupost
   */
  async eliminarPressupost(id: string): Promise<void> {
    const confirmacio = await this.confirmService.confirm({
      title: 'CONFIRM_MODAL.DELETE_OFFER_TITLE',
      message: `Com a Administrador, segur que vols eliminar el pressupost ${id}? Aquesta acció és irreversible.`,
      confirmText: 'CONFIRM_MODAL.DEFAULT_CONFIRM',
      cancelText: 'CONFIRM_MODAL.DEFAULT_CANCEL',
      isDanger: true,
      icon: 'danger'
    });
    if (!confirmacio) return;

    this.pressupostService.reject(id).subscribe({
      next: () => {
        this.pressupostos = this.pressupostos.filter(x => x.id !== id);
        this.successMsg = `Pressupost ${id} eliminat correctament.`;
        setTimeout(() => this.successMsg = '', 3500);
      },
      error: () => this.errorMsg = 'Error en eliminar el pressupost.'
    });
  }

  /**
   * Filtra les ressenyes segons el text de cerca de l'administrador.
   */
  get resenyesFiltrades(): Resenya[] {
    if (!this.searchResenya.trim()) return this.resenyes;
    const q = this.searchResenya.toLowerCase();
    return this.resenyes.filter(r => {
      const client = r.clientNom || r.clientId || '';
      const treballador = r.treballadorNom || r.treballadorId || '';
      return (
        r.id?.toLowerCase().includes(q) ||
        client.toLowerCase().includes(q) ||
        treballador.toLowerCase().includes(q) ||
        r.descripcio?.toLowerCase().includes(q) ||
        r.tascaId?.toLowerCase().includes(q)
      );
    });
  }

  /**
   * Calcula la puntuació mitjana de totes les valoracions de la plataforma.
   */
  mitjanaRessenyes(): string {
    if (!this.resenyes || this.resenyes.length === 0) return '0.0';
    const sum = this.resenyes.reduce((acc, curr) => acc + (curr.puntuacio || 0), 0);
    return (sum / this.resenyes.length).toFixed(1);
  }

  /**
   * Filtra les notificacions i avisos segons el text de cerca.
   */
  get avisosFiltrats(): Avis[] {
    if (!this.searchAvis.trim()) return this.avisos;
    const q = this.searchAvis.toLowerCase();
    return this.avisos.filter(a =>
      a.id?.toLowerCase().includes(q) ||
      a.usuariId?.toLowerCase().includes(q) ||
      a.missatge?.toLowerCase().includes(q) ||
      a.enllac?.toLowerCase().includes(q)
    );
  }

  /**
   * Prepara el formulari per enviar un avís personalitzat a un usuari des de la taula d'usuaris.
   * @param u Usuari seleccionat
   */
  prepararAvisUsuari(u: Usuari): void {
    this.tabActiva = 'avisos';
    this.nouAvis.usuariId = u.id;
    this.nouAvis.missatge = `Notificació de l'Administració per a ${u.nom}: `;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /**
   * Envia una nova notificació del sistema a un usuari des del formulari administratiu.
   */
  enviarNouAvis(): void {
    if (!this.nouAvis.usuariId || !this.nouAvis.missatge.trim()) return;

    this.enviantAvis = true;
    this.avisService.create({
      usuariId: this.nouAvis.usuariId,
      missatge: this.nouAvis.missatge.trim(),
      enllac: this.nouAvis.enllac.trim() || undefined,
      llegit: false,
      data: new Date().toISOString()
    }).subscribe({
      next: (creat) => {
        this.enviantAvis = false;
        this.avisos = [creat, ...this.avisos];
        this.totalAvisos = this.avisos.length;
        this.nouAvis = { usuariId: '', missatge: '', enllac: '' };
        this.successMsg = 'Notificació enviada correctament!';
        setTimeout(() => this.successMsg = '', 4000);
      },
      error: () => {
        this.enviantAvis = false;
        this.errorMsg = "Error en enviar l'avís.";
        setTimeout(() => this.errorMsg = '', 4000);
      }
    });
  }

  /**
   * Elimina un avís del sistema com a administrador.
   * @param id Identificador de l'avís
   */
  async eliminarAvis(id: string): Promise<void> {
    const confirmacio = await this.confirmService.confirm({
      title: 'CONFIRM_MODAL.DELETE_TASK_TITLE',
      message: `Vols eliminar definitivament aquesta notificació (${id})?`,
      confirmText: 'CONFIRM_MODAL.DEFAULT_CONFIRM',
      cancelText: 'CONFIRM_MODAL.DEFAULT_CANCEL',
      isDanger: true,
      icon: 'danger'
    });
    if (!confirmacio) return;

    this.avisService.delete(id).subscribe({
      next: () => {
        this.avisos = this.avisos.filter(x => x.id !== id);
        this.totalAvisos = this.avisos.length;
        this.successMsg = 'Notificació eliminada correctament.';
        setTimeout(() => this.successMsg = '', 3500);
      },
      error: () => this.errorMsg = "Error en eliminar la notificació."
    });
  }

  /**
   * Filtra ràpidament tasques per estat des del recomptador de dalt.
   */
  filtrarPerEstatTasca(estat: string, event?: Event): void {
    if (event) event.stopPropagation();
    this.tabActiva = 'tasques';
    this.filtreEstatTasca = estat;
  }

  /**
   * Filtra ràpidament usuaris per rol des del recomptador de dalt.
   */
  filtrarPerRolUsuari(rol: string, event?: Event): void {
    if (event) event.stopPropagation();
    this.tabActiva = 'usuaris';
    this.filtreRolUsuari = rol;
  }

  /** Recompte d'usuaris amb rol client */
  countClients(): number {
    return this.usuaris.filter(u => u.rol?.toLowerCase() === 'client').length;
  }

  /** Recompte d'usuaris amb rol professional */
  countProfessionals(): number {
    return this.usuaris.filter(u => u.rol?.toLowerCase() === 'professional').length;
  }

  /** Recompte de tasques finalitzades */
  countTasquesFinalitzades(): number {
    return this.tasques.filter(t => t.estat?.toLowerCase().includes('finalitzad')).length;
  }

  /** Recompte de tasques en estat obert */
  countTasquesObertes(): number {
    return this.tasques.filter(t => t.estat?.toLowerCase().includes('obert')).length;
  }

  /** Recompte de tasques en curs */
  countTasquesEnCurs(): number {
    return this.tasques.filter(t => t.estat?.toLowerCase().includes('curs')).length;
  }

  /** Recompte d'ofertes acceptades */
  countOfertesAcceptades(): number {
    return this.ofertes.filter(o => o.estat?.toLowerCase().includes('accept')).length;
  }

  /** Retorna classe CSS segons l'estat de la tasca */
  getEstatTascaClass(estat: string): string {
    const e = estat?.toLowerCase() || '';
    if (e.includes('obert')) return 'badge-oberta';
    if (e.includes('curs')) return 'badge-en-curs';
    if (e.includes('finalitzad')) return 'badge-finalitzada';
    return '';
  }

  /** Retorna classe CSS segons l'estat de l'oferta */
  getEstatOfertaClass(estat: string): string {
    const e = estat?.toLowerCase() || '';
    if (e.includes('pend')) return 'badge-pendent';
    if (e.includes('accept')) return 'badge-acceptada';
    if (e.includes('rebutj')) return 'badge-rebutjada';
    return '';
  }

  /**
   * Obre el formulari modal perquè l'administrador assigne una nova contrasenya.
   * Privilegi d'administrador: no cal conèixer ni veure la contrasenya antiga.
   * @param u Usuari seleccionat
   */
  obrirModalPassword(u: Usuari): void {
    this.usuariSeleccionat = u;
    this.novaContrasenya = '';
    this.confirmarContrasenya = '';
    this.mostrarPassword = false;
    this.errorModalPassword = '';
    this.modalPasswordObert = true;
  }

  /**
   * Tanca el formulari modal de contrasenya.
   */
  tancarModalPassword(): void {
    this.modalPasswordObert = false;
    this.usuariSeleccionat = null;
    this.novaContrasenya = '';
    this.confirmarContrasenya = '';
    this.errorModalPassword = '';
  }

  /**
   * Envia la nova contrasenya al backend per a actualitzar la base de dades directament.
   */
  guardarNovaPassword(): void {
    if (!this.usuariSeleccionat) return;
    this.errorModalPassword = '';

    if (!this.novaContrasenya || this.novaContrasenya.trim().length < 6) {
      this.errorModalPassword = 'La nova contrasenya ha de tenir com a mínim 6 caràcters.';
      return;
    }

    if (this.novaContrasenya !== this.confirmarContrasenya) {
      this.errorModalPassword = 'Les dues contrasenyes introduïdes no coincideixen.';
      return;
    }

    this.savingPassword = true;
    const userId = this.usuariSeleccionat.id;
    const userNom = this.usuariSeleccionat.nom;

    this.authService.canviarContrasenya(userId, this.novaContrasenya.trim()).subscribe({
      next: () => {
        this.savingPassword = false;
        this.tancarModalPassword();
        this.successMsg = `S'ha assignat la nova contrasenya a ${userNom} correctament!`;
        setTimeout(() => this.successMsg = '', 4500);
      },
      error: (err) => {
        this.savingPassword = false;
        this.errorModalPassword = typeof err?.error === 'string' ? err.error : 'Error en actualitzar la contrasenya.';
      }
    });
  }

  /**
   * Obre el modal per assignar o modificar la fotografia de fons del professional seleccionat.
   */
  obrirModalFoto(u: Usuari): void {
    this.usuariFotoSeleccionat = u;
    this.fotoUrlInput = u.foto || '';
    this.errorFoto = '';
    this.modalFotoObert = true;
  }

  /**
   * Tanca el modal de gestió de fotografia.
   */
  tancarModalFoto(): void {
    this.modalFotoObert = false;
    this.usuariFotoSeleccionat = null;
    this.fotoUrlInput = '';
    this.errorFoto = '';
  }

  /**
   * Selecciona una imatge preset de la galeria d'oficis.
   */
  seleccionarPresetFoto(url: string): void {
    this.fotoUrlInput = url;
  }

  /**
   * Determina el nom de l'ofici del professional per mostrar a la vista prèvia.
   */
  getEspecialitatNom(u: Usuari | null): string {
    if (!u) return 'Servei Professional';
    const nom = u.nom.toLowerCase();
    if (nom.includes('lampist') || nom.includes('fontan')) return 'Lampisteria';
    if (nom.includes('electr')) return 'Electricitat';
    if (nom.includes('pint')) return 'Pintura i Decoració';
    if (nom.includes('clima') || nom.includes('aire')) return 'Climatització';
    if (nom.includes('fust') || nom.includes('carpint')) return 'Fusteria';
    if (nom.includes('reforma') || nom.includes('palet')) return 'Reformes i Paleteria';
    return 'Professional Certificat';
  }

  /**
   * Guarda la fotografia al backend per al professional seleccionat.
   */
  guardarFoto(): void {
    if (!this.usuariFotoSeleccionat) return;
    this.guardantFoto = true;
    this.errorFoto = '';

    const url = this.fotoUrlInput.trim();
    const userId = this.usuariFotoSeleccionat.id;
    const userNom = this.usuariFotoSeleccionat.nom;

    this.usuariService.assignarFoto(userId, url).subscribe({
      next: (actualitzat) => {
        this.guardantFoto = false;
        this.usuaris = this.usuaris.map(u => u.id === actualitzat.id ? { ...u, foto: actualitzat.foto } : u);
        this.successMsg = `S'ha assignat la fotografia de fons a ${userNom} correctament!`;
        setTimeout(() => this.successMsg = '', 4500);
        this.tancarModalFoto();
      },
      error: (err) => {
        this.guardantFoto = false;
        this.errorFoto = err?.error?.message || 'Error en actualitzar la fotografia del professional.';
      }
    });
  }

  /**
   * Elimina la fotografia assignada al professional.
   */
  eliminarFoto(): void {
    if (!this.usuariFotoSeleccionat) return;
    this.guardantFoto = true;
    this.errorFoto = '';

    const userId = this.usuariFotoSeleccionat.id;
    const userNom = this.usuariFotoSeleccionat.nom;

    this.usuariService.assignarFoto(userId, '').subscribe({
      next: (actualitzat) => {
        this.guardantFoto = false;
        this.usuaris = this.usuaris.map(u => u.id === actualitzat.id ? { ...u, foto: undefined } : u);
        this.successMsg = `S'ha eliminat la fotografia de fons de ${userNom}.`;
        setTimeout(() => this.successMsg = '', 4500);
        this.tancarModalFoto();
      },
      error: (err) => {
        this.guardantFoto = false;
        this.errorFoto = err?.error?.message || 'Error en eliminar la fotografia.';
      }
    });
  }

  /**
   * Acció d'administrador: elimina definitivament un usuari del sistema.
   * Protegeix el compte d'administrador principal contra eliminació accidental.
   * @param u Usuari seleccionat per a ser donat de baixa
   */
  async eliminarUsuari(u: Usuari): Promise<void> {
    if (u.id === 'u-admin' || u.email?.toLowerCase() === 'admin@admin' || u.email?.toLowerCase() === 'admin@admin.es') {
      this.confirmService.alert("No es pot eliminar el compte d'administrador principal del sistema.", "Acció no permesa");
      return;
    }

    const confirmMsg = `ATENCIÓ: Vols eliminar definitivament l'usuari "${u.nom}" (${u.email})?\n\n` +
      `Es cancel·larà el seu accés i s'esborraran els seus avisos associats.\n` +
      `Aquesta acció no es pot desfer. Vols continuar?`;

    const confirmacio = await this.confirmService.confirm({
      title: 'CONFIRM_MODAL.DELETE_TASK_TITLE',
      message: confirmMsg,
      confirmText: 'CONFIRM_MODAL.DEFAULT_CONFIRM',
      cancelText: 'CONFIRM_MODAL.DEFAULT_CANCEL',
      isDanger: true,
      icon: 'danger'
    });
    if (!confirmacio) return;

    this.usuariService.delete(u.id).subscribe({
      next: () => {
        this.usuaris = this.usuaris.filter(x => x.id !== u.id);
        this.successMsg = `L'usuari "${u.nom}" (${u.email}) ha estat eliminat correctament.`;
        setTimeout(() => this.successMsg = '', 4500);
      },
      error: () => {
        this.errorMsg = `Error en eliminar l'usuari "${u.nom}". Comprova els permisos del servidor.`;
        setTimeout(() => this.errorMsg = '', 4500);
      }
    });
  }

  // ==========================================
  // MÈTODES DE GESTIÓ DE LA LLISTA NEGRA (BLACKLIST)
  // ==========================================

  /**
   * Filtra els telèfons de la llista negra segons el text de cerca introduït.
   */
  get blacklistFiltrada(): BlacklistTelefon[] {
    if (!this.searchBlacklist.trim()) return this.blacklist;
    const q = this.searchBlacklist.toLowerCase();
    return this.blacklist.filter(b =>
      b.telefon?.toLowerCase().includes(q) ||
      b.motiu?.toLowerCase().includes(q) ||
      b.bloquejatPer?.toLowerCase().includes(q) ||
      b.id?.toLowerCase().includes(q)
    );
  }

  /**
   * Comprova ràpidament si un número de telèfon està bloquejat a la llista negra.
   */
  isTelefonBloquejat(telefon: string | undefined): boolean {
    if (!telefon) return false;
    const clean = telefon.trim();
    const digits = clean.replace(/[^0-9]/g, '');
    const normDigits = digits.startsWith('0034')
      ? digits.slice(4)
      : (digits.startsWith('34') && digits.length >= 11 ? digits.slice(2) : digits);

    return this.blacklist.some(b => {
      if (!b.telefon) return false;
      const bClean = b.telefon.trim();
      if (bClean.toLowerCase() === clean.toLowerCase()) return true;
      const bDigits = bClean.replace(/[^0-9]/g, '');
      const bNorm = bDigits.startsWith('0034')
        ? bDigits.slice(4)
        : (bDigits.startsWith('34') && bDigits.length >= 11 ? bDigits.slice(2) : bDigits);
      return normDigits.length > 0 && bNorm === normDigits;
    });
  }

  /**
   * Afegeix un nou telèfon a la llista negra mitjançant el formulari administratiu.
   */
  afegirABlacklist(): void {
    const tel = this.nouTelefonBlacklist.trim();
    if (!tel) return;

    this.afegintBlacklist = true;
    this.blacklistService.add(tel, this.nouMotiuBlacklist.trim()).subscribe({
      next: (nou) => {
        this.afegintBlacklist = false;
        this.nouTelefonBlacklist = '';
        this.nouMotiuBlacklist = '';
        this.blacklist = [nou, ...this.blacklist];
        this.successMsg = `El telèfon ${nou.telefon} s'ha afegit a la llista negra correctament.`;
        setTimeout(() => this.successMsg = '', 4500);
      },
      error: (err) => {
        this.afegintBlacklist = false;
        this.errorMsg = err?.error?.message || 'Error en afegir el telèfon a la llista negra.';
        setTimeout(() => this.errorMsg = '', 4500);
      }
    });
  }

  /**
   * Elimina un registre de telèfon de la llista negra amb confirmació prèvia.
   */
  async eliminarDeBlacklist(bl: BlacklistTelefon): Promise<void> {
    const conf = await this.confirmService.confirm({
      title: 'ADMIN.BLACKLIST_BTN_UNBLOCK',
      message: `Vols desbloquejar el número de telèfon "${bl.telefon}" de la llista negra? L'usuari podrà tornar a utilitzar-lo a la plataforma.`,
      confirmText: 'ADMIN.BLACKLIST_BTN_UNBLOCK',
      cancelText: 'CONFIRM_MODAL.DEFAULT_CANCEL',
      isDanger: false,
      icon: 'question'
    });
    if (!conf) return;

    this.blacklistService.remove(bl.id).subscribe({
      next: () => {
        this.blacklist = this.blacklist.filter(b => b.id !== bl.id && b.telefon !== bl.telefon);
        this.successMsg = `El telèfon ${bl.telefon} ha estat desbloquejat amb èxit.`;
        setTimeout(() => this.successMsg = '', 4500);
      },
      error: (err) => {
        this.errorMsg = err?.error?.message || 'Error en desbloquejar el telèfon.';
        setTimeout(() => this.errorMsg = '', 4500);
      }
    });
  }

  /**
   * Acció ràpida per bloquejar el telèfon d'un usuari des del llistat d'usuaris.
   */
  async bloquejarTelefonUsuari(u: Usuari): Promise<void> {
    if (!u.telefon) return;
    const conf = await this.confirmService.confirm({
      title: 'ADMIN.BTN_BLOCK_PHONE',
      message: `Vols afegir el número de telèfon "${u.telefon}" de l'usuari "${u.nom}" a la llista negra?`,
      confirmText: 'ADMIN.BLACKLIST_ADD_BTN',
      cancelText: 'CONFIRM_MODAL.DEFAULT_CANCEL',
      isDanger: true,
      icon: 'danger'
    });
    if (!conf) return;

    this.blacklistService.add(u.telefon, `Compte d'usuari: ${u.nom} (${u.email})`).subscribe({
      next: (nou) => {
        this.blacklist = [nou, ...this.blacklist];
        this.successMsg = `El telèfon de ${u.nom} (${nou.telefon}) ha estat bloquejat a la llista negra.`;
        setTimeout(() => this.successMsg = '', 4500);
      },
      error: (err) => {
        this.errorMsg = err?.error?.message || 'Error en bloquejar el telèfon.';
        setTimeout(() => this.errorMsg = '', 4500);
      }
    });
  }

  /**
   * Desbloqueja un telèfon directament a partir del número.
   */
  async desbloquejarPerTelefon(telefon: string): Promise<void> {
    const item = this.blacklist.find(b => b.telefon === telefon);
    const idOrPhone = item ? item.id : telefon;

    const conf = await this.confirmService.confirm({
      title: 'ADMIN.BTN_UNBLOCK_PHONE',
      message: `Vols desbloquejar el número de telèfon "${telefon}" de la llista negra?`,
      confirmText: 'ADMIN.BLACKLIST_BTN_UNBLOCK',
      cancelText: 'CONFIRM_MODAL.DEFAULT_CANCEL',
      isDanger: false,
      icon: 'question'
    });
    if (!conf) return;

    this.blacklistService.remove(idOrPhone).subscribe({
      next: () => {
        this.blacklist = this.blacklist.filter(b => b.telefon !== telefon && b.id !== idOrPhone);
        this.successMsg = `El telèfon ${telefon} s'ha desbloquejat correctament.`;
        setTimeout(() => this.successMsg = '', 4500);
      },
      error: (err) => {
        this.errorMsg = err?.error?.message || 'Error en desbloquejar el telèfon.';
        setTimeout(() => this.errorMsg = '', 4500);
      }
    });
  }
}
