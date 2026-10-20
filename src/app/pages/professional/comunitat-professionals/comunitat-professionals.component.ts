import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { TranslationService } from '../../../core/services/translation.service';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';
import { GuiaProfessional, GUIES_PRO_VA, GUIES_PRO_ES, GUIES_PRO_EN } from '../../../services/guies-pro-data';

/**
 * Pàgina dedicada a la Comunitat de Professionals d'AVISA (/comunitat-professionals).
 * Funciona com un hub editorial i d'atracció (blog del professional) explicant amb detall
 * els motius pels quals els autònoms i empreses locals haurien d'adherir-se a la plataforma.
 */
@Component({
  selector: 'app-comunitat-professionals',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslatePipe],
  template: `
    <div class="pro-community-page">
      <!-- Breadcrumbs de navegació -->
      <nav class="pro-breadcrumbs" aria-label="Fil d'ariadna">
        <a [routerLink]="getNavUrl('/inici')" class="breadcrumb-link">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
          {{ 'NAV.INICI' | translate }}
        </a>
        <span class="breadcrumb-separator">/</span>
        <a [routerLink]="getNavUrl('/tasques-ofertes')" class="breadcrumb-link">{{ 'COMMUNITY_PRO.BREADCRUMB_PROS' | translate }}</a>
        <span class="breadcrumb-separator">/</span>
        <span class="breadcrumb-current">{{ 'COMMUNITY_PRO.BREADCRUMB_COMMUNITY' | translate }}</span>
      </nav>

      <!-- Capçalera Hero -->
      <header class="pro-hero-section">
        <div class="hero-badge">
          <span class="badge-dot"></span>
          {{ 'COMMUNITY_PRO.HERO_BADGE' | translate }}
        </div>
        <h1 class="hero-title">{{ 'COMMUNITY_PRO.HERO_TITLE' | translate }}</h1>
        <p class="hero-lead">
          {{ 'COMMUNITY_PRO.HERO_LEAD' | translate }}
        </p>

        <div class="hero-cta-group">
          <button type="button" class="btn-hero-primary" (click)="anarRegistrePro()">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="8.5" cy="7" r="4"></circle>
              <line x1="20" y1="8" x2="20" y2="14"></line>
              <line x1="23" y1="11" x2="17" y2="11"></line>
            </svg>
            <span>{{ 'COMMUNITY_PRO.HERO_BTN_JOIN' | translate }}</span>
          </button>
          <a [routerLink]="getNavUrl('/tasques-ofertes')" [queryParams]="{ tipus: 'tasques' }" class="btn-hero-secondary">
            <span>{{ 'COMMUNITY_PRO.HERO_BTN_EXPLORE' | translate }}</span>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </a>
        </div>

        <!-- Mètriques ràpides -->
        <div class="pro-stats-strip">
          <div class="stat-item">
            <span class="stat-number">{{ 'COMMUNITY_PRO.STAT_COMMISSION_NUM' | translate }}</span>
            <span class="stat-label">{{ 'COMMUNITY_PRO.STAT_COMMISSION_LABEL' | translate }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-number">{{ 'COMMUNITY_PRO.STAT_DIRECT_NUM' | translate }}</span>
            <span class="stat-label">{{ 'COMMUNITY_PRO.STAT_DIRECT_LABEL' | translate }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-number">{{ 'COMMUNITY_PRO.STAT_DUAL_NUM' | translate }}</span>
            <span class="stat-label">{{ 'COMMUNITY_PRO.STAT_DUAL_LABEL' | translate }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-number">{{ 'COMMUNITY_PRO.STAT_RATING_NUM' | translate }}</span>
            <span class="stat-label">{{ 'COMMUNITY_PRO.STAT_RATING_LABEL' | translate }}</span>
          </div>
        </div>
      </header>

      <!-- SECCIÓ 1: ELS 6 PILARS DE LA COMUNITAT -->
      <section class="reasons-section">
        <div class="section-heading">
          <span class="section-tag">{{ 'COMMUNITY_PRO.PILLARS_TAG' | translate }}</span>
          <h2>{{ 'COMMUNITY_PRO.PILLARS_TITLE' | translate }}</h2>
          <p>
            {{ 'COMMUNITY_PRO.PILLARS_INTRO' | translate }}
          </p>
        </div>

        <div class="reasons-grid">
          <div class="reason-card">
            <div class="reason-icon-wrapper">
              <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"></path>
                <line x1="12" y1="6" x2="12" y2="8"></line>
                <line x1="12" y1="16" x2="12" y2="18"></line>
              </svg>
            </div>
            <h3>{{ 'COMMUNITY_PRO.PILLAR_1_TITLE' | translate }}</h3>
            <p>
              {{ 'COMMUNITY_PRO.PILLAR_1_DESC' | translate }}
            </p>
          </div>

          <div class="reason-card">
            <div class="reason-icon-wrapper">
              <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                <line x1="12" y1="11" x2="12" y2="17"></line>
                <line x1="9" y1="14" x2="15" y2="14"></line>
              </svg>
            </div>
            <h3>{{ 'COMMUNITY_PRO.PILLAR_2_TITLE' | translate }}</h3>
            <p>
              {{ 'COMMUNITY_PRO.PILLAR_2_DESC' | translate }}
            </p>
          </div>

          <div class="reason-card">
            <div class="reason-icon-wrapper">
              <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
              </svg>
            </div>
            <h3>{{ 'COMMUNITY_PRO.PILLAR_3_TITLE' | translate }}</h3>
            <p>
              {{ 'COMMUNITY_PRO.PILLAR_3_DESC' | translate }}
            </p>
          </div>

          <div class="reason-card">
            <div class="reason-icon-wrapper">
              <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
              </svg>
            </div>
            <h3>{{ 'COMMUNITY_PRO.PILLAR_4_TITLE' | translate }}</h3>
            <p>
              {{ 'COMMUNITY_PRO.PILLAR_4_DESC' | translate }}
            </p>
          </div>

          <div class="reason-card">
            <div class="reason-icon-wrapper">
              <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
            <h3>{{ 'COMMUNITY_PRO.PILLAR_5_TITLE' | translate }}</h3>
            <p>
              {{ 'COMMUNITY_PRO.PILLAR_5_DESC' | translate }}
            </p>
          </div>

          <div class="reason-card">
            <div class="reason-icon-wrapper">
              <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
            </div>
            <h3>{{ 'COMMUNITY_PRO.PILLAR_6_TITLE' | translate }}</h3>
            <p>
              {{ 'COMMUNITY_PRO.PILLAR_6_DESC' | translate }}
            </p>
          </div>
        </div>
      </section>

      <!-- SECCIÓ INTERMÈDIA: MODEL DE SOSTENIBILITAT I TRANSPARÈNCIA -->
      <section class="transparency-section">
        <div class="transparency-card">
          <div class="transparency-icon">
            <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          </div>
          <div class="transparency-text">
            <span class="transparency-tag">{{ 'COMMUNITY_PRO.TRANSPARENCY_TAG' | translate }}</span>
            <h3>{{ 'COMMUNITY_PRO.TRANSPARENCY_TITLE' | translate }}</h3>
            <p>{{ 'COMMUNITY_PRO.TRANSPARENCY_DESC' | translate }}</p>
          </div>
        </div>
      </section>

      <!-- SECCIÓ 2: TAULA COMPARATIVA: AVISA VS ALTRES WEBS -->
      <section class="comparison-section">
        <div class="section-heading">
          <span class="section-tag">{{ 'COMMUNITY_PRO.COMP_TAG' | translate }}</span>
          <h2>{{ 'COMMUNITY_PRO.COMP_TITLE' | translate }}</h2>
        </div>

        <div class="table-responsive">
          <table class="comparison-table">
            <thead>
              <tr>
                <th>{{ 'COMMUNITY_PRO.COMP_COL_FEATURE' | translate }}</th>
                <th class="col-avisa">{{ 'COMMUNITY_PRO.COMP_COL_AVISA' | translate }}</th>
                <th>{{ 'COMMUNITY_PRO.COMP_COL_OTHERS' | translate }}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>{{ 'COMMUNITY_PRO.COMP_ROW_MODEL' | translate }}</strong></td>
                <td class="col-avisa"><span class="badge-win">{{ 'COMMUNITY_PRO.COMP_ROW_MODEL_AVISA' | translate }}</span></td>
                <td>{{ 'COMMUNITY_PRO.COMP_ROW_MODEL_OTHERS' | translate }}</td>
              </tr>
              <tr>
                <td><strong>{{ 'COMMUNITY_PRO.COMP_ROW_LEAD' | translate }}</strong></td>
                <td class="col-avisa"><span class="badge-win">{{ 'COMMUNITY_PRO.COMP_ROW_LEAD_AVISA' | translate }}</span></td>
                <td>{{ 'COMMUNITY_PRO.COMP_ROW_LEAD_OTHERS' | translate }}</td>
              </tr>
              <tr>
                <td><strong>{{ 'COMMUNITY_PRO.COMP_ROW_PHONE' | translate }}</strong></td>
                <td class="col-avisa"><span class="badge-win">{{ 'COMMUNITY_PRO.COMP_ROW_PHONE_AVISA' | translate }}</span></td>
                <td>{{ 'COMMUNITY_PRO.COMP_ROW_PHONE_OTHERS' | translate }}</td>
              </tr>
              <tr>
                <td><strong>{{ 'COMMUNITY_PRO.COMP_ROW_OFFERS' | translate }}</strong></td>
                <td class="col-avisa"><span class="badge-win">{{ 'COMMUNITY_PRO.COMP_ROW_OFFERS_AVISA' | translate }}</span></td>
                <td>{{ 'COMMUNITY_PRO.COMP_ROW_OFFERS_OTHERS' | translate }}</td>
              </tr>
              <tr>
                <td><strong>{{ 'COMMUNITY_PRO.COMP_ROW_TERRITORY' | translate }}</strong></td>
                <td class="col-avisa">{{ 'COMMUNITY_PRO.COMP_ROW_TERRITORY_AVISA' | translate }}</td>
                <td>{{ 'COMMUNITY_PRO.COMP_ROW_TERRITORY_OTHERS' | translate }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- SECCIÓ VERIFICACIÓ DE PROFESSIONALS PER TRUCADA -->
      <section class="verif-process-section">
        <div class="section-heading">
          <span class="section-tag verif-tag-pill">{{ 'COMMUNITY_PRO.VERIF_TAG' | translate }}</span>
          <h2>{{ 'COMMUNITY_PRO.VERIF_TITLE' | translate }}</h2>
          <p>{{ 'COMMUNITY_PRO.VERIF_DESC' | translate }}</p>
        </div>

        <div class="verif-steps-grid">
          <div class="verif-step-card">
            <div class="step-badge">1</div>
            <div class="step-icon">
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="8.5" cy="7" r="4"></circle>
                <line x1="20" y1="8" x2="20" y2="14"></line>
                <line x1="23" y1="11" x2="17" y2="11"></line>
              </svg>
            </div>
            <h4>{{ 'COMMUNITY_PRO.VERIF_STEP_1_TITLE' | translate }}</h4>
            <p>{{ 'COMMUNITY_PRO.VERIF_STEP_1_DESC' | translate }}</p>
          </div>

          <div class="verif-step-card">
            <div class="step-badge">2</div>
            <div class="step-icon">
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
            </div>
            <h4>{{ 'COMMUNITY_PRO.VERIF_STEP_2_TITLE' | translate }}</h4>
            <p>{{ 'COMMUNITY_PRO.VERIF_STEP_2_DESC' | translate }}</p>
          </div>

          <div class="verif-step-card highlight-step">
            <div class="step-badge">3</div>
            <div class="step-icon">
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
              </svg>
            </div>
            <h4>{{ 'COMMUNITY_PRO.VERIF_STEP_3_TITLE' | translate }}</h4>
            <p>{{ 'COMMUNITY_PRO.VERIF_STEP_3_DESC' | translate }}</p>
          </div>

          <div class="verif-step-card success-step">
            <div class="step-badge">4</div>
            <div class="step-icon">
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                <polyline points="9 12 11 14 15 10"></polyline>
              </svg>
            </div>
            <h4>{{ 'COMMUNITY_PRO.VERIF_STEP_4_TITLE' | translate }}</h4>
            <p>{{ 'COMMUNITY_PRO.VERIF_STEP_4_DESC' | translate }}</p>
          </div>
        </div>
      </section>

      <!-- SECCIÓ 3: BLOG I GUIES TÈCNIQUES PER A PROFESSIONALS -->
      <section class="pro-blog-section">
        <div class="section-heading">
          <span class="section-tag">{{ 'COMMUNITY_PRO.BLOG_TAG' | translate }}</span>
          <h2>{{ 'COMMUNITY_PRO.BLOG_TITLE' | translate }}</h2>
          <p>{{ 'COMMUNITY_PRO.BLOG_SUB' | translate }}</p>
        </div>

        <div class="guides-accordion">
          <article class="guide-card" *ngFor="let guia of guiesProfessionals">
            <div class="guide-header" (click)="toggleGuia(guia.id)">
              <div class="guide-meta-top">
                <span class="guide-cat-badge">{{ guia.categoria }}</span>
                <span class="guide-read-time">{{ guia.tempsLectura }}</span>
              </div>
              <h3>{{ guia.titol }}</h3>
              <p class="guide-subtitle">{{ guia.subtitol }}</p>
              <div class="guide-toggle-btn">
                <span>{{ guiaOberta === guia.id ? ('COMMUNITY_PRO.GUIDE_CLOSE' | translate) : ('COMMUNITY_PRO.GUIDE_READ' | translate) }}</span>
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" [class.rotated]="guiaOberta === guia.id">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </div>
            </div>

            <!-- Contingut desplegable -->
            <div class="guide-content-body" *ngIf="guiaOberta === guia.id">
              <img [src]="guia.imatge" [alt]="guia.titol" class="guide-cover-img" />
              <div class="guide-paragraphs">
                <p *ngFor="let p of guia.contingut">{{ p }}</p>
              </div>

              <!-- Punts clau -->
              <div class="guide-checklist">
                <strong>{{ 'COMMUNITY_PRO.GUIDE_KEYS_TITLE' | translate }}</strong>
                <ul>
                  <li *ngFor="let pt of guia.puntsClau">✓ {{ pt }}</li>
                </ul>
              </div>

              <div class="guide-callout">
                <span class="callout-icon">💡</span>
                <p><strong>{{ 'COMMUNITY_PRO.GUIDE_TIP_TITLE' | translate }}</strong> {{ guia.destacat }}</p>
              </div>
            </div>
          </article>
        </div>
      </section>

      <!-- SECCIÓ 4: TESTIMONIS REALS DE LA COMUNITAT -->
      <section class="testimonials-section">
        <div class="section-heading">
          <span class="section-tag">{{ 'COMMUNITY_PRO.TESTI_TAG' | translate }}</span>
          <h2>{{ 'COMMUNITY_PRO.TESTI_TITLE' | translate }}</h2>
        </div>

        <div class="testimonials-grid">
          <div class="testi-card">
            <div class="testi-stars">★★★★★</div>
            <p class="testi-quote">{{ 'COMMUNITY_PRO.TESTI_1_QUOTE' | translate }}</p>
            <div class="testi-author">
              <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80" alt="Jordi Romero" class="testi-avatar" />
              <div>
                <strong>{{ 'COMMUNITY_PRO.TESTI_1_AUTHOR' | translate }}</strong>
                <span>{{ 'COMMUNITY_PRO.TESTI_1_ROLE' | translate }}</span>
              </div>
            </div>
          </div>

          <div class="testi-card">
            <div class="testi-stars">★★★★★</div>
            <p class="testi-quote">{{ 'COMMUNITY_PRO.TESTI_2_QUOTE' | translate }}</p>
            <div class="testi-author">
              <img src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=120&q=80" alt="Pere Font" class="testi-avatar" />
              <div>
                <strong>{{ 'COMMUNITY_PRO.TESTI_2_AUTHOR' | translate }}</strong>
                <span>{{ 'COMMUNITY_PRO.TESTI_2_ROLE' | translate }}</span>
              </div>
            </div>
          </div>

          <div class="testi-card">
            <div class="testi-stars">★★★★★</div>
            <p class="testi-quote">{{ 'COMMUNITY_PRO.TESTI_3_QUOTE' | translate }}</p>
            <div class="testi-author">
              <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80" alt="Marc Soler" class="testi-avatar" />
              <div>
                <strong>{{ 'COMMUNITY_PRO.TESTI_3_AUTHOR' | translate }}</strong>
                <span>{{ 'COMMUNITY_PRO.TESTI_3_ROLE' | translate }}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- SECCIÓ 5: CRIDA FINAL A L'ACCIÓ -->
      <section class="final-pro-cta">
        <div class="cta-inner-card">
          <span class="cta-mini-tag">{{ 'COMMUNITY_PRO.FINAL_TAG' | translate }}</span>
          <h2>{{ 'COMMUNITY_PRO.FINAL_TITLE' | translate }}</h2>
          <p>
            {{ 'COMMUNITY_PRO.FINAL_DESC' | translate }}
          </p>
          <div class="cta-actions">
            <button type="button" class="btn-register-pro-big" (click)="anarRegistrePro()">
              {{ 'COMMUNITY_PRO.FINAL_BTN' | translate }}
            </button>
            <a [routerLink]="getNavUrl('/inici')" class="link-back-main">{{ 'COMMUNITY_PRO.FINAL_BACK' | translate }}</a>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .pro-community-page {
      max-width: 1180px;
      margin: 0 auto;
      padding: 1.5rem 1.25rem 5rem;
      color: #09090c;
      font-family: inherit;
    }

    /* Breadcrumbs */
    .pro-breadcrumbs {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.88rem;
      color: #636058;
      margin-bottom: 2rem;
    }
    .breadcrumb-link {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      color: #636058;
      text-decoration: none;
      font-weight: 600;
      transition: color 0.2s ease;
    }
    .breadcrumb-link:hover {
      color: #ff1744;
    }
    .breadcrumb-separator {
      color: #d6d0c4;
    }
    .breadcrumb-current {
      color: #09090c;
      font-weight: 700;
    }

    /* Hero */
    .pro-hero-section {
      text-align: center;
      padding: 3.5rem 2rem 3rem;
      background: linear-gradient(180deg, rgba(255, 23, 68, 0.04) 0%, #ffffff 100%);
      border: 1px solid #e5e0d7;
      border-radius: 20px;
      margin-bottom: 4rem;
      box-shadow: 0 8px 30px rgba(0, 0, 0, 0.04);
    }
    .hero-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.4rem 1rem;
      background: rgba(255, 23, 68, 0.08);
      color: #ff1744;
      font-size: 0.8rem;
      font-weight: 800;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      border-radius: 9999px;
      border: 1px solid rgba(255, 23, 68, 0.2);
      margin-bottom: 1.25rem;
    }
    .badge-dot {
      width: 7px;
      height: 7px;
      background: #ff1744;
      border-radius: 50%;
    }
    .hero-title {
      font-size: 2.5rem;
      line-height: 1.2;
      font-weight: 900;
      color: #09090c;
      max-width: 880px;
      margin: 0 auto 1.25rem;
      letter-spacing: -0.02em;
    }
    .hero-lead {
      font-size: 1.12rem;
      line-height: 1.65;
      color: #636058;
      max-width: 760px;
      margin: 0 auto 2.25rem;
    }
    .hero-cta-group {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 1rem;
      margin-bottom: 3rem;
    }
    .btn-hero-primary {
      display: inline-flex;
      align-items: center;
      gap: 0.6rem;
      padding: 0.95rem 1.9rem;
      background: #ff1744;
      color: #ffffff;
      border: none;
      border-radius: 12px;
      font-size: 1rem;
      font-weight: 800;
      cursor: pointer;
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 4px 18px rgba(255, 23, 68, 0.35);
    }
    .btn-hero-primary:hover {
      background: #d50000;
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(255, 23, 68, 0.5);
    }
    .btn-hero-secondary {
      display: inline-flex;
      align-items: center;
      gap: 0.6rem;
      padding: 0.95rem 1.7rem;
      background: #ffffff;
      color: #09090c;
      border: 1px solid #d6d0c4;
      border-radius: 12px;
      font-size: 0.95rem;
      font-weight: 700;
      text-decoration: none;
      transition: all 0.25s ease;
    }
    .btn-hero-secondary:hover {
      border-color: #ff1744;
      color: #ff1744;
      background: #faf8f4;
      transform: translateY(-2px);
    }

    /* Mètriques */
    .pro-stats-strip {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
      gap: 1.5rem;
      padding-top: 2.25rem;
      border-top: 1px solid #ede8df;
    }
    .stat-item {
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .stat-number {
      font-size: 2.1rem;
      font-weight: 900;
      color: #ff1744;
      line-height: 1;
      margin-bottom: 0.45rem;
    }
    .stat-label {
      font-size: 0.86rem;
      color: #636058;
      font-weight: 600;
      text-align: center;
      line-height: 1.4;
    }

    /* Encapçalaments de secció */
    .section-heading {
      text-align: center;
      max-width: 740px;
      margin: 0 auto 3rem;
    }
    .section-tag {
      display: inline-block;
      font-size: 0.78rem;
      font-weight: 800;
      color: #ff1744;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      margin-bottom: 0.5rem;
    }
    .section-heading h2 {
      font-size: 2.1rem;
      font-weight: 900;
      color: #09090c;
      margin: 0 0 0.85rem;
      letter-spacing: -0.02em;
    }
    .section-heading p {
      font-size: 1.05rem;
      color: #636058;
      line-height: 1.6;
      margin: 0;
    }

    /* Graella de raons */
    .reasons-section {
      margin-bottom: 5rem;
    }
    .reasons-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr));
      gap: 1.75rem;
    }
    .reason-card {
      background: #ffffff;
      border: 1px solid #e5e0d7;
      border-radius: 16px;
      padding: 2.2rem 2rem;
      transition: all 0.25s ease;
      box-shadow: 0 4px 18px rgba(0, 0, 0, 0.03);
    }
    .reason-card:hover {
      border-color: #ff1744;
      transform: translateY(-4px);
      box-shadow: 0 12px 30px rgba(0, 0, 0, 0.08);
    }
    .reason-icon-wrapper {
      width: 56px;
      height: 56px;
      border-radius: 14px;
      background: rgba(255, 23, 68, 0.08);
      border: 1px solid rgba(255, 23, 68, 0.18);
      color: #ff1744;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 1.35rem;
    }
    .reason-card h3 {
      font-size: 1.25rem;
      font-weight: 800;
      color: #09090c;
      margin: 0 0 0.75rem;
    }
    .reason-card p {
      font-size: 0.95rem;
      line-height: 1.65;
      color: #636058;
      margin: 0;
    }
    .reason-card strong {
      color: #09090c;
    }

    /* Banner de transparència i sostenibilitat */
    .transparency-section {
      margin-bottom: 5rem;
    }
    .transparency-card {
      background: linear-gradient(135deg, #ffffff 0%, #fffbf5 100%);
      border: 1.5px solid #fed7aa;
      border-radius: 20px;
      padding: 2.2rem 2.5rem;
      display: flex;
      align-items: flex-start;
      gap: 1.75rem;
      box-shadow: 0 8px 30px rgba(234, 88, 12, 0.05);
      position: relative;
      overflow: hidden;
    }
    .transparency-icon {
      width: 58px;
      height: 58px;
      min-width: 58px;
      border-radius: 16px;
      background: #ffedd5;
      color: #ea580c;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1px solid #fdba74;
    }
    .transparency-text {
      flex: 1;
    }
    .transparency-tag {
      display: inline-block;
      font-size: 0.76rem;
      font-weight: 800;
      letter-spacing: 0.08em;
      color: #ea580c;
      text-transform: uppercase;
      margin-bottom: 0.45rem;
    }
    .transparency-text h3 {
      font-size: 1.35rem;
      font-weight: 900;
      color: #09090c;
      margin: 0 0 0.65rem;
      letter-spacing: -0.01em;
    }
    .transparency-text p {
      font-size: 0.98rem;
      line-height: 1.65;
      color: #4b5563;
      margin: 0;
    }

    /* Taula comparativa */
    .comparison-section {
      margin-bottom: 5rem;
      background: #ffffff;
      border: 1px solid #e5e0d7;
      border-radius: 20px;
      padding: 3.5rem 2.5rem;
      box-shadow: 0 8px 30px rgba(0, 0, 0, 0.03);
    }
    .table-responsive {
      overflow-x: auto;
    }
    .comparison-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
      font-size: 0.95rem;
    }
    .comparison-table th {
      padding: 1.1rem 1.4rem;
      background: #faf8f4;
      color: #09090c;
      font-weight: 800;
      border-bottom: 2px solid #e5e0d7;
      font-size: 0.95rem;
    }
    .comparison-table th.col-avisa {
      background: rgba(255, 23, 68, 0.08);
      color: #ff1744;
      border-bottom-color: #ff1744;
      border-left: 2px solid #ff1744;
      border-right: 2px solid #ff1744;
    }
    .comparison-table td {
      padding: 1.1rem 1.4rem;
      border-bottom: 1px solid #ede8df;
      color: #636058;
    }
    .comparison-table td strong {
      color: #09090c;
    }
    .comparison-table td.col-avisa {
      background: rgba(255, 23, 68, 0.02);
      font-weight: 700;
      color: #09090c;
      border-left: 2px solid #ff1744;
      border-right: 2px solid #ff1744;
    }
    .badge-win {
      display: inline-block;
      padding: 0.3rem 0.7rem;
      background: #ecfdf5;
      color: #059669;
      border: 1px solid #a7f3d0;
      border-radius: 6px;
      font-weight: 800;
      font-size: 0.85rem;
    }

    /* Secció Procés de Verificació per Trucada */
    .verif-process-section {
      margin-bottom: 5rem;
    }
    .verif-tag-pill {
      background: #ecfdf5 !important;
      color: #059669 !important;
      border-color: #a7f3d0 !important;
    }
    .verif-steps-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(min(100%, 230px), 1fr));
      gap: 1.5rem;
      margin-top: 2.25rem;
    }
    .verif-step-card {
      background: #ffffff;
      border: 1px solid #e5e0d7;
      border-radius: 16px;
      padding: 1.85rem 1.4rem;
      position: relative;
      transition: all 0.25s ease;
      box-shadow: 0 4px 18px rgba(0, 0, 0, 0.03);
    }
    .verif-step-card:hover {
      transform: translateY(-3px);
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.06);
    }
    .verif-step-card.highlight-step {
      border-color: #fdba74;
      background: linear-gradient(180deg, #fffbf6 0%, #ffffff 100%);
    }
    .verif-step-card.success-step {
      border-color: #86efac;
      background: linear-gradient(180deg, #f0fdf4 0%, #ffffff 100%);
    }
    .step-badge {
      position: absolute;
      top: 1.25rem;
      right: 1.25rem;
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: #f1f5f9;
      color: #64748b;
      font-size: 0.8rem;
      font-weight: 900;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .highlight-step .step-badge {
      background: #ffedd5;
      color: #ea580c;
    }
    .success-step .step-badge {
      background: #dcfce7;
      color: #15803d;
    }
    .step-icon {
      width: 50px;
      height: 50px;
      border-radius: 12px;
      background: #f8fafc;
      color: #09090c;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1px solid #e2e8f0;
      margin-bottom: 1.15rem;
    }
    .highlight-step .step-icon {
      background: #ffedd5;
      color: #ea580c;
      border-color: #fed7aa;
    }
    .success-step .step-icon {
      background: #dcfce7;
      color: #16a34a;
      border-color: #bbf7d0;
    }
    .verif-step-card h4 {
      font-size: 1.1rem;
      font-weight: 800;
      color: #09090c;
      margin: 0 0 0.55rem;
    }
    .verif-step-card p {
      font-size: 0.9rem;
      line-height: 1.55;
      color: #636058;
      margin: 0;
    }

    /* Blog / Guies */
    .pro-blog-section {
      margin-bottom: 5rem;
    }
    .guides-accordion {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
    .guide-card {
      background: #ffffff;
      border: 1px solid #e5e0d7;
      border-radius: 16px;
      overflow: hidden;
      transition: all 0.25s ease;
      box-shadow: 0 4px 18px rgba(0, 0, 0, 0.02);
    }
    .guide-card:hover {
      border-color: #d6d0c4;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.05);
    }
    .guide-header {
      padding: 1.8rem 2.2rem;
      cursor: pointer;
      user-select: none;
    }
    .guide-meta-top {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 0.6rem;
    }
    .guide-cat-badge {
      display: inline-block;
      padding: 0.25rem 0.65rem;
      background: rgba(255, 23, 68, 0.08);
      color: #ff1744;
      font-size: 0.72rem;
      font-weight: 800;
      text-transform: uppercase;
      border-radius: 6px;
    }
    .guide-read-time {
      font-size: 0.82rem;
      color: #8c887b;
      font-weight: 500;
    }
    .guide-header h3 {
      font-size: 1.35rem;
      font-weight: 800;
      color: #09090c;
      margin: 0 0 0.4rem;
      line-height: 1.35;
    }
    .guide-subtitle {
      font-size: 0.98rem;
      color: #636058;
      margin: 0 0 1rem;
      line-height: 1.5;
    }
    .guide-toggle-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      font-size: 0.88rem;
      font-weight: 700;
      color: #ff1744;
    }
    .guide-toggle-btn svg {
      transition: transform 0.25s ease;
    }
    .guide-toggle-btn svg.rotated {
      transform: rotate(180deg);
    }

    .guide-content-body {
      padding: 0 2.2rem 2.2rem;
      border-top: 1px solid #ede8df;
      animation: fadeIn 0.3s ease;
    }
    .guide-cover-img {
      width: 100%;
      max-height: 340px;
      object-fit: cover;
      border-radius: 12px;
      margin: 1.75rem 0 1.5rem;
    }
    .guide-paragraphs p {
      font-size: 1rem;
      line-height: 1.75;
      color: #4b5563;
      margin-bottom: 1rem;
    }
    .guide-checklist {
      background: #faf8f4;
      border-left: 4px solid #ff1744;
      padding: 1.35rem 1.6rem;
      border-radius: 8px;
      margin: 1.75rem 0;
    }
    .guide-checklist strong {
      display: block;
      color: #09090c;
      font-weight: 800;
      margin-bottom: 0.75rem;
      font-size: 1rem;
    }
    .guide-checklist ul {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      color: #4b5563;
      font-size: 0.95rem;
    }
    .guide-callout {
      display: flex;
      align-items: flex-start;
      gap: 0.85rem;
      background: rgba(255, 23, 68, 0.05);
      border: 1px solid rgba(255, 23, 68, 0.15);
      padding: 1.1rem 1.4rem;
      border-radius: 10px;
      font-size: 0.95rem;
      color: #09090c;
    }
    .callout-icon {
      font-size: 1.25rem;
      line-height: 1;
    }
    .guide-callout p {
      margin: 0;
      line-height: 1.6;
    }

    /* Testimonis */
    .testimonials-section {
      margin-bottom: 5rem;
    }
    .testimonials-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(310px, 1fr));
      gap: 1.75rem;
    }
    .testi-card {
      background: #ffffff;
      border: 1px solid #e5e0d7;
      border-radius: 16px;
      padding: 2.2rem 2rem;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      box-shadow: 0 4px 18px rgba(0, 0, 0, 0.03);
      transition: all 0.25s ease;
    }
    .testi-card:hover {
      border-color: #ff1744;
      transform: translateY(-4px);
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
    }
    .testi-stars {
      color: #f59e0b;
      font-size: 1.25rem;
      letter-spacing: 2px;
      margin-bottom: 1.1rem;
    }
    .testi-quote {
      font-size: 0.95rem;
      line-height: 1.65;
      color: #4b5563;
      font-style: italic;
      margin: 0 0 1.75rem;
    }
    .testi-author {
      display: flex;
      align-items: center;
      gap: 0.95rem;
    }
    .testi-avatar {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      object-fit: cover;
      border: 2px solid #ff1744;
    }
    .testi-author strong {
      display: block;
      color: #09090c;
      font-size: 0.98rem;
    }
    .testi-author span {
      font-size: 0.8rem;
      color: #636058;
    }

    /* CTA final */
    .final-pro-cta {
      background: linear-gradient(135deg, #09090c 0%, #1e1e24 100%);
      border: 1px solid #2d2d38;
      border-radius: 20px;
      padding: 4rem 2rem;
      text-align: center;
      box-shadow: 0 15px 40px rgba(0, 0, 0, 0.2);
    }
    .cta-mini-tag {
      display: inline-block;
      font-size: 0.78rem;
      font-weight: 800;
      color: #ff1744;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      margin-bottom: 1rem;
    }
    .cta-inner-card h2 {
      font-size: 2.2rem;
      color: #ffffff;
      font-weight: 900;
      margin: 0 auto 1rem;
      max-width: 780px;
      letter-spacing: -0.02em;
      line-height: 1.25;
    }
    .cta-inner-card p {
      font-size: 1.1rem;
      color: #cbd5e1;
      max-width: 640px;
      margin: 0 auto 2.25rem;
      line-height: 1.65;
    }
    .cta-actions {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1.25rem;
    }
    .btn-register-pro-big {
      padding: 1.05rem 2.6rem;
      background: #ff1744;
      color: #ffffff;
      border: none;
      border-radius: 12px;
      font-size: 1.05rem;
      font-weight: 900;
      cursor: pointer;
      transition: all 0.25s ease;
      box-shadow: 0 6px 20px rgba(255, 23, 68, 0.4);
    }
    .btn-register-pro-big:hover {
      background: #d50000;
      transform: translateY(-2px);
      box-shadow: 0 10px 30px rgba(255, 23, 68, 0.6);
    }
    .link-back-main {
      color: #94a3b8;
      text-decoration: none;
      font-size: 0.92rem;
      font-weight: 600;
      transition: color 0.2s;
    }
    .link-back-main:hover {
      color: #ffffff;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-6px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @media (max-width: 768px) {
      .pro-community-page {
        padding: 1rem 0.75rem 3.5rem;
      }
      .pro-hero-section {
        padding: 2rem 1rem 2.25rem;
        border-radius: 14px;
        margin-bottom: 2.5rem;
      }
      .hero-title {
        font-size: 1.55rem;
      }
      .hero-lead {
        font-size: 0.95rem;
        margin-bottom: 1.75rem;
      }
      .pro-stats-strip {
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
        padding-top: 1.5rem;
      }
      .stat-number {
        font-size: 1.6rem;
      }
      .stat-label {
        font-size: 0.78rem;
      }
      .section-heading h2 {
        font-size: 1.5rem;
      }
      .reasons-section, .transparency-section, .comparison-section, .verif-process-section, .pro-blog-section, .testimonials-section {
        margin-bottom: 2.75rem;
      }
      .verif-steps-grid {
        grid-template-columns: 1fr;
        gap: 1.15rem;
      }
      .transparency-card {
        flex-direction: column;
        padding: 1.6rem 1.25rem;
        gap: 1.15rem;
        border-radius: 14px;
      }
      .transparency-text h3 {
        font-size: 1.2rem;
      }
      .reason-card {
        padding: 1.5rem 1.15rem;
        border-radius: 14px;
      }
      .comparison-section {
        padding: 1.75rem 1rem;
        border-radius: 14px;
      }
      .comparison-table th, .comparison-table td {
        padding: 0.75rem 0.65rem;
        font-size: 0.82rem;
      }
      .guide-header {
        padding: 1.25rem 1rem;
      }
      .guide-header h3 {
        font-size: 1.15rem;
      }
      .guide-content-body {
        padding: 0 1rem 1.5rem;
      }
      .testi-card {
        padding: 1.5rem 1.15rem;
        border-radius: 14px;
      }
      .final-pro-cta {
        padding: 2.25rem 1.15rem;
        border-radius: 14px;
      }
      .cta-inner-card h2 {
        font-size: 1.45rem;
      }
      .cta-inner-card p {
        font-size: 0.95rem;
      }
      .btn-hero-primary, .btn-hero-secondary, .btn-register-pro-big {
        width: 100%;
        justify-content: center;
      }
    }
  `]
})
export class ComunitatProfessionalsComponent implements OnInit {
  guiaOberta: string = 'guia-1';

  get guiesProfessionals(): GuiaProfessional[] {
    const lang = this.translationService.getLanguage();
    if (lang === 'ES') return GUIES_PRO_ES;
    if (lang === 'EN') return GUIES_PRO_EN;
    return GUIES_PRO_VA;
  }

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly translationService: TranslationService
  ) {}

  ngOnInit(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  toggleGuia(id: string): void {
    this.guiaOberta = this.guiaOberta === id ? '' : id;
  }

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

  anarRegistrePro(): void {
    if (this.authService.isLoggedIn()) {
      if (this.authService.isProfessional()) {
        this.router.navigate([this.getNavUrl('/tasques-ofertes')], { queryParams: { tipus: 'tasques' } });
      } else {
        this.router.navigate([this.getNavUrl('/perfil')]);
      }
      return;
    }
    this.router.navigate([this.getNavUrl('/registre')], { queryParams: { rol: 'professional' } });
  }
}
