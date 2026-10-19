import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Usuari } from '../../models/usuari.model';
import { UsuariService } from '../../services/usuari.service';
import { AuthService } from '../../core/services/auth.service';
import { Tasca } from '../../models/tasca.model';
import { TascaService } from '../../services/tasca.service';
import { Oferta } from '../../models/oferta.model';
import { OfertaService } from '../../services/oferta.service';
import { IncidenciaService } from '../../services/incidencia.service';
import { TranslationService } from '../../core/services/translation.service';
import { ConfirmService } from '../../core/services/confirm.service';
import { PressupostService } from '../../services/pressupost.service';
import { TranslatePipe } from '../../core/pipes/translate.pipe';

/**
 * Component de Perfil d'Usuari (/perfil).
 * Permet a l'usuari autenticat:
 * 1. Consultar la seva informació actual (nom, correu, rol, telèfon, biografia).
 * 2. Navegar per les seves dades personals, tasques, pressupostos/ofertes i ressenyes.
 * 3. Editar i desar canvis a la base de dades PostgreSQL mitjançant UsuariService.
 * 4. Canviar la seva contrasenya d'accés de forma segura.
 * 5. Visualitzar l'historial complet de feines i valoracions de clients.
 */
@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TranslatePipe],
  template: `
    <section class="perfil-container">
      <!-- Capçalera del Perfil -->
      <header class="perfil-header">
        <div class="avatar-badge">
          {{ userInitial }}
        </div>
        <div class="header-info">
          <div class="header-name-row">
            <h1>{{ usuari?.nom || ('PERFIL.TITLE_OWN' | translate) }}</h1>
            <div class="pro-rating-badge-head" *ngIf="mitjanaPuntuacio">
              <span class="stars-gold">★ {{ mitjanaPuntuacio }}</span>
              <span class="count-head">({{ totalValoracions }} {{ totalValoracions === 1 ? ('PERFIL.RATING_COUNT_SINGULAR' | translate) : ('PERFIL.RATING_COUNT_PLURAL' | translate) }})</span>
            </div>
          </div>
          <p class="email">{{ usuari?.email }}</p>
          <div class="badges-row">
            <span class="role-badge" [ngClass]="usuari?.rol">
              {{ usuari?.rol | uppercase }}
            </span>
            <span class="verified-badge" *ngIf="usuari?.rol === 'professional' && usuari?.verificat">
              {{ 'PERFIL.BADGE_VERIFIED' | translate }}
            </span>
            <span class="pending-badge" *ngIf="usuari?.rol === 'professional' && !usuari?.verificat && usuari?.sollicitudVerificacio">
              {{ 'PERFIL.BADGE_PENDING' | translate }}
            </span>
            <span class="unverified-badge" *ngIf="usuari?.rol === 'professional' && !usuari?.verificat && !usuari?.sollicitudVerificacio">
              {{ 'PERFIL.BADGE_UNVERIFIED' | translate }}
            </span>
          </div>
        </div>
      </header>

      <!-- Barra de navegació de pestanyes del Perfil: Dades / Tasques / Pressupostos / Ressenyes -->
      <nav class="perfil-nav-tabs" aria-label="Apartats del perfil">
        <button
          type="button"
          class="perfil-tab-btn"
          [class.active]="activeTab === 'dades'"
          (click)="setTab('dades')"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
          <span>{{ (isOwnProfile ? 'PERFIL.TAB_DADES' : 'PERFIL.TAB_CONTACTE') | translate }}</span>
        </button>

        <button
          type="button"
          class="perfil-tab-btn"
          [class.active]="activeTab === 'tasques'"
          (click)="setTab('tasques')"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
          </svg>
          <span>{{ 'PERFIL.TAB_TASQUES' | translate }}</span>
          <span class="tab-count-pill" *ngIf="tasquesUsuari.length > 0">{{ tasquesUsuari.length }}</span>
        </button>

        <button
          type="button"
          class="perfil-tab-btn"
          [class.active]="activeTab === 'pressupostos'"
          (click)="setTab('pressupostos')"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="1" x2="12" y2="23"></line>
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
          </svg>
          <span>{{ 'PERFIL.TAB_PRESSUPOSTOS' | translate }}</span>
          <span class="tab-count-pill" *ngIf="ofertesUsuari.length > 0">{{ ofertesUsuari.length }}</span>
        </button>

        <button
          type="button"
          class="perfil-tab-btn"
          [class.active]="activeTab === 'ressenyes'"
          (click)="setTab('ressenyes')"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
          </svg>
          <span>{{ 'PERFIL.TAB_RESSENYES' | translate }}</span>
          <span class="tab-count-pill" *ngIf="tasquesFinalitzades.length > 0">{{ tasquesFinalitzades.length }}</span>
        </button>
      </nav>

      <!-- Missatges d'alerta o notificació -->
      <div *ngIf="successMessage" class="alert alert-success">
        {{ successMessage }}
      </div>
      <div *ngIf="errorMessage" class="alert alert-danger">
        {{ errorMessage }}
      </div>

      <!-- Estat de càrrega de dades del perfil -->
      <div class="tab-loading-state" *ngIf="loadingTabData">
        <p>{{ 'COMMON.CARREGANT' | translate }}</p>
      </div>

      <!-- Vista per al propi perfil (editable - Pestanya Dades) -->
      <div class="perfil-grid" *ngIf="!loadingTabData && activeTab === 'dades' && isOwnProfile">
        <!-- Formulari d'edició de dades bàsiques -->
        <article class="card">
          <h2>{{ 'PERFIL.PERSONAL_DATA_TITLE' | translate }}</h2>
          <p class="subtitle">{{ 'PERFIL.PERSONAL_DATA_SUB' | translate }}</p>

          <form (ngSubmit)="onSaveProfile()">
            <label>
              {{ 'PERFIL.FULL_NAME' | translate }}
              <input type="text" [(ngModel)]="formData.nom" name="nom" required [placeholder]="'PERFIL.FULL_NAME' | translate" />
            </label>

            <label>
              {{ 'PERFIL.EMAIL' | translate }}
              <input type="email" [value]="usuari?.email" disabled class="input-disabled" />
              <small class="hint">{{ 'PERFIL.EMAIL_HINT' | translate }}</small>
            </label>

            <label>
              {{ 'PERFIL.PHONE' | translate }}
              <input type="tel" [(ngModel)]="formData.telefon" name="telefon" placeholder="+34 600 000 000" />
            </label>

            <label>
              {{ 'PERFIL.BIO' | translate }}
              <textarea [(ngModel)]="formData.bio" name="bio" rows="4" [placeholder]="'PERFIL.BIO_PLACEHOLDER' | translate"></textarea>
            </label>

            <!-- Percentil de comissió reservat per a la plataforma (0-100%, defecte 3%) -->
            <label class="percentil-form-group">
              {{ 'PERFIL.COMMISSION_PERCENTILE' | translate }}
              <div class="percentil-input-row" style="display: flex; align-items: center; gap: 0.75rem; margin-top: 0.35rem;">
                <input
                  type="number"
                  [(ngModel)]="formData.percentil"
                  name="percentil"
                  [min]="isAdmin ? 0 : (usuari?.percentil ?? 3)"
                  max="100"
                  step="1"
                  required
                  style="max-width: 130px; font-weight: 700;"
                />
                <span class="percentil-badge-pill" style="background: #eff6ff; color: #1d4ed8; font-weight: 800; padding: 0.35rem 0.75rem; border-radius: 6px; font-size: 0.85rem; border: 1px solid #bfdbfe;">
                  {{ formData.percentil ?? (usuari?.percentil ?? 3) }}% {{ 'PERFIL.COMMISSION_RESERVED' | translate }}
                </span>
              </div>
              <small class="hint" *ngIf="isAdmin" style="color: #059669; font-weight: 600; margin-top: 0.3rem; display: block;">
                {{ 'PERFIL.ADMIN_PERCENTILE_HINT' | translate }}
              </small>
              <small class="hint" *ngIf="!isAdmin" style="margin-top: 0.3rem; display: block;">
                {{ 'PERFIL.USER_PERCENTILE_HINT' | translate }}
              </small>
              <div class="commission-simulation-box" style="margin-top: 0.5rem; padding: 0.6rem 0.85rem; background: #fdfbf7; border: 1px dashed #dcd6cb; border-radius: 6px; font-size: 0.82rem; color: #4b4841;">
                <strong>{{ 'PERFIL.COMMISSION_SIMULATION_TITLE' | translate }}</strong> {{ 'PERFIL.COMMISSION_SIMULATION_TEXT' | translate }} <strong>{{ getCommissionSimulation() }}€</strong> {{ 'PERFIL.COMMISSION_SIMULATION_END' | translate }}
              </div>
            </label>

            <button type="submit" class="btn btn-primary" [disabled]="saving">
              {{ saving ? ('PERFIL.SAVING' | translate) : ('PERFIL.SAVE_CHANGES' | translate) }}
            </button>
          </form>
        </article>

        <!-- Secció de Seguretat i Canvi de contrasenya -->
        <div class="side-column">
          <article class="card">
            <h2>{{ 'PERFIL.ACCOUNT_SECURITY' | translate }}</h2>
            <p class="subtitle">{{ 'PERFIL.ACCOUNT_SECURITY_SUB' | translate }}</p>

            <form (ngSubmit)="onChangePassword()">
              <label>
                {{ 'PERFIL.NEW_PASSWORD' | translate }}
                <input type="password" [(ngModel)]="passwordData.newPassword" name="newPassword" required minlength="6" placeholder="Mínim 6 caràcters" />
              </label>

              <label>
                {{ 'PERFIL.REPEAT_PASSWORD' | translate }}
                <input type="password" [(ngModel)]="passwordData.confirmPassword" name="confirmPassword" required placeholder="Repeteix la contrasenya" />
              </label>

              <button type="submit" class="btn btn-secondary" [disabled]="changingPassword">
                {{ changingPassword ? ('PERFIL.UPDATING_PASSWORD' | translate) : ('PERFIL.UPDATE_PASSWORD' | translate) }}
              </button>
            </form>
          </article>

          <!-- Targeta de Verificació Professional Oficial -->
          <article class="card verification-card" *ngIf="usuari?.rol === 'professional'">
            <div class="verif-card-header">
              <span class="verif-icon" [class.verified]="usuari?.verificat">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                  <polyline points="9 12 11 14 15 10" *ngIf="usuari?.verificat"></polyline>
                  <line x1="12" y1="8" x2="12" y2="12" *ngIf="!usuari?.verificat"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16" *ngIf="!usuari?.verificat"></line>
                </svg>
              </span>
              <div>
                <h2>{{ 'PERFIL.VERIF_STATUS_TITLE' | translate }}</h2>
                <span class="verif-status-pill" [ngClass]="getVerifStatusClass()">
                  {{ getVerifStatusLabel() }}
                </span>
              </div>
            </div>

            <p class="subtitle" style="margin-top: 0.65rem;">
              {{ getVerifDescription() }}
            </p>

            <div class="verif-checklist">
              <div class="check-item" [class.valid]="!!usuari?.email">
                <span class="check-icon">{{ !!usuari?.email ? '✓' : '✗' }}</span>
                <span>{{ 'PERFIL.EMAIL_REGISTERED' | translate }} <strong>{{ usuari?.email || 'Mancant' }}</strong></span>
              </div>
              <div class="check-item" [class.valid]="!!usuari?.telefon">
                <span class="check-icon">{{ !!usuari?.telefon ? '✓' : '✗' }}</span>
                <span>{{ 'PERFIL.PHONE_CALL' | translate }} <strong>{{ usuari?.telefon || 'Cal afegir un telèfon' }}</strong></span>
              </div>
            </div>

            <!-- Botó per sol·licitar verificació -->
            <div *ngIf="!usuari?.verificat && !usuari?.sollicitudVerificacio" style="margin-top: 0.85rem;">
              <button
                type="button"
                class="btn btn-verif"
                (click)="onSollicitarVerificacio()"
                [disabled]="sollicitantVerificacio || !usuari?.telefon">
                {{ sollicitantVerificacio ? ('PERFIL.REQUESTING_VERIF' | translate) : ('PERFIL.BTN_REQUEST_VERIF' | translate) }}
              </button>
              <small *ngIf="!usuari?.telefon" class="field-error-text" style="display:block; margin-top: 0.35rem;">
                {{ 'PERFIL.PHONE_REQUIRED_FOR_VERIF' | translate }}
              </small>
            </div>

            <!-- Avís si la sol·licitud està pendent de trucada -->
            <div *ngIf="!usuari?.verificat && usuari?.sollicitudVerificacio" class="pending-notice-box" style="margin-top: 0.85rem;">
              <span class="notice-icon">📞</span>
              <div>
                <strong>{{ 'PERFIL.VERIF_PENDING_TITLE' | translate }}</strong> {{ 'PERFIL.VERIF_PENDING_DESC' | translate }}
              </div>
            </div>

            <!-- Avís si ja està verificat -->
            <div *ngIf="usuari?.verificat" class="verified-notice-box" style="margin-top: 0.85rem;">
              <span class="notice-icon">✓</span>
              <div>
                <strong>{{ 'PERFIL.VERIF_OFFICIAL_TITLE' | translate }}</strong> {{ 'PERFIL.VERIF_OFFICIAL_DESC' | translate }}
              </div>
            </div>

            <!-- Accions de l'Administrador -->
            <div *ngIf="isAdmin" class="admin-verif-actions" style="margin-top: 1.15rem; padding-top: 0.85rem; border-top: 1px dashed #cbd5e1;">
              <p style="font-size: 0.8rem; font-weight: 700; color: #475569; margin-bottom: 0.5rem;">
                {{ 'PERFIL.ADMIN_VERIF_TITLE' | translate }}
              </p>
              <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                <button
                  type="button"
                  class="btn btn-success-sm"
                  *ngIf="!usuari?.verificat"
                  (click)="onVerificarProfessional(true)"
                  [disabled]="processantVerificacioAdmin">
                  {{ 'PERFIL.ADMIN_APPROVE_VERIF' | translate }}
                </button>
                <button
                  type="button"
                  class="btn btn-danger-sm"
                  *ngIf="usuari?.verificat || usuari?.sollicitudVerificacio"
                  (click)="onVerificarProfessional(false)"
                  [disabled]="processantVerificacioAdmin">
                  {{ 'PERFIL.ADMIN_REJECT_VERIF' | translate }}
                </button>
              </div>
            </div>
          </article>

          <!-- Targeta informativa de rol -->
          <article class="card info-card">
            <h3>{{ 'PERFIL.ROLE_INFO_TITLE' | translate }}</h3>
            <div *ngIf="usuari?.rol === 'client'">
              <p>{{ 'PERFIL.ROLE_CLIENT_INFO' | translate }}</p>
            </div>
            <div *ngIf="usuari?.rol === 'professional'">
              <p>{{ 'PERFIL.ROLE_PRO_INFO' | translate }}</p>
            </div>
            <div *ngIf="usuari?.rol === 'admin'">
              <p>{{ 'PERFIL.ROLE_ADMIN_INFO' | translate }}</p>
            </div>
          </article>
        </div>
      </div>

      <!-- Vista per a perfil públic d'un altre professional o usuari (Pestanya Dades/Contacte) -->
      <div class="perfil-grid" *ngIf="!loadingTabData && activeTab === 'dades' && !isOwnProfile">
        <article class="card">
          <h2>{{ 'PERFIL.PUBLIC_CONTACT_TITLE' | translate }}</h2>
          <p class="subtitle">{{ 'PERFIL.PUBLIC_CONTACT_SUB' | translate }}</p>

          <div class="public-info-list">
            <div class="public-info-row" *ngIf="usuari?.telefon">
              <span class="info-label">{{ 'PERFIL.DIRECT_PHONE' | translate }}</span>
              <div style="display: flex; align-items: center; gap: 0.65rem; flex-wrap: wrap;">
                <strong class="info-value tel-value">{{ usuari?.telefon }}</strong>
                <button type="button" class="btn-quick-contact btn-quick-wa" (click)="contactarPerfilWhatsapp()" [attr.title]="'TASQUES_OFERTES.CONTACTAR_WHATSAPP' | translate">
                  <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
                    <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.664-.698c.97.587 1.761.883 2.796.883 3.183 0 5.769-2.587 5.77-5.767 0-3.181-2.586-5.769-5.77-5.769zm3.388 8.163c-.144.405-.837.774-1.17.822-.313.044-.725.074-2.385-.615-1.996-.826-3.268-2.862-3.368-2.996-.099-.133-.807-1.074-.807-2.048 0-.974.51-1.452.691-1.652.181-.199.395-.249.527-.249.132 0 .264.002.378.007.123.006.287-.047.45.344.167.399.57 1.391.62 1.492.051.101.085.22.018.354-.067.133-.101.217-.201.334-.101.118-.212.263-.303.353-.101.1-.207.21-.089.412.118.202.525.867 1.127 1.403.774.688 1.427.901 1.629 1.002.202.1.32.083.438-.051.118-.135.506-.59.641-.792.135-.202.27-.169.455-.101.185.067 1.176.554 1.378.655.202.101.337.151.387.236.05.084.05.489-.094.894z"></path>
                  </svg>
                  <span>WhatsApp</span>
                </button>
              </div>
            </div>

            <div class="public-info-row" *ngIf="usuari?.email">
              <span class="info-label">{{ 'PERFIL.EMAIL' | translate }}:</span>
              <div style="display: flex; align-items: center; gap: 0.65rem; flex-wrap: wrap;">
                <span class="info-value">{{ usuari?.email }}</span>
                <button type="button" class="btn-quick-contact btn-quick-email" (click)="contactarPerfilEmail()" [attr.title]="'TASQUES_OFERTES.CONTACTAR_EMAIL' | translate">
                  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                  <span>Correu</span>
                </button>
              </div>
            </div>

            <div class="public-info-row" *ngIf="usuari?.percentil != null">
              <span class="info-label">{{ 'PERFIL.COMMISSION_PERCENTILE_PUBLIC' | translate }}</span>
              <strong class="info-value" style="color: #ff1744;">{{ usuari?.percentil }}%</strong>
            </div>

            <div class="public-bio-box" *ngIf="usuari?.bio">
              <span class="info-label">{{ 'PERFIL.BIO_SPECIALTY' | translate }}</span>
              <p class="bio-text">{{ usuari?.bio }}</p>
            </div>
          </div>
        </article>

        <div class="side-column">
          <!-- Targeta de verificació en perfil públic -->
          <article class="card verification-card" *ngIf="usuari?.rol === 'professional'">
            <div class="verif-card-header">
              <span class="verif-icon" [class.verified]="usuari?.verificat">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                  <polyline points="9 12 11 14 15 10" *ngIf="usuari?.verificat"></polyline>
                  <line x1="12" y1="8" x2="12" y2="12" *ngIf="!usuari?.verificat"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16" *ngIf="!usuari?.verificat"></line>
                </svg>
              </span>
              <div>
                <h2>{{ 'PERFIL.VERIF_STATUS_TITLE' | translate }}</h2>
                <span class="verif-status-pill" [ngClass]="getVerifStatusClass()">
                  {{ getVerifStatusLabel() }}
                </span>
              </div>
            </div>

            <p class="subtitle" style="margin-top: 0.65rem;">
              {{ getPublicVerifDescription() }}
            </p>

            <div *ngIf="isAdmin" class="admin-verif-actions" style="margin-top: 1rem; padding-top: 0.75rem; border-top: 1px dashed #cbd5e1;">
              <p style="font-size: 0.8rem; font-weight: 700; color: #475569; margin-bottom: 0.5rem;">
                {{ 'PERFIL.ADMIN_VERIF_TITLE' | translate }}
              </p>
              <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                <button
                  type="button"
                  class="btn btn-success-sm"
                  *ngIf="!usuari?.verificat"
                  (click)="onVerificarProfessional(true)"
                  [disabled]="processantVerificacioAdmin">
                  {{ 'PERFIL.ADMIN_APPROVE_VERIF' | translate }}
                </button>
                <button
                  type="button"
                  class="btn btn-danger-sm"
                  *ngIf="usuari?.verificat || usuari?.sollicitudVerificacio"
                  (click)="onVerificarProfessional(false)"
                  [disabled]="processantVerificacioAdmin">
                  {{ 'PERFIL.ADMIN_REJECT_VERIF' | translate }}
                </button>
              </div>
            </div>
          </article>

          <article class="card info-card">
            <h3>{{ 'PERFIL.GUARANTEE_TITLE' | translate }}</h3>
            <p>
              {{ 'PERFIL.GUARANTEE_DESC' | translate }}
            </p>
          </article>
        </div>
      </div>

      <!-- =========================================================================
           PESTANYA 2: TASQUES DE L'USUARI (CREADES O ASSIGNADES)
           ========================================================================= -->
      <section class="tab-content-section" *ngIf="!loadingTabData && activeTab === 'tasques'">
        <div class="tab-header-card">
          <div class="tab-header-titles">
            <h2>{{ 'PERFIL.TAB_TASQUES' | translate }} ({{ tasquesUsuari.length }})</h2>
            <p>{{ (usuari?.rol === 'professional' ? 'LES_MEVES_OFERTES.ASSIGNED_SECTION_HINT' : 'LES_MEVES_TASQUES.SUBTITLE') | translate }}</p>
          </div>

          <div class="tab-filters-row">
            <button
              type="button"
              class="tab-filter-btn"
              [class.active]="filtreTasques === 'totes'"
              (click)="setFiltreTasques('totes')"
            >
              {{ 'PERFIL.FILTER_TAB_TOTES' | translate }} ({{ tasquesUsuari.length }})
            </button>
            <button
              type="button"
              class="tab-filter-btn"
              [class.active]="filtreTasques === 'oberta'"
              (click)="setFiltreTasques('oberta')"
            >
              {{ 'PERFIL.FILTER_TAB_OBERTA' | translate }} ({{ countTasquesObertes() }})
            </button>
            <button
              type="button"
              class="tab-filter-btn"
              [class.active]="filtreTasques === 'en_curs'"
              (click)="setFiltreTasques('en_curs')"
            >
              {{ 'PERFIL.FILTER_TAB_EN_CURS' | translate }} ({{ countTasquesEnCurs() }})
            </button>
            <button
              type="button"
              class="tab-filter-btn"
              [class.active]="filtreTasques === 'finalitzada'"
              (click)="setFiltreTasques('finalitzada')"
            >
              {{ 'PERFIL.FILTER_TAB_FINALITZADA' | translate }} ({{ countTasquesFinalitzades() }})
            </button>
            <a *ngIf="isOwnProfile" routerLink="/client/crear-tasca" class="btn-tab-create">
              {{ 'PERFIL.BTN_CREAR_TASCA_PERFIL' | translate }}
            </a>
          </div>
        </div>

        <!-- Graella de tasques -->
        <div class="profile-tasks-grid" *ngIf="tasquesFiltrades.length > 0">
          <article class="profile-task-card" *ngFor="let t of tasquesFiltrades">
            <div class="task-card-header">
              <span class="badge-cat" *ngIf="t.categoria">{{ t.categoria | translate }}</span>
              <span class="badge-estat-pill" [ngClass]="getTaskEstatClass(t.estat)">
                {{ t.estat || 'Oberta' }}
              </span>
            </div>

            <h3 class="task-card-title">{{ t.titol }}</h3>
            <p class="task-card-desc" *ngIf="t.descripcio">{{ t.descripcio }}</p>

            <div class="task-card-meta">
              <div class="meta-item" *ngIf="t.clientNom || t.client">
                <span class="meta-label">{{ 'TASQUES_OFERTES.CLIENT_WHO_ASKS' | translate | slice:0:-1 }}:</span>
                <strong>{{ t.clientNom || t.client }}</strong>
              </div>
              <div class="meta-item" *ngIf="t.professionalNom || t.professional">
                <span class="meta-label">{{ 'TASQUES_OFERTES.PRO_ASSIGNED' | translate | slice:0:-1 }}:</span>
                <strong style="color: #ff1744;">{{ t.professionalNom || t.professional }}</strong>
              </div>
              <div class="meta-item" *ngIf="t.budget">
                <span class="meta-label">{{ 'PERFIL.BUDGET_ESTIMATED' | translate }}</span>
                <span class="meta-budget">{{ t.budget }}</span>
              </div>
            </div>

            <div class="task-card-actions">
              <a [routerLink]="['/tasca-detall', t.id]" class="btn-task-detail">
                <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                <span>{{ 'PERFIL.VEURE_DETALL_TASCA' | translate }}</span>
              </a>
            </div>
          </article>
        </div>

        <!-- Estat buit de tasques -->
        <div class="empty-tab-box" *ngIf="tasquesFiltrades.length === 0">
          <span class="empty-tab-icon">📋</span>
          <h4>{{ 'PERFIL.NO_TASQUES_USER' | translate }}</h4>
          <p class="subtitle">{{ 'PERFIL.NO_TASQUES_FILTER' | translate }}</p>
          <a *ngIf="isOwnProfile" routerLink="/client/crear-tasca" class="btn-create-tab">
            {{ 'PERFIL.BTN_CREAR_TASCA_PERFIL' | translate }}
          </a>
        </div>
      </section>

      <!-- =========================================================================
           PESTANYA 3: PRESSUPOSTOS I OFERTES DE L'USUARI
           ========================================================================= -->
      <section class="tab-content-section" *ngIf="!loadingTabData && activeTab === 'pressupostos'">
        <div class="tab-header-card">
          <div class="tab-header-titles">
            <h2>{{ 'PERFIL.TAB_PRESSUPOSTOS' | translate }} ({{ ofertesUsuari.length }})</h2>
            <p>{{ 'LES_MEVES_OFERTES.PROPOSALS_SECTION_HINT' | translate }}</p>
          </div>

          <a *ngIf="isOwnProfile && (usuari?.rol === 'professional' || isAdmin)" routerLink="/professional/crear-oferta" class="btn-tab-create">
            {{ 'PERFIL.BTN_CREAR_OFERTA_PERFIL' | translate }}
          </a>
        </div>

        <!-- Graella d'ofertes i pressupostos -->
        <div class="profile-offers-grid" *ngIf="ofertesUsuari.length > 0">
          <article class="profile-offer-card" *ngFor="let o of ofertesUsuari">
            <div class="offer-card-top">
              <span class="offer-nature-pill">{{ 'TASQUES_OFERTES.OFFER_NATURE' | translate }}</span>
              <span class="badge-cat" *ngIf="o.categoria">{{ o.categoria | translate }}</span>
            </div>

            <div class="offer-price-row">
              <span class="offer-price-label">{{ 'PERFIL.OFFER_PRICE' | translate }}</span>
              <span class="offer-price-amount">{{ o.price }}</span>
            </div>

            <p class="offer-card-note" *ngIf="o.note">“{{ o.note }}”</p>

            <div class="offer-card-meta">
              <div class="meta-item" *ngIf="o.professionalNom || o.professional">
                <span class="meta-label">{{ 'TASQUES_OFERTES.PRO_WHO_OFFERS' | translate | slice:0:-1 }}:</span>
                <strong>{{ o.professionalNom || o.professional }}</strong>
              </div>
              <div class="meta-item" *ngIf="o.tascaId">
                <span class="meta-label">{{ 'PERFIL.OFFER_FOR_TASK' | translate }}</span>
                <span class="meta-ref">{{ o.tascaId }}</span>
              </div>
            </div>

            <div class="offer-card-actions">
              <button
                *ngIf="isOwnProfile && isClient() && canAcceptOffer(o)"
                type="button"
                class="btn-accept-budget"
                (click)="onAcceptarPressupost(o)"
              >
                <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <span>{{ 'TASCA_DETALL.BTN_ACCEPT_QUOTE' | translate }}</span>
              </button>

              <a *ngIf="o.tascaId" [routerLink]="['/tasca-detall', o.tascaId]" class="btn-task-detail">
                <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                </svg>
                <span>{{ 'PERFIL.VEURE_DETALL_TASCA' | translate }}</span>
              </a>
            </div>
          </article>
        </div>

        <!-- Estat buit d'ofertes -->
        <div class="empty-tab-box" *ngIf="ofertesUsuari.length === 0">
          <span class="empty-tab-icon">💶</span>
          <h4>{{ 'PERFIL.NO_PRESSUPOSTOS_USER' | translate }}</h4>
          <p class="subtitle">{{ 'PERFIL.NO_PRESSUPOSTOS_USER' | translate }}</p>
          <a *ngIf="isOwnProfile && (usuari?.rol === 'professional' || isAdmin)" routerLink="/professional/crear-oferta" class="btn-create-tab">
            {{ 'PERFIL.BTN_CREAR_OFERTA_PERFIL' | translate }}
          </a>
        </div>
      </section>

      <!-- =========================================================================
           PESTANYA 4: RESSENYES I OPINIONS DE CLIENTS
           ========================================================================= -->
      <section class="tab-content-section" *ngIf="!loadingTabData && activeTab === 'ressenyes'">
        <section class="card reviews-profile-card" *ngIf="tasquesFinalitzades.length > 0">
          <div class="reviews-card-header">
            <div>
              <h2>{{ (usuari?.rol === 'professional' ? 'PERFIL.REVIEWS_TITLE_PRO' : 'PERFIL.REVIEWS_TITLE_CLIENT') | translate }}</h2>
              <p class="subtitle">
                {{ (usuari?.rol === 'professional' ? 'PERFIL.REVIEWS_SUB_PRO' : 'PERFIL.REVIEWS_SUB_CLIENT') | translate }}
              </p>
            </div>
            <div class="score-summary-pill" *ngIf="mitjanaPuntuacio">
              <span class="stars-gold">★ {{ mitjanaPuntuacio }}</span>
              <span class="score-count">({{ totalValoracions }} {{ totalValoracions === 1 ? ('PERFIL.RATING_COUNT_SINGULAR' | translate) : ('PERFIL.RATING_COUNT_PLURAL' | translate) }})</span>
            </div>
          </div>

          <div class="reviews-profile-list">
            <article class="review-profile-item" *ngFor="let t of tasquesFinalitzades">
              <div class="review-item-header">
                <div class="reviewer-meta">
                  <div class="reviewer-avatar">
                    {{ (t.clientNom || t.client || 'C').charAt(0).toUpperCase() }}
                  </div>
                  <div>
                    <strong class="reviewer-name">{{ t.clientNom || t.client || 'Client AVISA' }}</strong>
                    <div class="task-info-chips">
                      <span class="badge-cat" *ngIf="t.categoria">{{ t.categoria | translate }}</span>
                      <span class="badge-price" *ngIf="t.budget">{{ t.budget }}</span>
                      <span class="badge-origen" *ngIf="t.origenId">Ref: {{ t.origenId }}</span>
                    </div>
                  </div>
                </div>
                <div class="review-stars-badge" *ngIf="t.valoracio">
                  <span class="star-icon" *ngFor="let s of [1,2,3,4,5]">{{ s <= t.valoracio ? '★' : '☆' }}</span>
                  <span class="star-number">{{ t.valoracio }}/5</span>
                </div>
              </div>

              <div class="task-work-body">
                <h4 class="task-work-title">{{ t.titol }}</h4>
                <p class="task-work-desc" *ngIf="t.descripcio && t.descripcio !== t.opinio">{{ t.descripcio }}</p>
                <div class="task-opinion-box" *ngIf="t.opinio">
                  <span class="opinion-quote-label">{{ 'PERFIL.CLIENT_OPINION' | translate }}</span>
                  <p class="review-item-comment">“{{ t.opinio }}”</p>
                </div>
              </div>
            </article>
          </div>
        </section>

        <!-- Sense tasques finalitzades encara -->
        <section class="card reviews-profile-card empty-reviews" *ngIf="tasquesFinalitzades.length === 0">
          <h3>{{ 'PERFIL.NO_REVIEWS_TITLE' | translate }}</h3>
          <p class="subtitle">{{ 'PERFIL.NO_REVIEWS_DESC' | translate }}</p>
        </section>
      </section>
    </section>
  `,
  styles: [
    `
      :host {
        display: flex;
        justify-content: center;
        width: 100%;
        max-width: 100%;
        overflow-x: hidden;
      }

      .perfil-container {
        width: min(1000px, 100%);
        max-width: 100%;
        margin: 0 auto;
        display: flex;
        flex-direction: column;
        gap: 1.75rem;
        box-sizing: border-box;
        overflow-x: hidden;
      }

      .perfil-header {
        background: #ffffff;
        color: #09090c;
        padding: 2.2rem;
        border-radius: 20px;
        border: 1px solid #e5e0d7;
        display: flex;
        align-items: center;
        gap: 1.75rem;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
        box-sizing: border-box;
        max-width: 100%;
      }

      /* =========================================================================
         BARRA DE NAVEGACIÓ DE PESTANYES DEL PERFIL (SENSE DESLIZABLES LATERALS)
         ========================================================================= */
      .perfil-nav-tabs {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 0.5rem;
        background: #ffffff;
        border: 1px solid #e5e0d7;
        padding: 0.45rem;
        border-radius: 16px;
        box-shadow: 0 4px 14px rgba(0, 0, 0, 0.04);
        width: 100%;
        box-sizing: border-box;
        overflow: hidden;
      }

      .perfil-tab-btn {
        width: 100%;
        min-width: 0;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 0.45rem;
        padding: 0.75rem 0.6rem;
        border-radius: 12px;
        border: 1px solid transparent;
        background: transparent;
        color: #55524b;
        font-weight: 800;
        font-size: 0.86rem;
        cursor: pointer;
        transition: all 0.22s cubic-bezier(0.4, 0, 0.2, 1);
        user-select: none;
        box-sizing: border-box;
        text-align: center;
      }

      .perfil-tab-btn:hover {
        background: #faf8f4;
        color: #09090c;
      }

      .perfil-tab-btn.active {
        background: #09090c;
        color: #ffffff;
        box-shadow: 0 4px 16px rgba(9, 9, 12, 0.25);
      }

      .perfil-tab-btn.active svg {
        color: var(--neon, #ff1744);
        filter: drop-shadow(0 0 6px rgba(255, 23, 68, 0.5));
      }

      .tab-count-pill {
        background: rgba(255, 23, 68, 0.12);
        color: var(--neon, #ff1744);
        font-size: 0.72rem;
        font-weight: 900;
        padding: 0.15rem 0.5rem;
        border-radius: 10px;
        border: 1px solid rgba(255, 23, 68, 0.25);
      }

      .perfil-tab-btn.active .tab-count-pill {
        background: var(--neon, #ff1744);
        color: #ffffff;
        border-color: var(--neon, #ff1744);
      }

      .tab-loading-state {
        background: #ffffff;
        border: 1px solid #e5e0d7;
        border-radius: 16px;
        padding: 3rem;
        text-align: center;
        color: #78756e;
        font-weight: 700;
      }

      .tab-content-section {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .tab-header-card {
        background: #ffffff;
        border: 1px solid #e5e0d7;
        border-radius: 16px;
        padding: 1.4rem 1.6rem;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 1rem;
      }

      .tab-header-titles h2 {
        font-size: 1.3rem;
        font-weight: 900;
        color: #09090c;
        margin: 0;
      }

      .tab-header-titles p {
        font-size: 0.85rem;
        color: #78756e;
        margin: 0.25rem 0 0;
      }

      .tab-filters-row {
        display: flex;
        gap: 0.45rem;
        flex-wrap: wrap;
        align-items: center;
      }

      .tab-filter-btn {
        background: #f6f4ee;
        border: 1px solid #e2ddd4;
        color: #55524b;
        font-size: 0.82rem;
        font-weight: 800;
        padding: 0.45rem 0.9rem;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .tab-filter-btn:hover {
        background: #ebe6dc;
        color: #09090c;
      }

      .tab-filter-btn.active {
        background: var(--neon, #ff1744);
        color: #ffffff;
        border-color: var(--neon, #ff1744);
        box-shadow: 0 2px 8px rgba(255, 23, 68, 0.35);
      }

      .btn-tab-create {
        background: var(--neon, #ff1744);
        color: #ffffff;
        font-weight: 900;
        font-size: 0.82rem;
        padding: 0.5rem 1.05rem;
        border-radius: 8px;
        text-decoration: none;
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;
        box-shadow: 0 4px 12px rgba(255, 23, 68, 0.3);
        transition: all 0.2s ease;
      }

      .btn-tab-create:hover {
        background: #09090c;
      }

      .profile-tasks-grid,
      .profile-offers-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
        gap: 1.25rem;
      }

      .profile-task-card,
      .profile-offer-card {
        background: #ffffff;
        border: 1px solid #e5e0d7;
        border-radius: 16px;
        padding: 1.4rem;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        gap: 0.9rem;
        transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
      }

      .profile-task-card:hover,
      .profile-offer-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
        border-color: #d5cfc2;
      }

      .task-card-header,
      .offer-card-top {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 0.5rem;
      }

      .badge-estat-pill {
        padding: 0.25rem 0.65rem;
        border-radius: 20px;
        font-weight: 800;
        font-size: 0.74rem;
        text-transform: uppercase;
        letter-spacing: 0.04em;
      }

      .estat-oberta {
        background: #eff6ff;
        color: #1d4ed8;
        border: 1px solid #bfdbfe;
      }

      .estat-en-curs {
        background: #ecfeff;
        color: #0e7490;
        border: 1px solid #a5f3fc;
      }

      .estat-finalitzada {
        background: #f0fdf4;
        color: #15803d;
        border: 1px solid #bbf7d0;
      }

      .estat-default {
        background: #f1f5f9;
        color: #475569;
        border: 1px solid #cbd5e1;
      }

      .offer-nature-pill {
        background: rgba(255, 23, 68, 0.08);
        color: var(--neon, #ff1744);
        border: 1px solid rgba(255, 23, 68, 0.25);
        font-weight: 900;
        font-size: 0.72rem;
        padding: 0.2rem 0.55rem;
        border-radius: 6px;
        text-transform: uppercase;
      }

      .offer-price-row {
        display: flex;
        align-items: baseline;
        gap: 0.65rem;
        margin-top: 0.2rem;
      }

      .offer-price-label {
        font-size: 0.8rem;
        color: #78756e;
        font-weight: 700;
      }

      .offer-price-amount {
        font-size: 1.55rem;
        font-weight: 900;
        color: var(--neon, #ff1744);
        letter-spacing: -0.02em;
      }

      .task-card-title {
        font-size: 1.15rem;
        font-weight: 900;
        color: #09090c;
        margin: 0;
        line-height: 1.35;
      }

      .task-card-desc,
      .offer-card-note {
        font-size: 0.86rem;
        color: #5a5750;
        line-height: 1.5;
        margin: 0;
      }

      .task-card-meta,
      .offer-card-meta {
        background: #faf8f4;
        border: 1px solid #ebe5da;
        border-radius: 10px;
        padding: 0.75rem 0.9rem;
        display: flex;
        flex-direction: column;
        gap: 0.4rem;
      }

      .meta-budget {
        font-weight: 900;
        color: var(--neon, #ff1744);
        font-size: 0.95rem;
      }

      .meta-ref {
        font-weight: 800;
        font-family: monospace;
        color: #09090c;
        background: #ede8dd;
        padding: 0.15rem 0.4rem;
        border-radius: 4px;
        font-size: 0.78rem;
      }

      .task-card-actions,
      .offer-card-actions {
        margin-top: 0.35rem;
      }

      .btn-task-detail {
        width: 100%;
        box-sizing: border-box;
        background: #09090c;
        color: #ffffff;
        font-weight: 800;
        font-size: 0.84rem;
        padding: 0.65rem 1rem;
        border-radius: 8px;
        text-decoration: none;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        transition: all 0.2s ease;
      }

      .btn-task-detail:hover {
        background: var(--neon, #ff1744);
        box-shadow: 0 4px 12px rgba(255, 23, 68, 0.35);
      }

      .btn-accept-budget {
        width: 100%;
        box-sizing: border-box;
        background: #16a34a;
        color: #ffffff;
        font-weight: 800;
        font-size: 0.84rem;
        padding: 0.65rem 1rem;
        border-radius: 8px;
        border: none;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        box-shadow: 0 4px 12px rgba(22, 163, 74, 0.25);
        transition: all 0.2s ease;
      }

      .btn-accept-budget:hover {
        background: #15803d;
        transform: translateY(-1px);
        box-shadow: 0 6px 16px rgba(22, 163, 74, 0.35);
      }

      .empty-tab-box {
        background: #ffffff;
        border: 1px dashed #d5cfc2;
        border-radius: 16px;
        padding: 3.5rem 1.5rem;
        text-align: center;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.75rem;
      }

      .empty-tab-icon {
        font-size: 2.8rem;
        line-height: 1;
      }

      .empty-tab-box h4 {
        font-size: 1.2rem;
        font-weight: 900;
        color: #09090c;
        margin: 0;
      }

      .btn-create-tab {
        margin-top: 0.5rem;
        background: var(--neon, #ff1744);
        color: #ffffff;
        font-weight: 900;
        font-size: 0.88rem;
        padding: 0.65rem 1.3rem;
        border-radius: 8px;
        text-decoration: none;
        box-shadow: 0 4px 14px rgba(255, 23, 68, 0.3);
        transition: all 0.2s ease;
      }

      .btn-create-tab:hover {
        background: #09090c;
      }

      .avatar-badge {
        width: 76px;
        height: 76px;
        background: #09090c;
        color: #ffffff;
        border: 3px solid var(--neon, #ff1744);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 2.2rem;
        font-weight: 900;
        box-shadow: 0 0 16px rgba(255, 23, 68, 0.35);
      }

      .header-info h1 {
        margin: 0;
        font-size: 2rem;
        font-weight: 900;
        color: #09090c;
        letter-spacing: -0.03em;
      }

      .header-info .email {
        margin: 0.35rem 0 0.65rem;
        color: #636058;
        font-size: 0.95rem;
        font-weight: 600;
      }

      .role-badge {
        display: inline-block;
        padding: 0.3rem 0.85rem;
        border-radius: 6px;
        font-size: 0.75rem;
        font-weight: 900;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        border: 1px solid transparent;
      }

      .role-badge.client {
        background: #f0ece3;
        color: #09090c;
        border-color: #dcd6cb;
      }

      .role-badge.professional {
        background: rgba(255, 23, 68, 0.08);
        color: var(--neon, #ff1744);
        border-color: rgba(255, 23, 68, 0.3);
      }

      .role-badge.admin {
        background: #09090c;
        color: #ffffff;
        border-color: var(--neon, #ff1744);
        box-shadow: 0 0 10px rgba(255, 23, 68, 0.3);
      }

      .header-name-row {
        display: flex;
        align-items: center;
        gap: 0.85rem;
        flex-wrap: wrap;
      }

      .pro-rating-badge-head {
        display: inline-flex;
        align-items: center;
        gap: 0.3rem;
        background: #fef3c7;
        color: #92400e;
        padding: 0.25rem 0.65rem;
        border-radius: 9999px;
        font-size: 0.82rem;
        font-weight: 700;
      }

      .pro-rating-badge-head .stars-gold {
        color: #d97706;
      }

      .count-head {
        font-size: 0.75rem;
        color: #78350f;
        font-weight: 600;
      }

      .badges-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        flex-wrap: wrap;
        margin-top: 0.35rem;
      }

      .verified-badge {
        font-size: 0.75rem;
        font-weight: 700;
        background: #ecfdf5;
        color: #065f46;
        border: 1px solid #a7f3d0;
        padding: 0.2rem 0.55rem;
        border-radius: 9999px;
      }

      .pending-badge {
        font-size: 0.75rem;
        font-weight: 700;
        background: #fffbeb;
        color: #b45309;
        border: 1px solid #fde68a;
        padding: 0.2rem 0.55rem;
        border-radius: 9999px;
      }

      .unverified-badge {
        font-size: 0.75rem;
        font-weight: 700;
        background: #f1f5f9;
        color: #64748b;
        border: 1px solid #cbd5e1;
        padding: 0.2rem 0.55rem;
        border-radius: 9999px;
      }

      /* Estils de la Targeta de Verificació */
      .verification-card {
        border-color: #cbd5e1;
      }

      .verif-card-header {
        display: flex;
        align-items: center;
        gap: 0.85rem;
      }

      .verif-icon {
        width: 44px;
        height: 44px;
        min-width: 44px;
        border-radius: 12px;
        background: #f1f5f9;
        color: #64748b;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 1px solid #cbd5e1;
      }

      .verif-icon.verified {
        background: #ecfdf5;
        color: #059669;
        border-color: #a7f3d0;
      }

      .verif-card-header h2, .verif-card-header h3 {
        margin: 0;
        font-size: 1.15rem;
        font-weight: 800;
        color: #09090c;
      }

      .verif-status-pill {
        display: inline-block;
        font-size: 0.72rem;
        font-weight: 800;
        padding: 0.2rem 0.6rem;
        border-radius: 9999px;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        margin-top: 0.25rem;
      }

      .verif-status-pill.status-verified {
        background: #ecfdf5;
        color: #065f46;
        border: 1px solid #a7f3d0;
      }

      .verif-status-pill.status-pending {
        background: #fffbeb;
        color: #92400e;
        border: 1px solid #fde68a;
      }

      .verif-status-pill.status-unverified {
        background: #f8fafc;
        color: #64748b;
        border: 1px solid #e2e8f0;
      }

      .verif-checklist {
        display: flex;
        flex-direction: column;
        gap: 0.45rem;
        margin: 0.85rem 0 0.5rem;
        padding: 0.75rem;
        background: #f8fafc;
        border-radius: 8px;
        border: 1px solid #e2e8f0;
      }

      .check-item {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.84rem;
        color: #64748b;
      }

      .check-item.valid {
        color: #0f172a;
      }

      .check-item .check-icon {
        font-weight: 800;
      }

      .check-item.valid .check-icon {
        color: #059669;
      }

      .check-item:not(.valid) .check-icon {
        color: #dc2626;
      }

      .btn-verif {
        width: 100%;
        padding: 0.75rem 1rem;
        background: #09090c;
        color: #ffffff;
        border: none;
        border-radius: 10px;
        font-weight: 800;
        font-size: 0.9rem;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .btn-verif:hover:not(:disabled) {
        background: #ff1744;
      }

      .btn-verif:disabled {
        opacity: 0.55;
        cursor: not-allowed;
      }

      .pending-notice-box {
        display: flex;
        gap: 0.65rem;
        padding: 0.75rem 0.9rem;
        background: #fffbeb;
        border: 1px solid #fde68a;
        border-radius: 8px;
        font-size: 0.84rem;
        color: #92400e;
        line-height: 1.45;
      }

      .verified-notice-box {
        display: flex;
        gap: 0.65rem;
        padding: 0.75rem 0.9rem;
        background: #ecfdf5;
        border: 1px solid #a7f3d0;
        border-radius: 8px;
        font-size: 0.84rem;
        color: #065f46;
        line-height: 1.45;
      }

      .btn-success-sm {
        padding: 0.4rem 0.75rem;
        background: #059669;
        color: #ffffff;
        border: none;
        border-radius: 6px;
        font-size: 0.8rem;
        font-weight: 700;
        cursor: pointer;
        transition: background 0.2s;
      }

      .btn-success-sm:hover:not(:disabled) {
        background: #047857;
      }

      .btn-danger-sm {
        padding: 0.4rem 0.75rem;
        background: #dc2626;
        color: #ffffff;
        border: none;
        border-radius: 6px;
        font-size: 0.8rem;
        font-weight: 700;
        cursor: pointer;
        transition: background 0.2s;
      }

      .btn-danger-sm:hover:not(:disabled) {
        background: #b91c1c;
      }

      .public-info-list {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        margin-top: 1rem;
      }

      .public-info-row {
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }

      .btn-quick-contact {
        display: inline-flex;
        align-items: center;
        gap: 0.35rem;
        padding: 0.35rem 0.65rem;
        border-radius: 6px;
        font-size: 0.78rem;
        font-weight: 700;
        cursor: pointer;
        border: none;
        transition: transform 0.15s ease, background-color 0.15s ease, box-shadow 0.15s ease;
        line-height: 1;
        white-space: nowrap;
      }
      .btn-quick-contact:hover {
        transform: translateY(-1px);
        box-shadow: 0 3px 8px rgba(0, 0, 0, 0.12);
      }
      .btn-quick-wa {
        background: #25D366;
        color: #ffffff;
      }
      .btn-quick-wa:hover {
        background: #1eb855;
      }
      .btn-quick-email {
        background: #2563eb;
        color: #ffffff;
      }
      .btn-quick-email:hover {
        background: #1d4ed8;
      }

      .info-label {
        font-size: 0.82rem;
        font-weight: 700;
        color: #6b7280;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        min-width: 140px;
      }

      .info-value {
        font-size: 0.95rem;
        color: #111827;
      }

      .tel-value {
        font-size: 1.05rem;
        color: #ff1744;
      }

      .public-bio-box {
        background: #fafaf9;
        border: 1px solid #e7e5e4;
        border-radius: 10px;
        padding: 1rem;
        margin-top: 0.5rem;
      }

      .bio-text {
        margin: 0.4rem 0 0;
        font-size: 0.92rem;
        line-height: 1.5;
        color: #374151;
      }

      /* Ressenyes Section */
      .reviews-profile-card {
        margin-top: 0.5rem;
      }

      .reviews-card-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 1.5rem;
        gap: 1rem;
        flex-wrap: wrap;
      }

      .score-summary-pill {
        display: flex;
        align-items: center;
        gap: 0.4rem;
        background: #fef3c7;
        padding: 0.4rem 0.85rem;
        border-radius: 9999px;
      }

      .score-summary-pill .stars-gold {
        color: #d97706;
        font-size: 1rem;
        font-weight: 800;
      }

      .score-count {
        font-size: 0.82rem;
        color: #78350f;
        font-weight: 600;
      }

      .reviews-profile-list {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .review-profile-item {
        background: #fafaf9;
        border: 1px solid #e7e5e4;
        border-radius: 12px;
        padding: 1.2rem 1.4rem;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
      }

      .review-item-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.65rem;
        flex-wrap: wrap;
        gap: 0.5rem;
      }

      .reviewer-meta {
        display: flex;
        align-items: center;
        gap: 0.7rem;
      }

      .reviewer-avatar {
        width: 34px;
        height: 34px;
        border-radius: 50%;
        background: #e0e7ff;
        color: #3730a3;
        font-weight: 800;
        font-size: 0.9rem;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .reviewer-name {
        display: block;
        font-size: 0.92rem;
        color: #111827;
      }

      .review-date {
        font-size: 0.76rem;
        color: #9ca3af;
      }

      .review-stars-badge {
        display: flex;
        align-items: center;
        gap: 0.25rem;
      }

      .review-stars-badge .star-icon {
        color: #f59e0b;
        font-size: 0.95rem;
      }

      .star-number {
        font-size: 0.8rem;
        font-weight: 700;
        color: #4b5563;
        margin-left: 0.25rem;
      }

      .review-item-comment {
        margin: 0;
        font-size: 0.9rem;
        line-height: 1.5;
        color: #374151;
        font-style: italic;
      }

      .task-info-chips {
        display: flex;
        flex-wrap: wrap;
        gap: 0.4rem;
        margin-top: 0.25rem;
      }

      .badge-cat {
        background: #e0f2fe;
        color: #0369a1;
        font-size: 0.72rem;
        font-weight: 700;
        padding: 0.15rem 0.5rem;
        border-radius: 6px;
      }

      .badge-price {
        background: #ecfdf5;
        color: #047857;
        font-size: 0.72rem;
        font-weight: 700;
        padding: 0.15rem 0.5rem;
        border-radius: 6px;
      }

      .badge-origen {
        background: #f3f4f6;
        color: #4b5563;
        font-size: 0.72rem;
        font-weight: 700;
        padding: 0.15rem 0.5rem;
        border-radius: 6px;
      }

      .task-work-body {
        margin-top: 0.75rem;
        padding-top: 0.75rem;
        border-top: 1px dashed #e5e0d7;
      }

      .task-work-title {
        margin: 0 0 0.35rem;
        font-size: 1rem;
        font-weight: 800;
        color: #09090c;
      }

      .task-work-desc {
        margin: 0 0 0.6rem;
        font-size: 0.88rem;
        color: #57554e;
        line-height: 1.5;
      }

      .task-opinion-box {
        background: #ffffff;
        border-left: 3px solid #ff1744;
        padding: 0.6rem 0.85rem;
        border-radius: 0 8px 8px 0;
        margin-top: 0.5rem;
      }

      .opinion-quote-label {
        display: block;
        font-size: 0.72rem;
        font-weight: 800;
        text-transform: uppercase;
        color: #ff1744;
        margin-bottom: 0.2rem;
        letter-spacing: 0.05em;
      }

      .empty-reviews {
        text-align: center;
        padding: 2rem;
      }

      .perfil-grid {
        display: grid;
        grid-template-columns: 3fr 2fr;
        gap: 1.75rem;
      }

      @media (max-width: 850px) {
        .perfil-grid {
          grid-template-columns: 1fr;
        }
      }

      .side-column {
        display: flex;
        flex-direction: column;
        gap: 1.75rem;
      }

      .card {
        background: #ffffff;
        padding: 2rem;
        border-radius: 18px;
        border: 1px solid #e5e0d7;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
      }

      .card h2 {
        margin: 0 0 0.35rem;
        font-size: 1.35rem;
        font-weight: 900;
        color: #09090c;
      }

      .subtitle {
        margin: 0 0 1.4rem;
        color: #636058;
        font-size: 0.9rem;
        font-weight: 600;
      }

      form {
        display: flex;
        flex-direction: column;
        gap: 1.15rem;
      }

      label {
        display: flex;
        flex-direction: column;
        gap: 0.45rem;
        font-weight: 800;
        font-size: 0.85rem;
        color: #09090c;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      input, textarea {
        background: #ffffff;
        color: #09090c;
        border: 1.5px solid #d6d0c4;
        border-radius: 10px;
        padding: 0.85rem 1rem;
        font-size: 0.95rem;
        font-weight: 600;
        font-family: inherit;
        outline: none;
        transition: border-color 0.15s ease, box-shadow 0.15s ease;
      }

      input:focus, textarea:focus {
        border-color: var(--neon, #ff1744);
        box-shadow: 0 0 12px rgba(255, 23, 68, 0.25);
      }

      .input-disabled {
        background: #f5f2eb;
        color: #8c887e;
        border-color: #e5e0d7;
        cursor: not-allowed;
      }

      .hint {
        font-size: 0.78rem;
        color: #7d796f;
        font-weight: 600;
      }

      .btn {
        padding: 0.85rem 1.4rem;
        border: none;
        border-radius: 10px;
        font-weight: 900;
        font-size: 0.95rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .btn-primary {
        background: var(--neon, #ff1744);
        color: #ffffff;
        margin-top: 0.6rem;
        box-shadow: 0 4px 16px rgba(255, 23, 68, 0.35);
      }

      .btn-primary:hover:not(:disabled) {
        background: #09090c;
        color: #ffffff;
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
        transform: translateY(-2px);
      }

      .btn-secondary {
        background: #f0ece3;
        color: #09090c;
        border: 1px solid #dcd6cb;
        margin-top: 0.6rem;
      }

      .btn-secondary:hover:not(:disabled) {
        border-color: #09090c;
        background: #09090c;
        color: #ffffff;
      }

      .info-card h3 {
        margin: 0 0 0.5rem;
        font-size: 1.15rem;
        font-weight: 900;
        color: #09090c;
      }

      .info-card p {
        margin: 0;
        color: #57554e;
        line-height: 1.55;
        font-size: 0.92rem;
        font-weight: 600;
      }

      .alert {
        padding: 0.95rem 1.35rem;
        border-radius: 12px;
        font-weight: 700;
        font-size: 0.95rem;
      }

      .alert-success {
        background: rgba(255, 23, 68, 0.08);
        color: var(--neon, #ff1744);
        border: 1px solid rgba(255, 23, 68, 0.25);
      }

      .alert-danger {
        background: #fef2f2;
        border: 1px solid #fecaca;
        color: #991b1b;
      }

      @media (max-width: 800px) {
        .perfil-grid {
          grid-template-columns: 1fr;
        }

        .perfil-nav-tabs {
          grid-template-columns: repeat(2, 1fr);
          gap: 0.45rem;
          padding: 0.45rem;
        }

        .perfil-tab-btn {
          padding: 0.7rem 0.5rem;
          font-size: 0.82rem;
        }

        .perfil-header {
          flex-direction: column;
          text-align: center;
          align-items: center;
          padding: 1.5rem 1.25rem;
        }

        .header-name-row {
          flex-direction: column;
          align-items: center;
        }

        .badges-row {
          justify-content: center;
        }
      }

      @media (max-width: 600px) {
        .perfil-container {
          padding: 1rem 0.5rem;
        }

        .card {
          padding: 1.25rem 1rem;
          border-radius: 14px;
        }

        .public-info-row {
          flex-direction: column;
          align-items: flex-start;
          gap: 0.25rem;
        }

        .profile-tasks-grid,
        .profile-offers-grid {
          grid-template-columns: 1fr;
        }

        .tab-header-card {
          padding: 1.1rem 1rem;
        }

        .tab-filters-row {
          width: 100%;
        }

        .tab-filter-btn {
          flex: 1;
          text-align: center;
          padding: 0.45rem 0.5rem;
          font-size: 0.76rem;
        }

        .info-label {
          min-width: auto;
        }
      }

      @media (max-width: 440px) {
        .perfil-nav-tabs {
          grid-template-columns: repeat(2, 1fr);
          gap: 0.35rem;
          padding: 0.35rem;
        }

        .perfil-tab-btn {
          padding: 0.6rem 0.3rem;
          font-size: 0.75rem;
          gap: 0.3rem;
        }

        .perfil-tab-btn svg {
          width: 15px;
          height: 15px;
        }
      }
    `
  ]
})
export class PerfilComponent implements OnInit {
  /** Dades de l'usuari actual */
  usuari: Usuari | null = null;

  /** Camps del formulari d'edició del perfil */
  formData: { nom: string; telefon: string; bio: string; percentil: number } = {
    nom: '',
    telefon: '',
    bio: '',
    percentil: 3
  };

  /** Camps del formulari de canvi de contrasenya */
  passwordData = {
    newPassword: '',
    confirmPassword: ''
  };

  /** Estats de càrrega per a les peticions */
  saving = false;
  changingPassword = false;

  /** Missatges informatius per a l'usuari */
  successMessage = '';
  errorMessage = '';

  /** Indica si s'està visualitzant el propi perfil (editable) o el d'un altre usuari (públic) */
  isOwnProfile = true;

  /** Pestanya activa del perfil: 'dades' | 'tasques' | 'pressupostos' | 'ressenyes' */
  activeTab: 'dades' | 'tasques' | 'pressupostos' | 'ressenyes' = 'dades';

  /** Filtre actiu per a les tasques de l'usuari */
  filtreTasques: 'totes' | 'oberta' | 'en_curs' | 'finalitzada' = 'totes';

  /** Llistat complet de tasques i peticions vinculades a l'usuari */
  tasquesUsuari: Tasca[] = [];

  /** Llistat complet de pressupostos i ofertes vinculades a l'usuari */
  ofertesUsuari: Oferta[] = [];

  /** Indicador de càrrega de dades de pestanyes */
  loadingTabData = false;

  /** Llistat de tasques finalitzades associades a l'usuari (les quals actuen com a valoracions públiques) */
  tasquesFinalitzades: Tasca[] = [];

  /** Nombre total de valoracions rebudes */
  totalValoracions = 0;

  /** Puntuació mitjana de les valoracions (1 a 5) */
  mitjanaPuntuacio: string | null = null;

  constructor(
    private readonly authService: AuthService,
    private readonly usuariService: UsuariService,
    private readonly tascaService: TascaService,
    private readonly ofertaService: OfertaService,
    private readonly pressupostService: PressupostService,
    private readonly incidenciaService: IncidenciaService,
    private readonly confirmService: ConfirmService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    public readonly translationService: TranslationService
  ) {}

  /**
   * Comprova si l'usuari connectat és administrador.
   */
  get isAdmin(): boolean {
    const cur = this.authService.getCurrentUser();
    return cur?.rol === 'admin';
  }

  /**
   * Calcula el valor de comissió normalitzat per a la simulació en pantalla.
   */
  getCommissionSimulation(): number {
    const p = Number(this.formData.percentil);
    if (isNaN(p) || p < 0) return 0;
    if (p > 100) return 100;
    return Math.round(p * 10) / 10;
  }

  /**
   * Cicle de vida OnInit:
   * Comprova l'autenticació, sincronitza pestanya activa de la URL i carrega les dades actuals des de PostgreSQL.
   */
  ngOnInit(): void {
    this.route.queryParamMap.subscribe((qp) => {
      const tab = qp.get('tab');
      if (tab && ['dades', 'tasques', 'pressupostos', 'ressenyes'].includes(tab)) {
        this.activeTab = tab as any;
      }
    });

    this.route.paramMap.subscribe((params) => {
      const targetId = params.get('id');
      const currentUser = this.authService.getCurrentUser();

      if (targetId && (!currentUser || currentUser.id !== targetId)) {
        this.isOwnProfile = false;
        this.carregarPerfilUsuari(targetId);
      } else {
        if (!currentUser) {
          this.router.navigate(['/login']);
          return;
        }
        this.isOwnProfile = true;
        this.usuari = currentUser;
        this.formData.nom = currentUser.nom || '';
        this.formData.telefon = currentUser.telefon || '';
        this.formData.bio = currentUser.bio || '';
        this.formData.percentil = currentUser.percentil ?? 3;
        this.carregarPerfilUsuari(currentUser.id);
      }
    });
  }

  private carregarPerfilUsuari(userId: string): void {
    this.usuariService.getById(userId).subscribe({
      next: (freshUser) => {
        if (freshUser) {
          this.usuari = freshUser;
          if (this.isOwnProfile) {
            this.formData.nom = freshUser.nom || '';
            this.formData.telefon = freshUser.telefon || '';
            this.formData.bio = freshUser.bio || '';
            this.formData.percentil = freshUser.percentil ?? 3;
            this.authService.setCurrentUser(freshUser);
          }
          this.carregarDadesCompletasPerfil(freshUser);
        }
      },
      error: () => {
        if (this.isOwnProfile && this.usuari) {
          this.carregarDadesCompletasPerfil(this.usuari);
        }
      }
    });
  }

  /**
   * Carrega de manera integral les tasques, incidències obertes, ofertes i valoracions de l'usuari.
   */
  private carregarDadesCompletasPerfil(user: Usuari): void {
    this.loadingTabData = true;
    const userNom = user.nom || '';
    const userId = user.id || '';
    const nomLower = userNom.toLowerCase();
    const idLower = userId.toLowerCase();

    forkJoin({
      allTasks: this.tascaService.getAll().pipe(catchError(() => of([]))),
      clientIncidencies: (userNom ? this.incidenciaService.getByClient(userNom) : of([])).pipe(catchError(() => of([]))),
      allOffers: this.ofertaService.getAll().pipe(catchError(() => of([])))
    }).subscribe({
      next: ({ allTasks, clientIncidencies, allOffers }) => {
        this.loadingTabData = false;

        // 1. Tasques de l'usuari (on és client o professional assignat)
        const userTasks = (allTasks ?? []).filter(t => {
          const cNom = (t.clientNom || t.client || '').toLowerCase();
          const cId = (t.clientId || '').toLowerCase();
          const pNom = (t.professionalNom || t.professional || '').toLowerCase();
          const pId = (t.professionalId || '').toLowerCase();
          return (cNom && cNom === nomLower) || (cId && cId === idLower) ||
                 (pNom && pNom === nomLower) || (pId && pId === idLower);
        });

        // Mapejar incidències obertes que no tinguin encara tasca acordada
        const existingTaskIds = new Set(userTasks.map(t => t.id));
        const mappedIncidencies: Tasca[] = (clientIncidencies ?? [])
          .filter(inc => !existingTaskIds.has(inc.id))
          .map(inc => ({
            id: inc.id,
            titol: inc.titol,
            descripcio: inc.descripcio,
            categoria: inc.categoria,
            clientId: inc.clientId,
            client: inc.clientNom || inc.client || userNom,
            clientNom: inc.clientNom || inc.client || userNom,
            budget: inc.budget,
            estat: inc.estat || 'Oberta',
            tipus: 'incidencia',
            createdAt: inc.createdAt
          }));

        this.tasquesUsuari = [...userTasks, ...mappedIncidencies];

        // 2. Tasques finalitzades amb valoració (per a la pestanya de ressenyes)
        this.tasquesFinalitzades = this.tasquesUsuari.filter(
          t => t.estat === 'Finalitzada' || (t.valoracio != null && t.valoracio > 0)
        );
        const rated = this.tasquesFinalitzades.filter(t => t.valoracio != null && t.valoracio > 0);
        this.totalValoracions = rated.length;
        if (rated.length > 0) {
          const sum = rated.reduce((acc, curr) => acc + (curr.valoracio || 0), 0);
          this.mitjanaPuntuacio = (sum / rated.length).toFixed(1);
        } else {
          this.mitjanaPuntuacio = null;
        }

        // 3. Ofertes i pressupostos associats a l'usuari
        const allUserTaskIds = new Set(this.tasquesUsuari.map(t => t.id));
        this.ofertesUsuari = (allOffers ?? []).filter(o => {
          const oPro = (o.professionalNom || o.professional || '').toLowerCase();
          const isAuthor = oPro && (oPro === nomLower || oPro === idLower);
          const isRecipient = !!(o.tascaId && allUserTaskIds.has(o.tascaId));
          return isAuthor || isRecipient;
        });
      },
      error: () => {
        this.loadingTabData = false;
        this.tasquesUsuari = [];
        this.ofertesUsuari = [];
        this.tasquesFinalitzades = [];
        this.totalValoracions = 0;
        this.mitjanaPuntuacio = null;
      }
    });
  }

  /**
   * Canvia la pestanya activa del perfil i actualitza el paràmetre de consulta de la URL.
   */
  setTab(tab: 'dades' | 'tasques' | 'pressupostos' | 'ressenyes'): void {
    this.activeTab = tab;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tab },
      queryParamsHandling: 'merge'
    });
  }

  /**
   * Defineix el filtre d'estat de les tasques.
   */
  setFiltreTasques(f: 'totes' | 'oberta' | 'en_curs' | 'finalitzada'): void {
    this.filtreTasques = f;
  }

  /**
   * Retorna les tasques filtrades segons la pestanya de filtre seleccionada.
   */
  get tasquesFiltrades(): Tasca[] {
    if (this.filtreTasques === 'oberta') {
      return this.tasquesUsuari.filter(t => (t.estat || '').toLowerCase().includes('obert') || t.tipus === 'incidencia');
    }
    if (this.filtreTasques === 'en_curs') {
      return this.tasquesUsuari.filter(t => (t.estat || '').toLowerCase().includes('curs'));
    }
    if (this.filtreTasques === 'finalitzada') {
      return this.tasquesUsuari.filter(t => (t.estat || '').toLowerCase().includes('finalitzad'));
    }
    return this.tasquesUsuari;
  }

  countTasquesObertes(): number {
    return this.tasquesUsuari.filter(t => (t.estat || '').toLowerCase().includes('obert') || t.tipus === 'incidencia').length;
  }

  countTasquesEnCurs(): number {
    return this.tasquesUsuari.filter(t => (t.estat || '').toLowerCase().includes('curs')).length;
  }

  countTasquesFinalitzades(): number {
    return this.tasquesUsuari.filter(t => (t.estat || '').toLowerCase().includes('finalitzad')).length;
  }

  /**
   * Retorna la classe CSS identificativa de l'estat d'una tasca.
   */
  getTaskEstatClass(estat?: string): string {
    const s = (estat || '').toLowerCase();
    if (s.includes('obert')) return 'estat-oberta';
    if (s.includes('curs')) return 'estat-en-curs';
    if (s.includes('finalitzad')) return 'estat-finalitzada';
    return 'estat-default';
  }

  /**
   * Obté la inicial de l'usuari per dibuixar l'avatar.
   */
  get userInitial(): string {
    return this.usuari?.nom ? this.usuari.nom.charAt(0).toUpperCase() : 'U';
  }

  /**
   * Guarda els canvis del formulari de perfil al backend PostgreSQL.
   */
  onSaveProfile(): void {
    if (!this.usuari) return;

    if (this.usuari.rol === 'professional' && (!this.formData.telefon || !this.formData.telefon.trim())) {
      this.errorMessage = 'Com a Professional, el telèfon de contacte és obligatori per resoldre peticions.';
      return;
    }

    const p = Number(this.formData.percentil);
    if (isNaN(p) || p < 0 || p > 100) {
      this.errorMessage = 'El percentil de comissió ha de ser un número sencer comprès entre 0 i 100.';
      return;
    }

    const currentPercentil = this.usuari.percentil ?? 3;
    if (!this.isAdmin && p < currentPercentil) {
      this.errorMessage = `Com a usuari només pots augmentar el teu percentil (mínim actual: ${currentPercentil}%). Per reduir-lo, cal intervenció d'un administrador.`;
      return;
    }

    this.saving = true;
    this.clearAlerts();

    const updatedData: Partial<Usuari> = {
      nom: this.formData.nom,
      telefon: this.formData.telefon,
      bio: this.formData.bio,
      percentil: Math.round(p)
    };

    this.usuariService.updateProfile(this.usuari.id, updatedData).subscribe({
      next: (savedUser) => {
        this.saving = false;
        this.usuari = savedUser;
        this.formData.percentil = savedUser.percentil ?? 3;
        this.authService.setCurrentUser(savedUser);
        this.successMessage = 'Les dades del teu perfil s’han desat correctament a la base de dades.';
      },
      error: (err) => {
        this.saving = false;
        const msg = err?.error?.message || err?.error?.error;
        this.errorMessage = msg || 'S’ha produït un error en desar el perfil. Torna-ho a provar.';
      }
    });
  }

  /**
   * Canvia la contrasenya de l'usuari a la base de dades.
   */
  onChangePassword(): void {
    if (!this.usuari) return;

    this.clearAlerts();

    if (this.passwordData.newPassword.length < 6) {
      this.errorMessage = 'La contrasenya ha de tenir com a mínim 6 caràcters.';
      return;
    }

    if (this.passwordData.newPassword !== this.passwordData.confirmPassword) {
      this.errorMessage = 'Les contrasenyes introduïdes no coincideixen.';
      return;
    }

    this.changingPassword = true;

    this.usuariService.changePassword(this.usuari.id, this.passwordData.newPassword).subscribe({
      next: () => {
        this.changingPassword = false;
        this.successMessage = 'La contrasenya s’ha canviat satisfactòriament.';
        this.passwordData.newPassword = '';
        this.passwordData.confirmPassword = '';
      },
      error: () => {
        this.changingPassword = false;
        this.errorMessage = 'No s’ha pogut actualitzar la contrasenya. Comprova la connexió amb el servidor.';
      }
    });
  }

  /** Estat de la petició de sol·licitud de verificació */
  sollicitantVerificacio = false;
  processantVerificacioAdmin = false;

  getVerifStatusClass(): string {
    if (this.usuari?.verificat) return 'status-verified';
    if (this.usuari?.sollicitudVerificacio) return 'status-pending';
    return 'status-unverified';
  }

  getVerifStatusLabel(): string {
    if (this.usuari?.verificat) return this.translationService.t('PERFIL.STATUS_OFFICIALLY_VERIFIED');
    if (this.usuari?.sollicitudVerificacio) return this.translationService.t('PERFIL.STATUS_CALL_PENDING');
    return this.translationService.t('PERFIL.STATUS_NOT_VERIFIED');
  }

  getVerifDescription(): string {
    if (this.usuari?.verificat) {
      return this.translationService.t('PERFIL.VERIF_OFFICIAL_DESC');
    }
    if (this.usuari?.sollicitudVerificacio) {
      return this.translationService.t('PERFIL.VERIF_PENDING_DESC');
    }
    return this.translationService.t('PERFIL.GUARANTEE_DESC');
  }

  getPublicVerifDescription(): string {
    if (this.usuari?.verificat) {
      return this.translationService.t('PERFIL.VERIF_OFFICIAL_DESC');
    }
    return this.translationService.t('PERFIL.GUARANTEE_DESC');
  }

  onSollicitarVerificacio(): void {
    if (!this.usuari) return;
    if (!this.usuari.telefon || !this.usuari.telefon.trim()) {
      this.errorMessage = 'Cal registrar un telèfon de contacte abans de sol·licitar la verificació.';
      return;
    }
    this.sollicitantVerificacio = true;
    this.clearAlerts();
    this.usuariService.sollicitarVerificacio(this.usuari.id).subscribe({
      next: (updatedUser) => {
        this.sollicitantVerificacio = false;
        this.usuari = updatedUser;
        if (this.isOwnProfile) {
          this.authService.setCurrentUser(updatedUser);
        }
        this.successMessage = 'Sol·licitud de verificació enviada correctament! L\'administrador es posarà en contacte amb tu via trucada telefònica.';
      },
      error: (err) => {
        this.sollicitantVerificacio = false;
        const msg = err?.error?.message || 'Error en sol·licitar la verificació.';
        this.errorMessage = msg;
      }
    });
  }

  onVerificarProfessional(estat: boolean): void {
    if (!this.usuari) return;
    this.processantVerificacioAdmin = true;
    this.clearAlerts();
    this.usuariService.verificarProfessional(this.usuari.id, estat).subscribe({
      next: (updatedUser) => {
        this.processantVerificacioAdmin = false;
        this.usuari = updatedUser;
        if (this.isOwnProfile) {
          this.authService.setCurrentUser(updatedUser);
        }
        this.successMessage = estat
          ? 'El professional ha estat verificat oficialment després de la comprovació telefònica.'
          : 'L\'estat de verificació ha estat actualitzat.';
      },
      error: (err) => {
        this.processantVerificacioAdmin = false;
        const msg = err?.error?.message || 'Error en verificar el professional.';
        this.errorMessage = msg;
      }
    });
  }

  /**
   * Neteja els missatges d'alerta previs.
   */
  private clearAlerts(): void {
    this.successMessage = '';
    this.errorMessage = '';
  }

  /**
   * Obre directament WhatsApp amb un missatge preconfigurat dirigit al professional.
   */
  contactarPerfilWhatsapp(): void {
    if (!this.usuari?.telefon) return;
    const cleanPhone = this.usuari.telefon.replace(/\D/g, '');
    const phoneWithCountry = cleanPhone.length === 9 ? '34' + cleanPhone : cleanPhone;
    const clientUser = this.authService.getCurrentUser();
    const clientNom = clientUser ? clientUser.nom : 'un client interessat';
    const msg = `Hola ${this.usuari.nom}, t'he trobat a AVISA. Sóc ${clientNom}. M'agradaria consultar-te sobre els teus serveis professionals.`;
    const url = `https://wa.me/${phoneWithCountry}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  /**
   * Obre el gestor de correu del client amb un assumpte i cos dirigits al professional.
   */
  contactarPerfilEmail(): void {
    if (!this.usuari?.email) return;
    const clientUser = this.authService.getCurrentUser();
    const clientNom = clientUser ? clientUser.nom : 'Client interessat';
    const subject = `Contacte a través d'AVISA: Serveis professionals`;
    const body = `Hola ${this.usuari.nom},\n\nM'he posat en contacte amb tu després de veure el teu perfil professional a AVISA.\n\nM'agradaria demanar-te informació i disponibilitat per a una feina.\n\nSalutacions cordials,\n${clientNom}`;
    window.location.href = `mailto:${this.usuari.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  /**
   * Determina si l'usuari connectat és un client.
   */
  isClient(): boolean {
    return this.authService.isClient();
  }

  /**
   * Comprova si el pressupost correspon a una tasca oberta del client i pot ser acceptat.
   */
  canAcceptOffer(o: Oferta): boolean {
    if (!o.tascaId) return false;
    return this.tasquesUsuari.some(t => t.id === o.tascaId && (t.estat === 'Oberta' || t.tipus === 'incidencia'));
  }

  /**
   * Accepta un pressupost des del perfil: passa a ser una Tasca en curs i el pressupost s'elimina.
   */
  async onAcceptarPressupost(oferta: Oferta): Promise<void> {
    const proNom = oferta.professionalNom || oferta.professional || 'aquest professional';
    const confirmacio = await this.confirmService.confirm({
      title: 'CONFIRM_MODAL.ACCEPT_BUDGET_TITLE',
      message: this.translationService.t('CONFIRM_MODAL.ACCEPT_BUDGET_MSG', { pro: proNom, preu: oferta.price || '' }),
      confirmText: 'CONFIRM_MODAL.DEFAULT_CONFIRM',
      cancelText: 'CONFIRM_MODAL.DEFAULT_CANCEL',
      icon: 'success'
    });
    if (!confirmacio) return;

    this.pressupostService.accept(oferta.id).subscribe({
      next: () => {
        this.successMessage = 'Pressupost acceptat correctament! Ha passat a ser una Tasca en curs i el pressupost s’ha eliminat.';
        if (this.usuari) {
          this.carregarDadesCompletasPerfil(this.usuari);
        }
        setTimeout(() => {
          this.setTab('tasques');
          this.successMessage = '';
        }, 1200);
      },
      error: () => {
        // Fallback per ofertes
        this.ofertaService.accept(oferta.id).subscribe({
          next: () => {
            this.successMessage = 'Pressupost acceptat correctament! Ha passat a ser una Tasca en curs i el pressupost s’ha eliminat.';
            if (this.usuari) {
              this.carregarDadesCompletasPerfil(this.usuari);
            }
            setTimeout(() => {
              this.setTab('tasques');
              this.successMessage = '';
            }, 1200);
          },
          error: () => {
            this.errorMessage = 'No s’ha pogut acceptar el pressupost.';
            setTimeout(() => this.errorMessage = '', 3500);
          }
        });
      }
    });
  }
}

