import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router, RouterLink, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { DashboardResponse, DashboardService } from '../../services/dashboard.service';
import { OfertaService } from '../../services/oferta.service';
import { ResenyaService } from '../../services/resenya.service';
import { AuthService } from '../../core/services/auth.service';
import { Resenya } from '../../models/resenya.model';
import { ArticleService } from '../../services/article.service';
import { Article } from '../../models/article.model';
import { ConfirmService } from '../../core/services/confirm.service';
import { PwaService } from '../../core/services/pwa.service';
import { UsuariService } from '../../services/usuari.service';
import { Usuari } from '../../models/usuari.model';
import { TranslationService } from '../../core/services/translation.service';

import { TranslatePipe } from '../../core/pipes/translate.pipe';

/**
 * Component Principal de la Pàgina d'Inici d'AVISA (/).
 * Ofereix:
 * 1. Portada immersiva a pantalla completa amb imatge fixa de fons, títol 'AVISA' i eslògan.
 * 2. Tauler de categories amb accés ràpid per gremis.
 * 3. Mostra d'ofertes i tasques destacades amb estadístiques reals.
 * 4. Secció editorial / Blog amb articles tècnics i consells pràctics del sector local.
 * 5. Crida a l'acció tant per a clients particulars com per a professionals autònoms.
 */
@Component({
  selector: 'app-main',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslatePipe],
  template: `
    <section class="main-page">
      <!-- PORTADA INICIAL DE PANTALLA COMPLETA AMB 1 SOLA FOTO FIXA DE FONS (NOMÉS EN WEB PÚBLICA) -->
      <header class="fullscreen-cover" *ngIf="showFullscreenCover">
        <!-- NOM DE LA WEB EN MIG DE LA PÀGINA I SLOGAN ORIGINAL FIX -->
        <div class="hero-center">
          <h1 class="hero-brand">AVISA</h1>
          <p class="hero-slogan">{{ 'HOME.HERO_SLOGAN' | translate }}</p>
        </div>

        <div class="cover-scroll-hint" (click)="scrollToContent()" role="button" [attr.aria-label]="'HOME.SCROLL_DOWN' | translate" [title]="'HOME.SCROLL_DOWN' | translate">
          <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </div>
      </header>

      <!-- CONTINGUT PRINCIPAL DE LA PLATAFORMA (VISUALITZAT EN FER SCROLL) -->
      <div class="dashboard-body">
        <!-- MISSATGE DE BENVINGUDA -->
        <section class="dashboard-welcome-banner" aria-label="Missatge de benvinguda">
          <div class="welcome-banner-content">
            <div class="welcome-badge-row">
              <span class="welcome-badge">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                </svg>
                AVISA
              </span>
              <span *ngIf="authService.isLoggedIn()" class="welcome-user-role-chip" [ngClass]="getWelcomeRoleClass()">
                {{ getWelcomeRoleLabel() }}
              </span>
            </div>

            <h1 class="welcome-title">
              {{ authService.isLoggedIn() ? getUserWelcomeTitle() : ('HOME.WELCOME_GUEST_TITLE' | translate) }}
            </h1>
            <p class="welcome-subtitle">
              {{ authService.isLoggedIn() ? getUserWelcomeSubtitle() : ('HOME.WELCOME_GUEST_SUBTITLE' | translate) }}
            </p>

            <div class="welcome-banner-actions">
              <a [routerLink]="getNavUrl('/tasques-ofertes')" class="btn-welcome-primary">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                <span>{{ 'HOME.WELCOME_BTN_MARKET' | translate }}</span>
              </a>

              <a *ngIf="!authService.isLoggedIn()" [routerLink]="getNavUrl('/login')" class="btn-welcome-secondary">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="8.5" cy="7" r="4"></circle>
                  <line x1="20" y1="8" x2="20" y2="14"></line>
                  <line x1="23" y1="11" x2="17" y2="11"></line>
                </svg>
                <span>{{ 'HOME.WELCOME_BTN_REGISTER' | translate }}</span>
              </a>

              <a *ngIf="authService.isLoggedIn()" [routerLink]="getNavUrl('/perfil')" class="btn-welcome-secondary">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                <span>{{ 'HOME.WELCOME_BTN_PROFILE' | translate }}</span>
              </a>
            </div>
          </div>
        </section>

        <div class="dashboard-header-bar">
          <div>
            <span class="eyebrow-tag">{{ 'HOME.PLATAFORMA_AVISA' | translate }}</span>
            <h2 class="dashboard-title">{{ 'HOME.DASHBOARD_TITLE' | translate }}</h2>
          </div>
          <div class="dashboard-header-actions">
            <button
              *ngIf="authService.isLoggedIn() && authService.isClient()"
              type="button"
              class="btn-create-task"
              (click)="onNovaTasca()"
            >
              {{ 'TASQUES_OFERTES.BTN_NOVA_INCIDENCIA' | translate }}
            </button>
            <button
              *ngIf="authService.isLoggedIn() && authService.isProfessional()"
              type="button"
              class="btn-create-offer-dash"
              (click)="onNovaOferta()"
            >
              {{ 'TASQUES_OFERTES.BTN_NOVA_OFERTA' | translate }}
            </button>
            <a
              *ngIf="!authService.isLoggedIn()"
              [routerLink]="getNavUrl('/tasques-ofertes')"
              class="btn-create-task"
            >
              {{ 'HOME.PUBLICAR_BTN' | translate }}
            </a>
          </div>
        </div>

        <div *ngIf="noticeMessage" class="notice-banner">
          <span>{{ noticeMessage }}</span>
          <button type="button" class="btn-dismiss" (click)="noticeMessage = ''" aria-label="Tancar avís">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>



        <!-- ============================================================== -->
        <!-- CARRUSEL ESTIL TWITCH DE PROFESSIONALS DE CONFIANÇA RECOMANATS -->
        <!-- ============================================================== -->
        <section
          class="twitch-carousel-section"
          id="professionals-verificats-carrusel"
          (mouseenter)="pauseProCarousel()"
          (mouseleave)="resumeProCarousel()"
        >
          <div class="twitch-carousel-header">
            <div class="twitch-carousel-title-group">
              <span class="carousel-eyebrow">{{ 'HOME.PRO_CAROUSEL_EYEBROW' | translate }}</span>
              <h3 class="carousel-title">{{ 'HOME.PRO_CAROUSEL_TITLE' | translate }}</h3>
              <p class="carousel-subtitle">{{ 'HOME.PRO_CAROUSEL_SUBTITLE' | translate }}</p>
            </div>
            <div class="carousel-live-indicator" *ngIf="verifiedProfessionals.length > 1">
              <span class="live-dot" [class.paused]="isProCarouselPaused"></span>
              <span class="live-label">{{ isProCarouselPaused ? 'En pausa' : 'Rotació activa' }}</span>
            </div>
          </div>

          <div class="no-pros-msg" *ngIf="verifiedProfessionals.length === 0">
            <p>{{ 'HOME.PRO_CAROUSEL_NO_PROS' | translate }}</p>
          </div>

          <!-- ESCENARI TWITCH: PREV, CENTER (GRAN), NEXT -->
          <div class="twitch-carousel-stage" [class.is-transitioning]="isProCarouselTransitioning" *ngIf="verifiedProfessionals.length > 0">
            <!-- TARGETA PREVISUALITZACIÓ ANTERIOR (ESQUERRA) -->
            <div
              class="side-preview-card prev-card"
              *ngIf="prevPro as prev"
              (click)="goToPrevPro()"
              [title]="'Veure professional anterior: ' + prev.nom"
              role="button"
              tabindex="0"
              (keydown.enter)="goToPrevPro()"
            >
              <div class="side-card-bg" [style.backgroundImage]="getProSideBackground(prev)"></div>
              <div class="side-card-glass">
                <button
                  type="button"
                  class="btn-side-arrow"
                  (click)="$event.stopPropagation(); goToPrevPro()"
                  aria-label="Professional anterior"
                  title="Anterior"
                >
                  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="15 18 9 12 15 6"></polyline>
                  </svg>
                </button>
                <div class="side-card-info">
                  <div class="side-avatar" [style.background]="getProFotoPerfil(prev) ? 'transparent' : getCompanyLogo(prev).bg">
                    <img *ngIf="getProFotoPerfil(prev) as isotip" [src]="isotip" [alt]="prev.nom" class="pro-isotip-img" />
                    <span *ngIf="!getProFotoPerfil(prev)">{{ getCompanyLogo(prev).initial }}</span>
                  </div>
                  <div class="side-meta">
                    <h5 class="side-pro-name">{{ prev.nom }}</h5>
                    <span class="side-pro-spec" *ngIf="getProSpeciality(prev) as spec">{{ spec }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- TARGETA PRINCIPAL EN GRAN (SHOWCASE HERO CENTRAL) -->
            <article class="main-showcase-card" *ngIf="currentPro as pro">
              <div class="showcase-banner" [style.backgroundImage]="getProMainBackground(pro)">
                <div class="banner-gradient-overlay"></div>
                
                <div class="banner-top-chips">
                  <span class="chip-verified">
                    <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 4px;">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    {{ 'HOME.PRO_CAROUSEL_VERIFIED_BADGE' | translate }}
                  </span>
                  <span class="chip-speciality" *ngIf="getProSpeciality(pro) as spec">{{ spec }}</span>
                </div>

                <div class="banner-bottom-info" *ngIf="getRatingInfo(pro) as r">
                  <div class="rating-chip">
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="#fbbf24" style="margin-right: 3px;">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                    </svg>
                    <strong>{{ r.mitjana }}</strong>
                    <span class="rating-sub">({{ r.total }} {{ r.total === 1 ? 'opinió' : 'opinions' }})</span>
                  </div>
                </div>
              </div>

              <div class="showcase-details">
                <div class="pro-header-brand">
                  <div class="brand-logo" [style.background]="getProFotoPerfil(pro) ? 'transparent' : getCompanyLogo(pro).bg">
                    <img *ngIf="getProFotoPerfil(pro) as isotip" [src]="isotip" [alt]="pro.nom" class="pro-isotip-img" />
                    <span *ngIf="!getProFotoPerfil(pro)" class="brand-monogram">{{ getCompanyLogo(pro).initial }}</span>
                    <span class="brand-verified-tick" [title]="'HOME.PRO_CAROUSEL_VERIFIED_BADGE' | translate">
                      <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </span>
                  </div>

                  <div class="brand-text">
                    <h4 class="showcase-name">
                      <a [routerLink]="[getNavUrl('/perfil'), pro.id]" class="showcase-name-link" [title]="pro.nom">{{ pro.nom }}</a>
                    </h4>
                    <span class="showcase-role">Professional recomanat & homologat AVISA</span>
                  </div>
                </div>

                <p class="showcase-bio">
                  {{ pro.bio || 'Professional qualificat de confiança amb serveis garantits a la comunitat AVISA.' }}
                </p>

                <div class="showcase-perks">
                  <span class="perk-badge">
                    <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="#10b981" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    Verificació oficial
                  </span>
                  <span class="perk-badge">
                    <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="#3b82f6" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    Pressupost transparent
                  </span>
                  <span class="perk-badge">
                    <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="#f59e0b" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                    </svg>
                    Garantia AVISA
                  </span>
                </div>

                <div class="showcase-cta-bar">
                  <a [routerLink]="[getNavUrl('/perfil'), pro.id]" class="btn-showcase-profile">
                    <span>{{ 'HOME.PRO_CAROUSEL_BTN_PROFILE' | translate }}</span>
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                      <polyline points="12 5 19 12 12 19"></polyline>
                    </svg>
                  </a>
                </div>
              </div>
            </article>

            <!-- TARGETA PREVISUALITZACIÓ SEGÜENT (DRETA) -->
            <div
              class="side-preview-card next-card"
              *ngIf="nextPro as next"
              (click)="goToNextPro()"
              [title]="'Veure professional següent: ' + next.nom"
              role="button"
              tabindex="0"
              (keydown.enter)="goToNextPro()"
            >
              <div class="side-card-bg" [style.backgroundImage]="getProSideBackground(next)"></div>
              <div class="side-card-glass">
                <button
                  type="button"
                  class="btn-side-arrow"
                  (click)="$event.stopPropagation(); goToNextPro()"
                  aria-label="Professional següent"
                  title="Següent"
                >
                  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </button>
                <div class="side-card-info">
                  <div class="side-avatar" [style.background]="getProFotoPerfil(next) ? 'transparent' : getCompanyLogo(next).bg">
                    <img *ngIf="getProFotoPerfil(next) as isotip" [src]="isotip" [alt]="next.nom" class="pro-isotip-img" />
                    <span *ngIf="!getProFotoPerfil(next)">{{ getCompanyLogo(next).initial }}</span>
                  </div>
                  <div class="side-meta">
                    <h5 class="side-pro-name">{{ next.nom }}</h5>
                    <span class="side-pro-spec" *ngIf="getProSpeciality(next) as spec">{{ spec }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- INDICADORS DE POSICIÓ / PAGINACIÓ (DOTS TWITCH) -->
          <div class="twitch-carousel-dots" *ngIf="verifiedProfessionals.length > 1">
            <button
              type="button"
              *ngFor="let p of verifiedProfessionals; let idx = index"
              class="carousel-dot-btn"
              [class.active]="idx === (currentProIndex % verifiedProfessionals.length)"
              (click)="goToProIndex(idx)"
              [attr.aria-label]="'Professional ' + (idx + 1) + ': ' + p.nom"
              [title]="p.nom"
            >
              <span class="dot-bar"></span>
            </button>
          </div>
        </section>

        <ng-container *ngIf="!isAppPage">
        <!-- ============================================================== -->
        <!-- SECCIÓ 1: QUÈ ÉS I PER A QUÈ SERVEIX AVISA (PROPÒSIT I SEO)     -->
        <!-- ============================================================== -->
        <section class="seo-feature-section" id="que-es-avisa">
          <div class="section-badge-tag">{{ 'HOME.SEO_BADGE' | translate }}</div>
          <h2 class="seo-section-title">{{ 'HOME.SEO_TITLE' | translate }}</h2>
          <p class="seo-section-intro">
            {{ 'HOME.SEO_INTRO' | translate }}
          </p>

          <div class="feature-grid">
            <div class="feature-card">
              <div class="feature-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
              </div>
              <h3>{{ 'HOME.FEATURE_1_TITLE' | translate }}</h3>
              <p>
                {{ 'HOME.FEATURE_1_DESC' | translate }}
              </p>
            </div>

            <div class="feature-card">
              <div class="feature-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                  <path d="m9 12 2 2 4-4"></path>
                </svg>
              </div>
              <h3>{{ 'HOME.FEATURE_2_TITLE' | translate }}</h3>
              <p>
                {{ 'HOME.FEATURE_2_DESC' | translate }}
              </p>
            </div>

            <div class="feature-card">
              <div class="feature-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
              </div>
              <h3>{{ 'HOME.FEATURE_3_TITLE' | translate }}</h3>
              <p>
                {{ 'HOME.FEATURE_3_DESC' | translate }}
              </p>
            </div>
          </div>
        </section>

        <!-- ============================================================== -->
        <!-- SECCIÓ 2: EXPERIÈNCIA SINCRONITZADA AMB L'APP MÒBIL            -->
        <!-- ============================================================== -->
        <section class="app-sync-banner">
          <div class="app-sync-content">
            <span class="sync-tag">{{ 'HOME.APP_BADGE' | translate }}</span>
            <h2>{{ 'HOME.APP_TITLE' | translate }}</h2>
            <p>
              {{ 'HOME.APP_DESC' | translate }}
            </p>
            <div class="sync-highlights">
              <div class="highlight-item">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <span>{{ 'HOME.APP_F1' | translate }}</span>
              </div>
              <div class="highlight-item">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <span>{{ 'HOME.APP_F2' | translate }}</span>
              </div>
              <div class="highlight-item">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <span>{{ 'HOME.APP_F3' | translate }}</span>
              </div>
            </div>
            <div class="sync-actions">
              <button type="button" class="btn-sync-action" (click)="onNovaTasca()">{{ 'NAV.TASQUES_OFERTES' | translate }}</button>
              <button type="button" class="btn-sync-secondary" (click)="onAnarRegistreClient()">{{ 'NAV.CREAR_COMPTE_REGISTRE' | translate }}</button>
              <button *ngIf="!pwaService.isStandalone()" type="button" class="btn-sync-pwa" (click)="pwaService.openInstallGuide()">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 6px; vertical-align: middle;">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                <span>{{ 'PWA.INSTALL_BTN' | translate }}</span>
              </button>
            </div>
          </div>
        </section>

        <!-- ============================================================== -->
        <!-- SECCIÓ 3: BENEFICIS SEGONS EL TEU PERFIL (CLIENT I PRO)        -->
        <!-- ============================================================== -->
        <section class="roles-showcase-section">
          <div class="role-box pro-role-box">
            <div class="role-box-header">
              <span class="role-badge pro-badge">{{ 'HOME.ROLES_PRO_BADGE' | translate }}</span>
              <h3>{{ 'HOME.ROLES_PRO_TITLE' | translate }}</h3>
              <p>{{ 'HOME.ROLES_PRO_DESC' | translate }}</p>
            </div>
            <ul class="role-benefits-list">
              <li>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <span>{{ 'HOME.ROLES_PRO_F1' | translate }}</span>
              </li>
              <li>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <span>{{ 'HOME.ROLES_PRO_F2' | translate }}</span>
              </li>
              <li>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <span>{{ 'HOME.ROLES_PRO_F3' | translate }}</span>
              </li>
            </ul>
            <div class="pro-role-actions">
              <button type="button" class="btn-role-action pro-btn" (click)="onPublicarOferta()">{{ 'HOME.ROLES_PRO_BTN' | translate }}</button>
              <a routerLink="/sobre-nosaltres" class="btn-community-link">
                <span>{{ 'HOME.ROLES_PRO_COMMUNITY' | translate }}</span>
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </a>
            </div>
          </div>

          <div class="role-box client-role-box">
            <div class="role-box-header">
              <span class="role-badge client-badge">{{ 'HOME.ROLES_CLIENT_BADGE' | translate }}</span>
              <h3>{{ 'HOME.ROLES_CLIENT_TITLE' | translate }}</h3>
              <p>{{ 'HOME.ROLES_CLIENT_DESC' | translate }}</p>
            </div>
            <ul class="role-benefits-list">
              <li>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <span>{{ 'HOME.ROLES_CLIENT_F1' | translate }}</span>
              </li>
              <li>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <span>{{ 'HOME.ROLES_CLIENT_F2' | translate }}</span>
              </li>
              <li>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <span>{{ 'HOME.ROLES_CLIENT_F3' | translate }}</span>
              </li>
            </ul>
            <button type="button" class="btn-role-action" (click)="onNovaTasca()">{{ 'HOME.ROLES_CLIENT_BTN' | translate }}</button>
          </div>
        </section>

        <!-- ============================================================== -->
        <!-- SECCIÓ 4: BLOG I GUIA D'EXPERTS (OPTIMITZACIÓ SEO)             -->
        <!-- ============================================================== -->
        <section class="blog-seo-section" id="blog-avisa">
          <div class="blog-header-group">
            <div>
              <span class="section-badge-tag">{{ 'HOME.BLOG_SECTION_BADGE' | translate }}</span>
              <h2 class="seo-section-title">{{ 'HOME.BLOG_SECTION_TITLE' | translate }}</h2>
              <p class="seo-section-intro">
                {{ 'HOME.BLOG_SECTION_SUB' | translate }}
              </p>
            </div>
            <a routerLink="/blog" class="btn-all-blog-link">
              <span>{{ 'HOME.VIEW_ALL_ARTICLES' | translate }}</span>
            </a>
          </div>

          <div class="blog-grid">
            <article class="blog-card" *ngFor="let article of articlesBlog">
              <div class="blog-card-media" [routerLink]="['/article', article.id]" style="cursor: pointer;">
                <img [src]="article.imatge" [alt]="article.titol" loading="lazy" />
                <span class="blog-category-tag">{{ article.categoria | translate }}</span>
              </div>
              <div class="blog-card-content">
                <div class="blog-meta">
                  <span>{{ article.data }}</span>
                  <span>•</span>
                  <span>{{ article.tempsLectura }}</span>
                </div>
                <h3 [routerLink]="['/article', article.id]" style="cursor: pointer;">{{ article.titol }}</h3>
                <p>{{ article.resum }}</p>
                <a [routerLink]="['/article', article.id]" class="btn-read-article">
                  <span>{{ 'HOME.READ_MORE' | translate }}</span>
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </a>
              </div>
            </article>
          </div>
        </section>

        <!-- ============================================================== -->
        <!-- SECCIÓ: OPINIONS I VALORACIONS REALS DE CLIENTS               -->
        <!-- ============================================================== -->
        <section class="seo-feature-section reviews-feature-section" id="ressenyes-clients">
          <div class="section-badge-tag">{{ 'HOME.REVIEWS_BADGE' | translate }}</div>
          <h2 class="seo-section-title">{{ 'HOME.REVIEWS_TITLE' | translate }}</h2>
          <p class="seo-section-intro">
            {{ 'HOME.REVIEWS_INTRO' | translate }}
          </p>

          <div class="reviews-home-grid">
            <div class="review-home-card" *ngFor="let r of ressenyesDestacades">
              <div class="review-stars-row">
                <span class="star-gold" *ngFor="let s of [1,2,3,4,5]">
                  <svg viewBox="0 0 24 24" width="13" height="13" [attr.fill]="s <= r.puntuacio ? '#f59e0b' : '#d1d5db'" style="vertical-align: -1px; margin-right: 1px;" aria-hidden="true">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                  </svg>
                </span>
                <span class="rating-badge-small">{{ r.puntuacio }}.0</span>
              </div>
              <p class="review-home-comment">“{{ r.descripcio }}”</p>
              <div class="review-home-footer">
                <div class="review-client-icon">{{ (r.clientNom || 'C').charAt(0) }}</div>
                <div class="review-client-meta">
                  <strong class="client-name-bold">
                    <a [routerLink]="['/perfil', r.clientNom]" class="user-inline-link" title="Veure perfil de {{ r.clientNom }}">{{ r.clientNom || 'Client AVISA' }}</a>
                  </strong>
                  <span class="pro-assigned-note">Servei de <a [routerLink]="['/perfil', r.treballadorNom]" class="user-inline-link font-medium" title="Veure perfil de {{ r.treballadorNom }}">{{ r.treballadorNom }}</a></span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- ============================================================== -->
        <!-- SECCIÓ 5: BANNER DE PROPAGANDA / CONVERSIÓ (CTA)               -->
        <!-- ============================================================== -->
        <section class="cta-propaganda-banner">
          <div class="cta-banner-content">
            <span class="cta-tag">{{ 'HOME.CTA_BANNER_TAG' | translate }}</span>
            <h2>{{ 'HOME.CTA_BANNER_TITLE' | translate }}</h2>
            <p>
              {{ 'HOME.CTA_BANNER_DESC' | translate }}
            </p>
            <div class="cta-buttons-row">
              <button type="button" class="btn-cta-main" (click)="onNovaTasca()">
                {{ 'HOME.CTA_BANNER_BTN_MARKET' | translate }}
              </button>
              <button type="button" class="btn-cta-secondary" (click)="onAnarRegistreProfessional()">
                {{ 'HOME.CTA_BANNER_BTN_PRO' | translate }}
              </button>
            </div>
          </div>
        </section>

        <!-- ============================================================== -->
        <!-- SECCIÓ 6: PEU DE PÀGINA (FOOTER SEO INSTITUCIONAL)             -->
        <!-- ============================================================== -->
        <footer class="main-footer">
          <div class="footer-grid">
            <div class="footer-col brand-col">
              <div class="footer-brand">
                <span class="footer-badge">AV</span>
                <span class="footer-logo-text">AVISA</span>
              </div>
              <p class="footer-desc">
                {{ 'FOOTER.DESC' | translate }}
              </p>
              <span class="footer-status-pill">{{ 'FOOTER.STATUS_247' | translate }}</span>
            </div>

            <div class="footer-col">
              <h4>{{ 'FOOTER.POPULAR_SERVICES' | translate }}</h4>
              <ul>
                <li><span>{{ 'CATEGORIES.Reformes' | translate }}</span></li>
                <li><span>{{ 'CATEGORIES.Electricitat' | translate }}</span></li>
                <li><span>{{ 'CATEGORIES.Lampisteria' | translate }}</span></li>
                <li><span>{{ 'CATEGORIES.Pintura' | translate }}</span></li>
                <li><span>{{ 'CATEGORIES.Climatització' | translate }}</span></li>
                <li><span>{{ 'CATEGORIES.Fusteria' | translate }}</span></li>
              </ul>
            </div>

            <div class="footer-col">
              <h4>{{ 'FOOTER.NAV_AREAS' | translate }}</h4>
              <ul>
                <li><a routerLink="/tasques-ofertes">{{ 'NAV.TASQUES_OFERTES' | translate }}</a></li>
                <li><a routerLink="/tasques-ofertes" [queryParams]="{ tipus: 'incidencies' }">{{ 'TASQUES_OFERTES.FILTER_INCIDENCIES' | translate }}</a></li>
                <li><a routerLink="/tasques-ofertes" [queryParams]="{ tipus: 'ofertes' }">{{ 'TASQUES_OFERTES.FILTER_OFFERS' | translate }}</a></li>
                <li><a routerLink="/sobre-nosaltres">{{ 'NAV.COMUNITAT_PROFESSIONALS' | translate }}</a></li>
                <li><a routerLink="/registre" [queryParams]="{ rol: 'professional' }">{{ 'COMMON.PROFESSIONAL' | translate }}</a></li>
                <li><a routerLink="/registre" [queryParams]="{ rol: 'client' }">{{ 'COMMON.CLIENT' | translate }}</a></li>
                <li><a routerLink="/blog">{{ 'NAV.BLOG' | translate }}</a></li>
              </ul>
            </div>

            <div class="footer-col">
              <h4>{{ 'FOOTER.SECURITY_LEGAL' | translate }}</h4>
              <ul>
                <li><span>{{ 'HOME.FEATURE_2_TITLE' | translate }}</span></li>
                <li><span>{{ 'FOOTER.STATUS_247' | translate }}</span></li>
              </ul>
            </div>
          </div>

          <div class="footer-bottom">
            <p>{{ 'FOOTER.RIGHTS' | translate }}</p>
          </div>
        </footer>
        </ng-container>
      </div>

      <!-- MODAL DE CONFIRMACIÓ I CONTACTE POST-PETICIÓ (PETICIÓ ENVIADA) -->
      <div class="modal-backdrop" *ngIf="peticioExitDades" (click)="tancarModalPeticioExit()">
        <div class="modal-dialog modal-peticio-exit-dialog" (click)="$event.stopPropagation()">
          <header class="modal-header exit-modal-header">
            <div class="exit-success-circle">
              <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            <div class="exit-header-titles">
              <h2>{{ 'TASQUES_OFERTES.PETICIO_ENVIADA_TITLE' | translate }}</h2>
              <p class="exit-modal-sub">{{ 'TASQUES_OFERTES.PETICIO_ENVIADA_SUBTITLE' | translate }}</p>
            </div>
            <button type="button" class="btn-close-modal" (click)="tancarModalPeticioExit()" [attr.aria-label]="'COMMON.TANCAR' | translate">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </header>

          <div class="modal-body exit-modal-body">
            <!-- Targeta resum de la petició confirmada -->
            <div class="exit-offer-summary">
              <div class="exit-offer-badge">
                <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: -2px; margin-right: 4px;" aria-hidden="true">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                {{ 'TASQUES_OFERTES.AGREED_NATURE' | translate }}
              </div>
              <h3 class="exit-offer-title">{{ peticioExitDades.titol }}</h3>
              <div class="exit-offer-meta">
                <span class="exit-pro-info">
                  <strong>{{ 'TASQUES_OFERTES.PRO_ASSIGNED' | translate }}</strong> {{ peticioExitDades.professional }}
                </span>
                <span class="exit-price-pill">{{ peticioExitDades.preu }}</span>
              </div>
            </div>

            <!-- Opcions de contacte directe amb el professional -->
            <div class="exit-contact-section">
              <p class="exit-contact-intro">
                {{ 'TASQUES_OFERTES.PETICIO_CONTACT_PROMPT' | translate }}
              </p>

              <div class="exit-contact-buttons">
                <!-- WhatsApp -->
                <button type="button" class="exit-channel-btn exit-channel-wa" (click)="contactarWhatsappPeticio()">
                  <div class="exit-channel-icon wa-bg">
                    <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                      <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.664-.698c.97.587 1.761.883 2.796.883 3.183 0 5.769-2.587 5.77-5.767 0-3.181-2.586-5.769-5.77-5.769zm3.388 8.163c-.144.405-.837.774-1.17.822-.313.044-.725.074-2.385-.615-1.996-.826-3.268-2.862-3.368-2.996-.099-.133-.807-1.074-.807-2.048 0-.974.51-1.452.691-1.652.181-.199.395-.249.527-.249.132 0 .264.002.378.007.123.006.287-.047.45.344.167.399.57 1.391.62 1.492.051.101.085.22.018.354-.067.133-.101.217-.201.334-.101.118-.212.263-.303.353-.101.1-.207.21-.089.412.118.202.525.867 1.127 1.403.774.688 1.427.901 1.629 1.002.202.1.32.083.438-.051.118-.135.506-.59.641-.792.135-.202.27-.169.455-.101.185.067 1.176.554 1.378.655.202.101.337.151.387.236.05.084.05.489-.094.894z"></path>
                    </svg>
                  </div>
                  <div class="exit-channel-info">
                    <span class="exit-channel-title">{{ 'TASQUES_OFERTES.CONTACTAR_WHATSAPP_BTN' | translate }}</span>
                    <span class="exit-channel-sub">{{ peticioExitDades.telefon }}</span>
                  </div>
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="exit-channel-arrow">
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </button>

                <!-- Correu -->
                <button type="button" class="exit-channel-btn exit-channel-email" (click)="contactarEmailPeticio()">
                  <div class="exit-channel-icon email-bg">
                    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                      <polyline points="22,6 12,13 2,6"></polyline>
                    </svg>
                  </div>
                  <div class="exit-channel-info">
                    <span class="exit-channel-title">{{ 'TASQUES_OFERTES.CONTACTAR_EMAIL_BTN' | translate }}</span>
                    <span class="exit-channel-sub">{{ peticioExitDades.email }}</span>
                  </div>
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="exit-channel-arrow">
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <footer class="modal-footer exit-modal-footer">
            <button type="button" class="btn-exit-close" (click)="tancarModalPeticioExit()">{{ 'COMMON.TANCAR' | translate }}</button>
            <button type="button" class="btn-exit-view-task" *ngIf="peticioExitDades.tascaId" (click)="anarTascaPeticio(peticioExitDades.tascaId)">
              {{ 'TASQUES_OFERTES.VEURE_TASCA' | translate }} →
            </button>
          </footer>
        </div>
      </div>
    </section>
  `,
  styles: [
    `
      .main-page {
        width: 100%;
        display: flex;
        flex-direction: column;
        background-color: var(--bg-page, #f7f3ed);
        color: var(--color-text, #0c0c10);
        min-height: 100vh;
      }

      .fullscreen-cover {
        width: 100%;
        height: 100vh;
        min-height: 100vh;
        background-image: linear-gradient(rgba(8, 8, 12, 0.52), rgba(8, 8, 12, 0.78)),
          url('https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=2000&q=80');
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 2rem 1.5rem;
        box-sizing: border-box;
        position: relative;
      }

      .hero-center {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        user-select: none;
        z-index: 2;
        margin-top: -1.2rem;
      }

      .hero-brand {
        margin: 0;
        font-family: var(--font-title, 'Boldonse', 'Climate Crisis', sans-serif);
        font-size: clamp(3.2rem, 8vw, 6.2rem);
        font-weight: 900;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        color: #f7f3ed; /* Color blanc brut */
        text-shadow: 0 4px 30px rgba(0, 0, 0, 0.95), 0 2px 10px rgba(0, 0, 0, 0.7);
        line-height: 1.05;
      }

      .hero-slogan {
        margin: 1rem 0 0;
        font-family: var(--font-title, 'Boldonse', 'Climate Crisis', sans-serif);
        font-size: clamp(0.95rem, 2.2vw, 1.45rem);
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 0.16em;
        color: #f7f3ed; /* Color blanc brut */
        text-shadow: 0 4px 24px rgba(0, 0, 0, 0.95), 0 2px 8px rgba(0, 0, 0, 0.7);
        line-height: 1.35;
        max-width: 860px;
      }

      .cover-scroll-hint {
        position: absolute;
        bottom: 1.25rem;
        left: 50%;
        transform: translateX(-50%);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        color: #f7f3ed;
        opacity: 0.95;
        cursor: pointer;
        animation: bounceSlow 2s infinite ease-in-out;
        user-select: none;
        z-index: 2;
        padding: 0.45rem;
        border-radius: 50%;
        background: rgba(11, 11, 15, 0.45);
        border: 1px solid rgba(247, 243, 237, 0.28);
        backdrop-filter: blur(4px);
        transition: all 0.25s ease;
      }

      .cover-scroll-hint:hover {
        color: var(--neon, #ff1744);
        border-color: var(--neon, #ff1744);
        box-shadow: 0 0 16px rgba(255, 23, 68, 0.5);
        transform: translateX(-50%) scale(1.12);
      }

      @keyframes bounceSlow {
        0%, 100% {
          transform: translateX(-50%) translateY(0);
        }
        50% {
          transform: translateX(-50%) translateY(8px);
        }
      }

      .dashboard-body {
        width: min(1200px, 100%);
        margin: 0 auto;
        padding: 1.75rem 1.5rem 6rem 1.5rem;
        display: flex;
        flex-direction: column;
        gap: 2.2rem;
        box-sizing: border-box;
        background-color: var(--bg-page, #f7f3ed);
      }

      /* ============================================================== */
      /* BANNER DE BENVINGUDA SOBRE DASHBOARD-HEADER-BAR                */
      /* ============================================================== */
      .dashboard-welcome-banner {
        position: relative;
        background: var(--bg-card, #ffffff);
        border: 1px solid var(--border-subtle, #e5e0d7);
        border-radius: 20px;
        padding: 2rem 2.2rem;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
        overflow: hidden;
        transition: background-color 0.25s ease, border-color 0.25s ease;
      }

      .dashboard-welcome-banner::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        bottom: 0;
        width: 5px;
        background: linear-gradient(180deg, #ff1744 0%, #b00020 100%);
        border-top-left-radius: 20px;
        border-bottom-left-radius: 20px;
      }

      .welcome-banner-content {
        display: flex;
        flex-direction: column;
        gap: 0.85rem;
      }

      .welcome-badge-row {
        display: flex;
        align-items: center;
        gap: 0.6rem;
        flex-wrap: wrap;
      }

      .welcome-badge {
        display: inline-flex;
        align-items: center;
        gap: 0.45rem;
        padding: 0.32rem 0.8rem;
        border-radius: 9999px;
        font-size: 0.75rem;
        font-weight: 800;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        background: rgba(255, 23, 68, 0.1);
        color: #ff1744;
        border: 1px solid rgba(255, 23, 68, 0.25);
      }

      .welcome-user-role-chip {
        display: inline-flex;
        align-items: center;
        padding: 0.32rem 0.8rem;
        border-radius: 9999px;
        font-size: 0.75rem;
        font-weight: 700;
        letter-spacing: 0.04em;
        text-transform: uppercase;
      }

      .welcome-user-role-chip.role-client {
        background: #e0f2fe;
        color: #0369a1;
        border: 1px solid #bae6fd;
      }

      .welcome-user-role-chip.role-pro {
        background: #d1fae5;
        color: #047857;
        border: 1px solid #a7f3d0;
      }

      .welcome-user-role-chip.role-admin {
        background: #f3e8ff;
        color: #7e22ce;
        border: 1px solid #e9d5ff;
      }

      .welcome-title {
        margin: 0;
        font-size: 1.85rem;
        font-weight: 900;
        color: var(--color-text, #09090c);
        line-height: 1.25;
        letter-spacing: -0.025em;
      }

      .welcome-subtitle {
        margin: 0;
        font-size: 1rem;
        line-height: 1.6;
        color: var(--color-text-muted, #4b5563);
        max-width: 860px;
      }

      .welcome-banner-actions {
        display: flex;
        align-items: center;
        gap: 0.85rem;
        margin-top: 0.4rem;
        flex-wrap: wrap;
      }

      .btn-welcome-primary {
        display: inline-flex;
        align-items: center;
        gap: 0.55rem;
        background: #ff1744;
        color: #ffffff !important;
        border: 1px solid #ff1744;
        border-radius: 10px;
        padding: 0.7rem 1.4rem;
        font-size: 0.92rem;
        font-weight: 800;
        text-decoration: none;
        letter-spacing: 0.02em;
        box-shadow: 0 4px 14px rgba(255, 23, 68, 0.35);
        transition: all 0.2s ease;
        cursor: pointer;
      }

      .btn-welcome-primary:hover {
        background: #09090c;
        border-color: #09090c;
        transform: translateY(-2px);
        box-shadow: 0 6px 18px rgba(0, 0, 0, 0.25);
      }

      .btn-welcome-secondary {
        display: inline-flex;
        align-items: center;
        gap: 0.55rem;
        background: var(--bg-surface, #ece7dd);
        color: var(--color-text, #09090c) !important;
        border: 1px solid var(--border-subtle, #d8d2c4);
        border-radius: 10px;
        padding: 0.7rem 1.4rem;
        font-size: 0.92rem;
        font-weight: 700;
        text-decoration: none;
        letter-spacing: 0.02em;
        transition: all 0.2s ease;
        cursor: pointer;
      }

      .btn-welcome-secondary:hover {
        background: var(--bg-surface-elevated, #ded8cc);
        border-color: #09090c;
        transform: translateY(-2px);
      }

      .btn-welcome-primary:focus-visible,
      .btn-welcome-secondary:focus-visible {
        outline: 3px solid #ff1744;
        outline-offset: 2px;
      }

      /* Dark mode estil per al banner de benvinguda */
      body.theme-app-dark .dashboard-welcome-banner {
        background: var(--bg-card, #1b2030);
        border-color: var(--border-subtle, #363e55);
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
      }

      body.theme-app-dark .welcome-badge {
        background: rgba(255, 23, 68, 0.18);
        color: #ff5252;
        border-color: rgba(255, 23, 68, 0.4);
      }

      body.theme-app-dark .welcome-user-role-chip.role-client {
        background: rgba(14, 165, 233, 0.2);
        color: #7dd3fc;
        border-color: rgba(56, 189, 248, 0.4);
      }

      body.theme-app-dark .welcome-user-role-chip.role-pro {
        background: rgba(16, 185, 129, 0.2);
        color: #6ee7b7;
        border-color: rgba(52, 211, 153, 0.4);
      }

      body.theme-app-dark .welcome-user-role-chip.role-admin {
        background: rgba(168, 85, 247, 0.2);
        color: #d8b4fe;
        border-color: rgba(192, 132, 252, 0.4);
      }

      body.theme-app-dark .welcome-title {
        color: #f5f4ef;
      }

      body.theme-app-dark .welcome-subtitle {
        color: #cbd5e1;
      }

      body.theme-app-dark .btn-welcome-secondary {
        background: #252b3d;
        color: #f5f4ef !important;
        border-color: #3d4661;
      }

      body.theme-app-dark .btn-welcome-secondary:hover {
        background: #30374c;
        border-color: #ff1744;
      }

      body.theme-app-dark .btn-welcome-primary:hover {
        background: #ffffff;
        color: #09090c !important;
        border-color: #ffffff;
      }

      .dashboard-header-bar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        background: var(--bg-card, #ffffff);
        border-radius: 16px;
        padding: 1.6rem 2.2rem;
        border: 1px solid var(--border-subtle, #e5e0d7);
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
      }

      .dashboard-header-actions {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .eyebrow-tag {
        font-size: 0.75rem;
        font-weight: 900;
        text-transform: uppercase;
        letter-spacing: 0.12em;
        color: #ff1744;
        margin-bottom: 0.35rem;
        display: block;
      }

      .dashboard-title {
        margin: 0;
        font-size: 1.85rem;
        color: var(--color-text, #09090c);
        font-weight: 900;
        letter-spacing: -0.03em;
      }

      .btn-create-task {
        background: #ff1744;
        color: #ffffff;
        border: 1px solid #ff1744;
        border-radius: 8px;
        padding: 0.8rem 1.6rem;
        font-weight: 900;
        font-size: 0.95rem;
        cursor: pointer;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        box-shadow: 0 4px 16px rgba(255, 23, 68, 0.4);
        transition: all 0.2s ease;
      }

      .btn-create-task:hover {
        background: #09090c;
        color: #ffffff;
        border-color: #09090c;
        box-shadow: 0 6px 22px rgba(0, 0, 0, 0.25);
        transform: translateY(-2px);
      }

      .dashboard-header-actions {
        display: inline-flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .btn-dashboard-logout {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        background: #fff0f0;
        border: 1px solid #ffd4d4;
        color: #d32f2f;
        padding: 0.8rem 1.25rem;
        border-radius: 8px;
        font-weight: 800;
        font-size: 0.88rem;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .btn-dashboard-logout:hover {
        background: #ff1744;
        color: #ffffff;
        border-color: #ff1744;
        box-shadow: 0 4px 16px rgba(255, 23, 68, 0.35);
        transform: translateY(-2px);
      }

      .btn-create-offer-dash {
        background: #09090c;
        color: #ffffff;
        border: 1px solid #23232f;
        border-radius: 8px;
        padding: 0.8rem 1.6rem;
        font-weight: 900;
        font-size: 0.95rem;
        cursor: pointer;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        transition: all 0.2s ease;
      }

      .btn-create-offer-dash:hover {
        background: #ff1744;
        border-color: #ff1744;
        box-shadow: 0 4px 16px rgba(255, 23, 68, 0.4);
        transform: translateY(-2px);
      }

      body.theme-app-dark .btn-create-offer-dash {
        background: #252b3d;
        border-color: #3d4661;
        color: #f5f4ef;
      }

      body.theme-app-dark .btn-create-offer-dash:hover {
        background: #ff1744;
        border-color: #ff1744;
        color: #ffffff;
      }

      .stats {
        display: grid;
        grid-template-columns: repeat(3, minmax(150px, 1fr));
        gap: 1.25rem;
      }

      .stat-card {
        background: #ffffff;
        border: 1px solid #e5e0d7;
        border-radius: 16px;
        padding: 1.5rem 1.6rem;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.03);
        transition: border-color 0.2s ease, transform 0.2s ease;
      }

      .stat-card:hover {
        border-color: #ff1744;
        transform: translateY(-2px);
      }

      .label {
        color: #716f67;
        font-size: 0.85rem;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 0.06em;
      }

      .stat-card strong {
        font-size: 2.4rem;
        color: #09090c;
        font-weight: 900;
        line-height: 1;
      }

      .columns {
        display: grid;
        grid-template-columns: 1.2fr 1fr;
        gap: 1.5rem;
      }

      @media (max-width: 900px) {
        .columns {
          grid-template-columns: 1fr;
        }
        .stats {
          grid-template-columns: 1fr;
        }
      }

      .panel {
        background: var(--bg-card, #ffffff);
        border: 1px solid var(--border-subtle, #e5e0d7);
        border-radius: 18px;
        padding: 1.5rem;
        display: flex;
        flex-direction: column;
        gap: 1.25rem;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
      }

      .panel-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid var(--border-subtle, #eeeae1);
        padding-bottom: 0.85rem;
      }

      .panel-header h2 {
        margin: 0;
        font-size: 1.35rem;
        font-weight: 900;
        color: var(--color-text, #09090c);
      }

      .panel-header a {
        text-decoration: none;
        color: var(--color-text, #09090c);
        font-weight: 900;
        font-size: 0.85rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        border-bottom: 2px solid #ff1744;
        padding-bottom: 2px;
        transition: all 0.2s ease;
      }

      .panel-header a:hover {
        color: #ff1744;
      }

      .card {
        background: var(--bg-surface, #faf8f4);
        border: 1px solid var(--border-subtle, #e7e2d9);
        border-radius: 14px;
        padding: 1.25rem;
        display: flex;
        flex-direction: column;
        gap: 1rem;
        transition: all 0.2s ease;
      }

      .card:hover {
        background: var(--bg-card, #ffffff);
        border-color: #ff1744;
        transform: translateY(-2px);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
      }

      .card-top,
      .card-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 1rem;
      }

      .tag {
        background: #eee9e0;
        color: #232220;
        border: 1px solid #ded8cd;
        border-radius: 6px;
        padding: 0.25rem 0.6rem;
        font-size: 0.72rem;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .tag.alt {
        background: rgba(255, 23, 68, 0.12);
        color: #ff1744;
        border: 1px solid rgba(255, 23, 68, 0.35);
      }

      .status {
        border-radius: 6px;
        padding: 0.25rem 0.6rem;
        font-size: 0.7rem;
        font-weight: 900;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        border: 1px solid transparent;
      }

      .status-task.oberta {
        background: rgba(255, 23, 68, 0.12);
        color: #ff1744;
        border-color: rgba(255, 23, 68, 0.35);
      }

      .status-task.en-curs {
        background: #fef3c7;
        color: #92400e;
        border-color: #fde68a;
      }

      .status-task.finalitzada {
        background: #e2e8f0;
        color: #475569;
        border-color: #cbd5e1;
      }

      .status-offer.pendent {
        background: #fef3c7;
        color: #92400e;
        border-color: #fde68a;
      }

      .status-offer.acceptada {
        background: rgba(255, 23, 68, 0.12);
        color: #ff1744;
        border-color: rgba(255, 23, 68, 0.35);
      }

      .status-offer.rebutjada {
        background: #fee2e2;
        color: #991b1b;
        border-color: #fecaca;
      }

      h3 {
        margin: 0;
        font-size: 1.15rem;
        font-weight: 800;
        color: var(--color-text, #09090c);
      }

      p {
        margin: 0;
        color: var(--color-text-muted, #4c4b45);
        font-size: 0.92rem;
        font-weight: 600;
      }

      .meta {
        font-size: 0.85rem;
        color: var(--color-text-dim, #716f67);
        font-weight: 700;
      }

      .card-footer span {
        font-weight: 900;
        color: var(--color-text, #09090c);
        font-size: 0.95rem;
      }

      .actions {
        display: flex;
        gap: 0.5rem;
      }

      .card-footer button {
        background: #09090c;
        color: #f7f3ed;
        font-weight: 900;
        font-size: 0.82rem;
        padding: 0.55rem 1rem;
        border-radius: 6px;
        border: none;
        cursor: pointer;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        transition: all 0.2s ease;
      }

      .card-footer button:hover {
        background: #ff1744;
        color: #ffffff;
        box-shadow: 0 0 14px rgba(255, 23, 68, 0.4);
      }

      .card-footer .btn-secondary {
        background: #eee9e0 !important;
        color: #09090c !important;
        border: 1px solid #ded8cd !important;
      }

      .card-footer .btn-secondary:hover {
        border-color: #09090c !important;
        background: #e3ded4 !important;
      }

      .offer-card button {
        background: #ff1744;
        color: #ffffff;
        font-weight: 900;
      }

      .offer-card button:hover {
        background: #09090c;
        color: #ff1744;
      }

      .notice-banner {
        background: #ffffff;
        border: 1px solid rgba(255, 23, 68, 0.4);
        border-left: 4px solid #ff1744;
        color: #09090c;
        padding: 0.9rem 1.25rem;
        border-radius: 10px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-weight: 700;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.04);
      }

      .btn-dismiss {
        background: transparent !important;
        border: none !important;
        color: #716f67 !important;
        cursor: pointer;
        font-size: 1.1rem;
        padding: 0 !important;
      }

      .btn-dismiss:hover {
        color: #09090c !important;
      }

      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(-4px); }
        to { opacity: 1; transform: translateY(0); }
      }

      /* ============================================================== */
      /* VISTA PRÈVIA DE TASQUES I BADGES                               */
      /* ============================================================== */
      .panel-title-wrap {
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }

      .preview-badge {
        font-size: 0.68rem;
        font-weight: 900;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        background: rgba(255, 23, 68, 0.12);
        color: #ff1744;
        border: 1px solid rgba(255, 23, 68, 0.35);
        padding: 0.2rem 0.55rem;
        border-radius: 9999px;
      }

      .preview-toggle-wrap {
        margin-top: 0.5rem;
        text-align: center;
      }

      .btn-preview-toggle {
        width: 100%;
        background: var(--bg-card, #ffffff);
        border: 1px dashed var(--border-subtle, #d5cfc4);
        color: var(--color-text, #09090c);
        padding: 0.75rem 1rem;
        border-radius: 10px;
        font-weight: 800;
        font-size: 0.86rem;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .btn-preview-toggle:hover {
        background: var(--bg-surface, #fdfcf9);
        border-color: #ff1744;
        color: #ff1744;
      }

      /* ============================================================== */
      /* SECCIÓ 1: QUÈ ÉS AVISA I PER A QUÈ SERVEIX (SEO)                */
      /* ============================================================== */
      .seo-feature-section {
        background: #ffffff;
        border: 1px solid #e5e0d7;
        border-radius: 20px;
        padding: 3rem 2.5rem;
        box-shadow: 0 4px 24px rgba(0, 0, 0, 0.04);
        margin-top: 1rem;
      }

      .section-badge-tag {
        display: inline-block;
        font-size: 0.75rem;
        font-weight: 900;
        text-transform: uppercase;
        letter-spacing: 0.14em;
        color: #ff1744;
        margin-bottom: 0.6rem;
      }

      .seo-section-title {
        font-size: clamp(1.8rem, 3.5vw, 2.4rem);
        font-weight: 900;
        color: #09090c;
        margin: 0 0 1rem;
        line-height: 1.2;
        letter-spacing: -0.02em;
      }

      .seo-section-intro {
        font-size: 1.05rem;
        line-height: 1.65;
        color: #55534c;
        max-width: 900px;
        margin: 0 0 2.5rem;
      }

      .feature-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1.8rem;
      }

      .feature-card {
        background: #faf8f4;
        border: 1px solid #e7e2d9;
        border-radius: 14px;
        padding: 1.8rem 1.5rem;
        transition: all 0.25s ease;
      }

      .feature-card:hover {
        background: #ffffff;
        border-color: #ff1744;
        transform: translateY(-3px);
        box-shadow: 0 10px 28px rgba(0, 0, 0, 0.07);
      }

      .feature-icon {
        width: 52px;
        height: 52px;
        border-radius: 12px;
        background: rgba(255, 23, 68, 0.1);
        color: #ff1744;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 1.2rem;
      }

      .feature-card h3 {
        margin: 0 0 0.6rem;
        font-size: 1.15rem;
        font-weight: 900;
        color: #09090c;
      }

      .feature-card p {
        margin: 0;
        font-size: 0.92rem;
        line-height: 1.55;
        color: #605e56;
      }

      /* ============================================================== */
      /* SECCIÓ 2: BANNER SINCRONITZACIÓ AMB L'APP MÒBIL                */
      /* ============================================================== */
      .app-sync-banner {
        background: #0c0c11;
        border: 1px solid #1f1f2c;
        border-radius: 20px;
        padding: 3rem 2.8rem;
        color: #f7f3ed;
        position: relative;
        overflow: hidden;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.35);
      }

      .app-sync-banner::before {
        content: '';
        position: absolute;
        top: -40px;
        right: -40px;
        width: 220px;
        height: 220px;
        background: radial-gradient(circle, rgba(255, 23, 68, 0.28) 0%, transparent 70%);
        pointer-events: none;
      }

      .sync-tag {
        font-size: 0.72rem;
        font-weight: 900;
        letter-spacing: 0.12em;
        color: #ff1744;
        background: rgba(255, 23, 68, 0.14);
        border: 1px solid rgba(255, 23, 68, 0.35);
        padding: 0.25rem 0.65rem;
        border-radius: 9999px;
        display: inline-block;
        margin-bottom: 0.8rem;
      }

      .app-sync-content h2 {
        font-size: clamp(1.6rem, 3.2vw, 2.2rem);
        font-weight: 900;
        margin: 0 0 0.8rem;
        color: #f7f3ed;
      }

      .app-sync-content p {
        font-size: 1rem;
        line-height: 1.6;
        color: #bab8ae;
        max-width: 780px;
        margin: 0 0 1.8rem;
      }

      .sync-highlights {
        display: flex;
        flex-direction: column;
        gap: 0.85rem;
        margin-bottom: 2.2rem;
      }

      .highlight-item {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        font-size: 0.95rem;
        font-weight: 700;
        color: #f5f4ef;
      }

      .highlight-item svg {
        color: #ff1744;
        flex-shrink: 0;
      }

      .sync-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 1rem;
      }

      .btn-sync-action {
        background: #ff1744;
        color: #ffffff;
        border: 1px solid #ff1744;
        padding: 0.8rem 1.6rem;
        border-radius: 8px;
        font-weight: 900;
        font-size: 0.92rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        cursor: pointer;
        box-shadow: 0 0 16px rgba(255, 23, 68, 0.4);
        transition: all 0.2s ease;
      }

      .btn-sync-action:hover {
        background: #ffffff;
        color: #0c0c11;
        border-color: #ffffff;
        transform: translateY(-2px);
      }

      .btn-sync-secondary {
        background: #151520;
        color: #f5f4ef;
        border: 1px solid #2f2f42;
        padding: 0.8rem 1.5rem;
        border-radius: 8px;
        font-weight: 800;
        font-size: 0.92rem;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .btn-sync-secondary:hover {
        background: rgba(255, 23, 68, 0.12);
        border-color: #ff1744;
        color: #ff1744;
      }

      .btn-sync-pwa {
        background: rgba(255, 23, 68, 0.12);
        color: #ff5252;
        border: 1px solid rgba(255, 23, 68, 0.4);
        padding: 0.8rem 1.5rem;
        border-radius: 8px;
        font-weight: 800;
        font-size: 0.92rem;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        transition: all 0.2s ease;
      }

      .btn-sync-pwa:hover {
        background: #ff1744;
        color: #ffffff;
        border-color: #ff1744;
        transform: translateY(-2px);
        box-shadow: 0 4px 14px rgba(255, 23, 68, 0.4);
      }

      /* ============================================================== */
      /* SECCIÓ 3: ROLES BENEFICIS                                      */
      /* ============================================================== */
      .roles-showcase-section {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 2rem;
      }

      .role-box {
        background: #ffffff;
        border: 1px solid #e5e0d7;
        border-radius: 18px;
        padding: 2.2rem 2rem;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
        transition: all 0.25s ease;
      }

      .role-box:hover {
        border-color: #ff1744;
        transform: translateY(-3px);
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
      }

      .role-badge {
        font-size: 0.72rem;
        font-weight: 900;
        letter-spacing: 0.1em;
        padding: 0.25rem 0.6rem;
        border-radius: 6px;
        display: inline-block;
        margin-bottom: 0.8rem;
      }

      .client-badge {
        background: #eeeae0;
        color: #2b2a26;
        border: 1px solid #d9d3c5;
      }

      .pro-badge {
        background: rgba(255, 23, 68, 0.12);
        color: #ff1744;
        border: 1px solid rgba(255, 23, 68, 0.35);
      }

      .role-box-header h3 {
        font-size: 1.35rem;
        font-weight: 900;
        color: #09090c;
        margin: 0 0 0.5rem;
      }

      .role-box-header p {
        font-size: 0.95rem;
        color: #65635b;
        margin: 0 0 1.5rem;
        line-height: 1.5;
      }

      .role-benefits-list {
        list-style: none;
        padding: 0;
        margin: 0 0 2rem;
        display: flex;
        flex-direction: column;
        gap: 0.85rem;
      }

      .role-benefits-list li {
        display: flex;
        align-items: flex-start;
        gap: 0.75rem;
        font-size: 0.92rem;
        color: #3b3a36;
        line-height: 1.45;
        font-weight: 600;
      }

      .role-benefits-list svg {
        color: #ff1744;
        flex-shrink: 0;
        margin-top: 2px;
      }

      .btn-role-action {
        width: 100%;
        background: #09090c;
        color: #ffffff;
        border: none;
        padding: 0.85rem 1.4rem;
        border-radius: 8px;
        font-weight: 900;
        font-size: 0.92rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .btn-role-action:hover {
        background: #ff1744;
        color: #ffffff;
        box-shadow: 0 4px 16px rgba(255, 23, 68, 0.35);
      }

      .pro-btn {
        background: #ff1744;
      }

      .pro-btn:hover {
        background: #09090c;
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
      }

      .pro-role-actions {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        width: 100%;
        margin-top: 0.5rem;
      }

      .btn-community-link {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        padding: 0.75rem 1rem;
        border-radius: 8px;
        background: #f1ede4;
        border: 1px solid #dfd8cc;
        color: #ff1744;
        font-weight: 700;
        font-size: 0.88rem;
        text-decoration: none;
        transition: all 0.2s ease;
      }

      .btn-community-link:hover {
        background: #09090c;
        border-color: #09090c;
        color: #ffffff;
        transform: translateY(-2px);
      }

      /* ============================================================== */
      /* SECCIÓ 4: BLOG SEO I GUIA D'EXPERTS                            */
      /* ============================================================== */
      .blog-seo-section {
        margin-top: 1rem;
      }

      .blog-header-group {
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        gap: 1.5rem;
        flex-wrap: wrap;
      }

      .btn-all-blog-link {
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;
        background: #ffffff;
        color: #ff1744;
        border: 2px solid #ff1744;
        padding: 0.6rem 1.2rem;
        border-radius: 9999px;
        font-weight: 800;
        font-size: 0.88rem;
        text-decoration: none;
        transition: all 0.2s ease;
        white-space: nowrap;
      }

      .btn-all-blog-link:hover {
        background: #ff1744;
        color: #ffffff;
        transform: translateY(-2px);
        box-shadow: 0 4px 14px rgba(255, 23, 68, 0.3);
      }

      .blog-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1.8rem;
        margin-top: 1.8rem;
      }

      .blog-card {
        background: #ffffff;
        border: 1px solid #e5e0d7;
        border-radius: 16px;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
        transition: all 0.25s ease;
      }

      .blog-card:hover {
        border-color: #ff1744;
        transform: translateY(-4px);
        box-shadow: 0 12px 32px rgba(0, 0, 0, 0.09);
      }

      .blog-card-media {
        position: relative;
        height: 190px;
        overflow: hidden;
      }

      .blog-card-media img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.35s ease;
      }

      .blog-card:hover .blog-card-media img {
        transform: scale(1.05);
      }

      .blog-category-tag {
        position: absolute;
        top: 1rem;
        left: 1rem;
        background: #09090c;
        color: #f7f3ed;
        font-size: 0.7rem;
        font-weight: 900;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        padding: 0.25rem 0.6rem;
        border-radius: 4px;
        border: 1px solid rgba(255, 23, 68, 0.4);
      }

      .blog-card-content {
        padding: 1.5rem;
        display: flex;
        flex-direction: column;
        flex: 1;
      }

      .blog-meta {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.78rem;
        color: #8c897f;
        font-weight: 700;
        margin-bottom: 0.6rem;
      }

      .blog-card-content h3 {
        margin: 0 0 0.75rem;
        font-size: 1.12rem;
        font-weight: 900;
        color: #09090c;
        line-height: 1.35;
      }

      .blog-card-content p {
        margin: 0 0 1.5rem;
        font-size: 0.9rem;
        color: #605d54;
        line-height: 1.55;
        flex: 1;
      }

      .btn-read-article {
        background: transparent;
        border: none;
        color: #ff1744;
        font-weight: 900;
        font-size: 0.88rem;
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .btn-read-article:hover {
        color: #09090c;
        transform: translateX(4px);
      }

      /* ============================================================== */
      /* SECCIÓ 5: BANNER DE PROPAGANDA / CTA                           */
      /* ============================================================== */
      .cta-propaganda-banner {
        background: linear-gradient(135deg, #09090c 0%, #15151e 100%);
        border: 1px solid #ff1744;
        border-radius: 20px;
        padding: 3.5rem 2.5rem;
        text-align: center;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5), inset 0 0 20px rgba(255, 23, 68, 0.15);
        margin: 1.5rem 0 2rem;
      }

      .cta-tag {
        font-size: 0.75rem;
        font-weight: 900;
        letter-spacing: 0.14em;
        text-transform: uppercase;
        color: #ff1744;
        display: inline-block;
        margin-bottom: 0.8rem;
      }

      .cta-banner-content h2 {
        font-size: clamp(1.8rem, 3.8vw, 2.6rem);
        font-weight: 900;
        color: #f7f3ed;
        margin: 0 auto 1rem;
        max-width: 800px;
        line-height: 1.25;
      }

      .cta-banner-content p {
        font-size: 1.05rem;
        color: #bab7ad;
        max-width: 650px;
        margin: 0 auto 2.2rem;
        line-height: 1.6;
      }

      .cta-buttons-row {
        display: flex;
        justify-content: center;
        flex-wrap: wrap;
        gap: 1.2rem;
      }

      .btn-cta-main {
        background: #ff1744;
        color: #ffffff;
        border: 1px solid #ff1744;
        padding: 0.95rem 2rem;
        border-radius: 8px;
        font-weight: 900;
        font-size: 0.95rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        cursor: pointer;
        box-shadow: 0 0 20px rgba(255, 23, 68, 0.5);
        transition: all 0.2s ease;
      }

      .btn-cta-main:hover {
        background: #ffffff;
        color: #09090c;
        border-color: #ffffff;
        transform: translateY(-2px);
      }

      .btn-cta-secondary {
        background: #161622;
        color: #f7f3ed;
        border: 1px solid #333348;
        padding: 0.95rem 1.8rem;
        border-radius: 8px;
        font-weight: 800;
        font-size: 0.95rem;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .btn-cta-secondary:hover {
        background: rgba(255, 23, 68, 0.15);
        border-color: #ff1744;
        color: #ff1744;
        transform: translateY(-2px);
      }

      /* ============================================================== */
      /* SECCIÓ 6: FOOTER INSTITUCIONAL SEO                             */
      /* ============================================================== */
      .main-footer {
        background: #0b0b0f;
        border-top: 1px solid #1c1c28;
        border-radius: 20px;
        padding: 3.5rem 2.5rem 2rem;
        color: #f7f3ed;
        margin-top: 1rem;
      }

      .footer-grid {
        display: grid;
        grid-template-columns: 1.8fr 1fr 1fr 1fr;
        gap: 2.5rem;
        margin-bottom: 3rem;
      }

      .footer-brand {
        display: flex;
        align-items: center;
        gap: 0.65rem;
        margin-bottom: 1rem;
      }

      .footer-badge {
        background: #ff1744;
        color: #ffffff;
        font-weight: 900;
        font-size: 0.85rem;
        padding: 0.25rem 0.55rem;
        border-radius: 6px;
      }

      .footer-logo-text {
        font-family: var(--font-title, 'Boldonse', 'Climate Crisis', sans-serif);
        font-size: 1.35rem;
        font-weight: 900;
        letter-spacing: 0.1em;
        color: #f5f4ef;
      }

      .footer-desc {
        font-size: 0.88rem;
        line-height: 1.6;
        color: #8c897f;
        margin: 0 0 1.2rem;
      }

      .footer-status-pill {
        display: inline-block;
        font-size: 0.72rem;
        font-weight: 900;
        color: #00e676;
        background: rgba(0, 230, 118, 0.1);
        border: 1px solid rgba(0, 230, 118, 0.3);
        padding: 0.25rem 0.65rem;
        border-radius: 9999px;
      }

      .footer-col h4 {
        margin: 0 0 1.2rem;
        font-size: 0.95rem;
        font-weight: 900;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: #f5f4ef;
      }

      .footer-col ul {
        list-style: none;
        padding: 0;
        margin: 0;
        display: flex;
        flex-direction: column;
        gap: 0.65rem;
      }

      .footer-col li span,
      .footer-col li a {
        font-size: 0.88rem;
        color: #8c897f;
        text-decoration: none;
        transition: color 0.2s ease;
      }

      .footer-col li a:hover {
        color: #ff1744;
      }

      .footer-bottom {
        border-top: 1px solid #1c1c28;
        padding-top: 1.8rem;
        text-align: center;
      }

      .footer-bottom p {
        margin: 0;
        font-size: 0.82rem;
        color: #65635a;
      }

      /* ============================================================== */
      /* MODAL DE LECTURA D'ARTICLES DE BLOG                            */
      /* ============================================================== */
      .article-modal-backdrop {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.78);
        z-index: 300;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 1.5rem;
        backdrop-filter: blur(6px);
      }

      .article-modal-card {
        background: #ffffff;
        border-radius: 18px;
        max-width: 720px;
        width: 100%;
        max-height: 88vh;
        overflow-y: auto;
        padding: 2.2rem;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
        border: 1px solid #e2ddd3;
        animation: fadeIn 0.25s ease;
      }

      .article-modal-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 1.5rem;
        margin-bottom: 1.5rem;
        border-bottom: 1px solid #eeeae0;
        padding-bottom: 1.2rem;
      }

      .modal-category-tag {
        font-size: 0.72rem;
        font-weight: 900;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: #ff1744;
        background: rgba(255, 23, 68, 0.1);
        padding: 0.2rem 0.55rem;
        border-radius: 4px;
        display: inline-block;
        margin-bottom: 0.5rem;
      }

      .article-modal-header h2 {
        margin: 0 0 0.5rem;
        font-size: 1.45rem;
        font-weight: 900;
        color: #09090c;
        line-height: 1.3;
      }

      .modal-meta {
        font-size: 0.82rem;
        color: #8c897f;
        display: flex;
        gap: 0.5rem;
      }

      .btn-close-modal {
        background: #f0ece3;
        border: 1px solid #ded8cd;
        border-radius: 8px;
        width: 36px;
        height: 36px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        color: #09090c;
        transition: all 0.2s ease;
      }

      .btn-close-modal:hover {
        background: #ff1744;
        color: #ffffff;
        border-color: #ff1744;
      }

      .article-modal-img {
        width: 100%;
        height: 280px;
        object-fit: cover;
        border-radius: 12px;
        margin-bottom: 1.5rem;
      }

      .article-full-text p {
        font-size: 0.98rem;
        line-height: 1.7;
        color: #403e38;
        margin: 0 0 1.2rem;
      }

      .article-modal-footer {
        display: flex;
        justify-content: flex-end;
        gap: 1rem;
        border-top: 1px solid #eeeae0;
        padding-top: 1.5rem;
        margin-top: 1.5rem;
      }

      .btn-modal-action {
        background: #ff1744;
        color: #ffffff;
        border: none;
        padding: 0.75rem 1.4rem;
        border-radius: 8px;
        font-weight: 900;
        font-size: 0.9rem;
        cursor: pointer;
      }

      .btn-modal-action:hover {
        background: #09090c;
      }

      .btn-modal-close {
        background: #f0ece3;
        color: #3b3933;
        border: 1px solid #ddd7cc;
        padding: 0.75rem 1.4rem;
        border-radius: 8px;
        font-weight: 800;
        font-size: 0.9rem;
        cursor: pointer;
      }

      @media (max-width: 900px) {
        .columns {
          grid-template-columns: 1fr;
        }
        .stats {
          grid-template-columns: 1fr;
        }
        .feature-grid,
        .roles-showcase-section,
        .blog-grid,
        .reviews-home-grid,
        .footer-grid {
          grid-template-columns: 1fr !important;
        }

        .reviews-feature-section {
          padding: 2.25rem 1rem !important;
        }

        .reviews-home-grid {
          grid-template-columns: 1fr !important;
          gap: 1rem;
        }

        .cta-buttons-row,
        .sync-actions {
          flex-direction: column;
        }
      }

      @media (max-width: 640px) {
        .fullscreen-cover {
          height: 100vh;
          min-height: 100vh;
          padding: 1.5rem 1rem;
        }
        .hero-brand {
          font-size: clamp(2.3rem, 11vw, 3.6rem);
          letter-spacing: 0.06em;
        }
        .hero-slogan {
          font-size: 0.92rem;
          letter-spacing: 0.08em;
          margin-top: 0.75rem;
        }
        .dashboard-body {
          padding: 1rem 0.65rem 3.5rem;
          gap: 1.25rem;
        }
        .dashboard-welcome-banner {
          padding: 1.25rem 1rem;
          border-radius: 14px;
        }
        .welcome-title {
          font-size: 1.35rem;
        }
        .welcome-subtitle {
          font-size: 0.9rem;
        }
        .welcome-banner-actions {
          flex-direction: column;
          align-items: stretch;
          gap: 0.55rem;
        }
        .btn-welcome-primary,
        .btn-welcome-secondary {
          justify-content: center;
          width: 100%;
          box-sizing: border-box;
        }
        .dashboard-header-bar {
          flex-direction: column;
          align-items: stretch;
          padding: 1.1rem 0.85rem;
          gap: 0.85rem;
          text-align: center;
        }
        .dashboard-title {
          font-size: 1.45rem;
        }
        .btn-create-task {
          width: 100%;
          text-align: center;
          font-size: 0.88rem;
          padding: 0.75rem 1rem;
        }
        .panel {
          padding: 1.15rem 0.85rem;
          border-radius: 14px;
        }
        .panel-header {
          flex-direction: column;
          align-items: flex-start;
          gap: 0.5rem;
        }
        .panel-header h2 {
          font-size: 1.2rem;
        }
        .card {
          padding: 1rem 0.85rem;
          border-radius: 12px;
        }
        .card-top {
          flex-wrap: wrap;
          gap: 0.5rem;
        }
        .card-footer {
          flex-direction: column;
          align-items: stretch;
          gap: 0.75rem;
        }
        .actions {
          width: 100%;
          flex-direction: column;
          gap: 0.5rem;
        }
        .actions button {
          width: 100%;
        }
        .seo-section-title {
          font-size: 1.45rem !important;
        }
        .feature-card {
          padding: 1.25rem 1rem;
        }
        .role-box {
          padding: 1.5rem 1rem;
          border-radius: 14px;
        }
        .role-box h3 {
          font-size: 1.25rem;
        }
        .app-sync-banner {
          padding: 1.75rem 1.15rem;
          border-radius: 14px;
        }
        .app-sync-banner h2 {
          font-size: 1.45rem;
        }
        .cta-propaganda-banner {
          padding: 2rem 1.15rem;
          border-radius: 14px;
        }
        .cta-propaganda-banner h2 {
          font-size: 1.45rem;
        }
        .main-footer {
          padding: 2.25rem 1.15rem 1.5rem;
        }
      }

      .pro-preview-rating {
        display: flex;
        align-items: center;
        gap: 0.4rem;
        margin: 0.2rem 0 0.5rem;
        font-size: 0.84rem;
      }
      .pro-preview-rating .stars-gold {
        color: #f59e0b;
        font-weight: 700;
      }
      .pro-preview-rating .reviews-count {
        color: #59606d;
        font-size: 0.78rem;
      }

      .user-inline-link {
        color: inherit;
        text-decoration: underline;
        text-decoration-color: rgba(220, 38, 38, 0.45);
        text-underline-offset: 3px;
        transition: color 0.15s ease, text-decoration-color 0.15s ease;
        cursor: pointer;
      }
      .user-inline-link:hover {
        color: #dc2626 !important;
        text-decoration-color: #dc2626;
      }
      .pro-title-link {
        color: #111827;
        text-decoration: none;
      }
      .pro-title-link:hover {
        color: #dc2626 !important;
        text-decoration: underline;
      }

      /* Reviews Section Home */
      .reviews-feature-section {
        background: #fdfbf7;
        border-top: 1px solid #eae5dc;
        border-bottom: 1px solid #eae5dc;
        padding: 4.5rem 1.5rem !important;
      }
      .reviews-home-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(min(100%, 300px), 1fr));
        gap: 1.5rem;
        margin-top: 2rem;
      }
      .review-home-card {
        background: #ffffff;
        border: 1px solid #e5e0d7;
        border-radius: 14px;
        padding: 1.5rem;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.03);
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        transition: transform 0.2s ease, box-shadow 0.2s ease;
      }
      .review-home-card:hover {
        transform: translateY(-3px);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
      }
      .review-stars-row {
        display: flex;
        align-items: center;
        gap: 0.25rem;
        margin-bottom: 0.85rem;
      }
      .star-gold {
        color: #f59e0b;
        font-size: 1.1rem;
      }
      .rating-badge-small {
        font-size: 0.8rem;
        font-weight: 700;
        color: #4b5563;
        margin-left: 0.4rem;
        background: #fef3c7;
        padding: 0.15rem 0.45rem;
        border-radius: 6px;
      }
      .review-home-comment {
        font-size: 0.92rem;
        line-height: 1.55;
        color: #374151;
        font-style: italic;
        margin: 0 0 1.25rem;
        flex: 1;
      }
      .review-home-footer {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding-top: 0.85rem;
        border-top: 1px solid #f3f4f6;
      }
      .review-client-icon {
        width: 34px;
        height: 34px;
        border-radius: 50%;
        background: #ffe4e6;
        color: #e11d48;
        font-weight: 800;
        font-size: 0.85rem;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .review-client-meta {
        display: flex;
        flex-direction: column;
      }
      .client-name-bold {
        font-size: 0.88rem;
        color: #111827;
      }
      .pro-assigned-note {
        font-size: 0.76rem;
        color: #59606d;
      }
      .pro-assigned-note strong {
        color: #1f2937;
      }

      /* Quick contact buttons on card & modal */
      .card-offer-actions {
        display: flex;
        gap: 0.4rem;
        align-items: center;
        flex-wrap: wrap;
      }
      .btn-quick-contact {
        display: inline-flex;
        align-items: center;
        gap: 0.35rem;
        padding: 0.45rem 0.75rem;
        border-radius: 8px;
        font-size: 0.8rem;
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

      /* Modal Contact Dialog */
      .modal-backdrop {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(9, 9, 12, 0.65);
        backdrop-filter: blur(4px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        padding: 1rem;
        box-sizing: border-box;
      }
      .modal-dialog {
        background: #ffffff;
        border-radius: 18px;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
        max-height: 88vh;
        display: flex;
        flex-direction: column;
        overflow: hidden;
      }
      .modal-peticio-exit-dialog {
        width: 100%;
        max-width: 540px;
        border-radius: 20px;
        overflow: hidden;
      }
      .exit-modal-header {
        background: linear-gradient(135deg, #09090c 0%, #1a1a24 100%);
        color: #ffffff;
        padding: 1.5rem;
        display: flex;
        align-items: flex-start;
        gap: 1rem;
        position: relative;
        border-bottom: 2px solid var(--neon, #ff1744);
      }
      .exit-success-circle {
        width: 50px;
        height: 50px;
        min-width: 50px;
        border-radius: 50%;
        background: #10b981;
        color: #ffffff;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 0 16px rgba(16, 185, 129, 0.4);
      }
      .exit-header-titles {
        flex: 1;
      }
      .exit-header-titles h2 {
        margin: 0;
        font-size: 1.35rem;
        font-weight: 900;
        color: #ffffff;
        letter-spacing: -0.02em;
      }
      .exit-modal-sub {
        margin: 0.35rem 0 0;
        font-size: 0.85rem;
        color: #d1d5db;
        line-height: 1.45;
      }
      .exit-modal-body {
        padding: 1.5rem;
        background: #ffffff;
      }
      .exit-offer-summary {
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        padding: 1rem 1.15rem;
        margin-bottom: 1.5rem;
      }
      .exit-offer-badge {
        display: inline-block;
        font-size: 0.72rem;
        font-weight: 800;
        text-transform: uppercase;
        color: #059669;
        background: #ecfdf5;
        border: 1px solid #a7f3d0;
        padding: 0.15rem 0.5rem;
        border-radius: 9999px;
        margin-bottom: 0.4rem;
        letter-spacing: 0.04em;
      }
      .exit-offer-title {
        margin: 0 0 0.5rem;
        font-size: 1.1rem;
        font-weight: 800;
        color: #0f172a;
      }
      .exit-offer-meta {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.75rem;
        flex-wrap: wrap;
        font-size: 0.9rem;
        color: #475569;
      }
      .exit-price-pill {
        font-size: 1.15rem;
        font-weight: 900;
        color: #ff1744;
      }
      .exit-contact-section {
        margin-top: 0.5rem;
      }
      .exit-contact-intro {
        margin: 0 0 0.85rem;
        font-size: 0.92rem;
        font-weight: 700;
        color: #1e293b;
      }
      .exit-contact-buttons {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }
      .exit-channel-btn {
        display: flex;
        align-items: center;
        gap: 0.9rem;
        padding: 0.85rem 1.1rem;
        border-radius: 12px;
        border: 1px solid transparent;
        cursor: pointer;
        width: 100%;
        text-align: left;
        transition: all 0.2s ease;
      }
      .exit-channel-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
      }
      .exit-channel-wa {
        background: #f0fdf4;
        border-color: #86efac;
      }
      .exit-channel-wa:hover {
        border-color: #22c55e;
        background: #dcfce7;
      }
      .exit-channel-email {
        background: #eff6ff;
        border-color: #93c5fd;
      }
      .exit-channel-email:hover {
        border-color: #3b82f6;
        background: #dbeafe;
      }
      .exit-channel-icon {
        width: 40px;
        height: 40px;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }
      .wa-bg {
        background: #25D366;
        color: #ffffff;
      }
      .email-bg {
        background: #2563eb;
        color: #ffffff;
      }
      .exit-channel-info {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 0.15rem;
      }
      .exit-channel-title {
        font-size: 0.95rem;
        font-weight: 800;
        color: #0f172a;
      }
      .exit-channel-sub {
        font-size: 0.8rem;
        color: #64748b;
        font-weight: 600;
      }
      .exit-channel-arrow {
        color: #94a3b8;
        flex-shrink: 0;
      }
      .exit-modal-footer {
        padding: 1rem 1.5rem;
        background: #f8fafc;
        border-top: 1px solid #e2e8f0;
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 0.75rem;
      }
      .btn-exit-close {
        padding: 0.6rem 1.15rem;
        background: #ffffff;
        color: #475569;
        border: 1px solid #cbd5e1;
        border-radius: 8px;
        font-weight: 700;
        font-size: 0.88rem;
        cursor: pointer;
        transition: all 0.2s;
      }
      .btn-exit-close:hover {
        background: #f1f5f9;
        color: #0f172a;
      }
      .btn-exit-view-task {
        padding: 0.6rem 1.25rem;
        background: #09090c;
        color: #ffffff;
        border: none;
        border-radius: 8px;
        font-weight: 800;
        font-size: 0.88rem;
        cursor: pointer;
        transition: all 0.2s;
      }
      .btn-exit-view-task:hover {
        background: var(--neon, #ff1744);
      }
      .modal-footer {
        padding: 0.85rem 1.5rem;
        border-top: 1px solid #e5e7eb;
        background: #fafafa;
        display: flex;
        justify-content: flex-end;
      }
      .btn-primary-close {
        background: #111827;
        color: #ffffff;
        border: none;
        padding: 0.5rem 1.2rem;
        border-radius: 8px;
        font-size: 0.88rem;
        font-weight: 600;
        cursor: pointer;
      }
      .btn-primary-close:hover {
        background: #2563eb;
      }

      /* ============================================================== */
      /* CARRUSEL ESTIL TWITCH DE PROFESSIONALS DE CONFIANÇA RECOMANATS */
      /* ============================================================== */
      .twitch-carousel-section {
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: 1.25rem;
        box-sizing: border-box;
        margin: 1rem 0 2rem 0;
      }

      .twitch-carousel-header {
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        gap: 1rem;
        padding: 0 0.25rem;
      }

      .twitch-carousel-title-group {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
      }

      .carousel-eyebrow {
        font-size: 0.75rem;
        font-weight: 900;
        text-transform: uppercase;
        letter-spacing: 0.12em;
        color: #059669;
      }

      .carousel-title {
        margin: 0;
        font-size: 1.6rem;
        font-weight: 800;
        color: #0f172a;
        letter-spacing: -0.02em;
      }

      .carousel-subtitle {
        margin: 0;
        font-size: 0.92rem;
        color: #64748b;
      }

      .carousel-live-indicator {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        padding: 0.35rem 0.8rem;
        border-radius: 9999px;
        font-size: 0.75rem;
        font-weight: 700;
        color: #475569;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
      }

      .live-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #10b981;
        box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2);
        animation: pulseLive 2s infinite ease-in-out;
      }

      .live-dot.paused {
        background: #f59e0b;
        box-shadow: 0 0 0 2px rgba(245, 158, 11, 0.2);
        animation: none;
      }

      @keyframes pulseLive {
        0%, 100% { transform: scale(1); opacity: 1; }
        50% { transform: scale(1.3); opacity: 0.7; }
      }

      .live-label {
        letter-spacing: 0.03em;
        text-transform: uppercase;
      }

      /* ESCENARI TWITCH */
      .twitch-carousel-stage {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        box-sizing: border-box;
        position: relative;
        perspective: 1000px;
        padding: 0.5rem 0;
        min-height: 396px;
        overflow: hidden;
      }

      /* Les targetes veïnes (anterior i següent) són un 20% més petites (scale 0.8) que la central per a un efecte visual més estètic. */
      .side-preview-card {
        position: absolute;
        top: 50%;
        width: clamp(640px, 72vw, 980px);
        height: 380px;
        border-radius: 20px;
        overflow: hidden;
        cursor: pointer;
        background: #0f172a;
        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.35);
        opacity: 0.82;
        transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        user-select: none;
        z-index: 1;
        border: 1px solid rgba(255, 255, 255, 0.12);
        transform-origin: center center;
      }

      .prev-card {
        left: 50%;
        transform: translateY(-50%) translateX(-92%) scale(0.8);
        -webkit-mask-image: linear-gradient(to right, transparent 0%, rgba(0, 0, 0, 0.45) 30%, #000 66%);
        mask-image: linear-gradient(to right, transparent 0%, rgba(0, 0, 0, 0.45) 30%, #000 66%);
      }

      .next-card {
        right: 50%;
        transform: translateY(-50%) translateX(92%) scale(0.8);
        -webkit-mask-image: linear-gradient(to left, transparent 0%, rgba(0, 0, 0, 0.45) 30%, #000 66%);
        mask-image: linear-gradient(to left, transparent 0%, rgba(0, 0, 0, 0.45) 30%, #000 66%);
      }

      .twitch-carousel-stage.is-transitioning .main-showcase-card {
        animation: carouselMainEnter 0.48s cubic-bezier(0.16, 1, 0.3, 1) both;
      }

      .twitch-carousel-stage.is-transitioning .prev-card {
        animation: carouselPrevEnter 0.48s cubic-bezier(0.16, 1, 0.3, 1) both;
      }

      .twitch-carousel-stage.is-transitioning .next-card {
        animation: carouselNextEnter 0.48s cubic-bezier(0.16, 1, 0.3, 1) both;
      }

      @keyframes carouselMainEnter {
        from { opacity: 0; transform: translateY(10px) scale(0.975); }
        to { opacity: 1; transform: translateY(0) scale(1); }
      }

      @keyframes carouselPrevEnter {
        from { opacity: 0; transform: translateY(-50%) translateX(-98%) scale(0.76); }
        to { opacity: 0.82; transform: translateY(-50%) translateX(-92%) scale(0.8); }
      }

      @keyframes carouselNextEnter {
        from { opacity: 0; transform: translateY(-50%) translateX(98%) scale(0.76); }
        to { opacity: 0.82; transform: translateY(-50%) translateX(92%) scale(0.8); }
      }

      .prev-card:hover {
        opacity: 1;
        box-shadow: 0 16px 36px -5px rgba(0, 0, 0, 0.45);
        border-color: #ff1744;
        transform: translateY(-50%) translateX(-90%) scale(0.82);
      }

      .next-card:hover {
        opacity: 1;
        box-shadow: 0 16px 36px -5px rgba(0, 0, 0, 0.45);
        border-color: #ff1744;
        transform: translateY(-50%) translateX(90%) scale(0.82);
      }

      .side-card-bg {
        position: absolute;
        inset: 0;
        background-size: cover;
        background-position: center center;
        background-repeat: no-repeat;
        transition: transform 0.4s ease;
      }

      .side-preview-card:hover .side-card-bg {
        transform: scale(1.08);
      }

      .side-card-glass {
        position: absolute;
        inset: 0;
        background: linear-gradient(180deg, rgba(15, 23, 42, 0.25) 0%, rgba(15, 23, 42, 0.92) 100%);
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: center;
        padding: 1.35rem 0.85rem;
        box-sizing: border-box;
      }

      .btn-side-arrow {
        width: 44px;
        height: 44px;
        border-radius: 50%;
        border: 1px solid rgba(255, 255, 255, 0.3);
        background: rgba(15, 23, 42, 0.8);
        backdrop-filter: blur(8px);
        color: #ffffff;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.2s ease;
        box-shadow: 0 4px 14px rgba(0, 0, 0, 0.4);
      }

      .prev-card .btn-side-arrow {
        position: absolute;
        left: 28%;
        top: 1.5rem;
        transform: translateX(-50%);
      }

      .prev-card .btn-side-arrow:hover {
        background: #ff1744;
        border-color: #ff1744;
        transform: translateX(-50%) scale(1.14);
        box-shadow: 0 6px 18px rgba(255, 23, 68, 0.45);
      }

      .next-card .btn-side-arrow {
        position: absolute;
        left: 72%;
        top: 1.5rem;
        transform: translateX(-50%);
      }

      .next-card .btn-side-arrow:hover {
        background: #ff1744;
        border-color: #ff1744;
        transform: translateX(-50%) scale(1.14);
        box-shadow: 0 6px 18px rgba(255, 23, 68, 0.45);
      }

      .side-card-info {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        gap: 0.5rem;
        width: 100%;
      }

      .prev-card .side-card-info {
        position: absolute;
        left: 28%;
        bottom: 1.5rem;
        transform: translateX(-50%);
        width: auto;
        max-width: 200px;
      }

      .next-card .side-card-info {
        position: absolute;
        left: 72%;
        bottom: 1.5rem;
        transform: translateX(-50%);
        width: auto;
        max-width: 200px;
      }

      .side-avatar {
        width: 44px;
        height: 44px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #ffffff;
        font-weight: 900;
        font-size: 1.1rem;
        border: 2px solid rgba(255, 255, 255, 0.3);
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
      }

      .side-meta {
        display: flex;
        flex-direction: column;
        gap: 0.2rem;
        width: 100%;
      }

      .side-pro-name {
        margin: 0;
        font-size: 0.88rem;
        font-weight: 800;
        color: #ffffff;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        text-shadow: 0 1px 3px rgba(0, 0, 0, 0.7);
      }

      .side-pro-spec {
        font-size: 0.72rem;
        font-weight: 700;
        color: #93c5fd;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      /* TARGETA PRINCIPAL EN GRAN (SHOWCASE HERO) */
      .main-showcase-card {
        flex: 0 1 clamp(640px, 72vw, 980px);
        width: clamp(640px, 72vw, 980px);
        max-width: 980px;
        min-height: 380px;
        display: flex;
        background: #0f172a;
        border: 1px solid rgba(255, 255, 255, 0.12);
        border-radius: 24px;
        overflow: hidden;
        color: #ffffff;
        box-shadow: 0 20px 50px -10px rgba(15, 23, 42, 0.55), 0 0 0 1px rgba(255, 255, 255, 0.08);
        z-index: 2;
        transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s ease;
        animation: fadeInScale 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        box-sizing: border-box;
      }

      @keyframes fadeInScale {
        0% { opacity: 0.85; transform: scale(0.97); }
        100% { opacity: 1; transform: scale(1); }
      }

      .main-showcase-card:hover {
        box-shadow: 0 26px 60px -10px rgba(0, 0, 0, 0.65), 0 0 0 1px rgba(255, 23, 68, 0.4);
      }

      /* BANNER ESQUERRE (FOTO + OVERLAY) */
      .showcase-banner {
        flex: 0 0 46%;
        position: relative;
        background-size: cover;
        background-position: center center;
        background-repeat: no-repeat;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        padding: 1.4rem;
        box-sizing: border-box;
        min-height: 280px;
      }

      .banner-gradient-overlay {
        position: absolute;
        inset: 0;
        background: linear-gradient(180deg, rgba(15, 23, 42, 0.2) 0%, rgba(15, 23, 42, 0.85) 100%);
        pointer-events: none;
      }

      .banner-top-chips {
        position: relative;
        z-index: 2;
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
      }

      .chip-verified {
        background: rgba(16, 185, 129, 0.92);
        backdrop-filter: blur(8px);
        color: #ffffff;
        font-size: 0.74rem;
        font-weight: 800;
        padding: 0.25rem 0.65rem;
        border-radius: 9999px;
        display: inline-flex;
        align-items: center;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
        letter-spacing: 0.03em;
        text-transform: uppercase;
      }

      .chip-speciality {
        background: rgba(30, 58, 138, 0.85);
        backdrop-filter: blur(8px);
        color: #93c5fd;
        font-size: 0.74rem;
        font-weight: 700;
        padding: 0.25rem 0.65rem;
        border-radius: 9999px;
        border: 1px solid rgba(147, 197, 253, 0.3);
      }

      .banner-bottom-info {
        position: relative;
        z-index: 2;
      }

      .rating-chip {
        display: inline-flex;
        align-items: center;
        background: rgba(15, 23, 42, 0.88);
        backdrop-filter: blur(8px);
        border: 1px solid rgba(255, 255, 255, 0.15);
        padding: 0.35rem 0.75rem;
        border-radius: 100px;
        font-size: 0.85rem;
        color: #f8fafc;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      }

      .rating-chip strong {
        color: #fbbf24;
        margin-right: 0.35rem;
      }

      .rating-sub {
        font-size: 0.78rem;
        color: #94a3b8;
        margin-left: 0.35rem;
      }

      /* DETALLS DRETS DE LA SHOWCASE */
      .showcase-details {
        flex: 1;
        padding: 1.85rem;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        gap: 1.2rem;
        box-sizing: border-box;
      }

      .pro-header-brand {
        display: flex;
        align-items: center;
        gap: 1rem;
      }

      .brand-logo {
        width: 58px;
        height: 58px;
        border-radius: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        flex-shrink: 0;
        box-shadow: 0 6px 16px rgba(0, 0, 0, 0.3);
        overflow: hidden;
      }

      .pro-isotip-img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        border-radius: inherit;
        display: block;
      }

      .brand-monogram {
        font-size: 1.35rem;
        font-weight: 900;
        color: #ffffff;
      }

      .brand-verified-tick {
        position: absolute;
        bottom: -4px;
        right: -4px;
        width: 20px;
        height: 20px;
        background: #10b981;
        color: #ffffff;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid #0f172a;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
      }

      .brand-text {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
      }

      .showcase-name {
        margin: 0;
        font-size: 1.35rem;
        font-weight: 800;
        color: #ffffff;
        line-height: 1.25;
      }

      .showcase-name-link {
        color: #ffffff;
        text-decoration: none;
        transition: color 0.2s ease;
      }

      .showcase-name-link:hover {
        color: #ff1744;
      }

      .showcase-role {
        font-size: 0.8rem;
        font-weight: 600;
        color: #94a3b8;
      }

      .showcase-bio {
        margin: 0;
        font-size: 0.95rem;
        line-height: 1.55;
        color: #cbd5e1;
        display: -webkit-box;
        -webkit-line-clamp: 4;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }

      .showcase-perks {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
      }

      .perk-badge {
        font-size: 0.75rem;
        font-weight: 700;
        color: #e2e8f0;
        background: rgba(255, 255, 255, 0.06);
        border: 1px solid rgba(255, 255, 255, 0.1);
        padding: 0.25rem 0.6rem;
        border-radius: 8px;
        display: inline-flex;
        align-items: center;
        gap: 0.35rem;
      }

      .showcase-cta-bar {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding-top: 0.5rem;
      }

      .btn-showcase-profile {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        background: #ff1744;
        color: #ffffff;
        font-size: 0.95rem;
        font-weight: 800;
        padding: 0.75rem 1.4rem;
        border-radius: 12px;
        text-decoration: none;
        box-shadow: 0 4px 14px rgba(255, 23, 68, 0.35);
        transition: all 0.2s ease;
      }

      .btn-showcase-profile:hover {
        background: #d50000;
        transform: translateY(-2px);
        box-shadow: 0 8px 20px rgba(255, 23, 68, 0.45);
        color: #ffffff;
      }

      /* DOTS DE PAGINACIÓ (TWITCH STYLE) */
      .twitch-carousel-dots {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        margin-top: 0.5rem;
      }

      .carousel-dot-btn {
        background: transparent;
        border: none;
        padding: 6px 4px;
        cursor: pointer;
        display: flex;
        align-items: center;
      }

      .dot-bar {
        width: 12px;
        height: 6px;
        border-radius: 4px;
        background: #cbd5e1;
        transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        display: block;
      }

      .carousel-dot-btn:hover .dot-bar {
        background: #94a3b8;
      }

      .carousel-dot-btn.active .dot-bar {
        width: 32px;
        background: #ff1744;
        box-shadow: 0 2px 8px rgba(255, 23, 68, 0.35);
      }

      .no-pros-msg {
        padding: 2rem;
        color: #64748b;
        font-size: 0.95rem;
        text-align: center;
        width: 100%;
      }

      /* RESPONSIVE BREAKPOINTS */
      @media (max-width: 992px) {
        .showcase-banner {
          flex: 0 0 42%;
        }

        .showcase-details {
          padding: 1.4rem;
        }
      }

      @media (max-width: 768px) {
        .side-preview-card {
          display: none;
        }

        .main-showcase-card {
          flex-direction: column;
          max-width: 100%;
        }

        .showcase-banner {
          min-height: 220px;
          padding: 1rem;
        }

        .showcase-details {
          padding: 1.25rem;
          gap: 1rem;
        }

        .showcase-name {
          font-size: 1.2rem;
        }

        .carousel-title {
          font-size: 1.25rem;
        }

        .btn-showcase-profile {
          width: 100%;
          justify-content: center;
        }
      }
    `
  ]
})
export class MainComponent implements OnInit, OnDestroy {
  dashboard?: DashboardResponse;
  loading = true;
  error = '';
  noticeMessage = '';
  private routerEventsSub?: Subscription;

  randomPreviewTasks: any[] = [];
  randomPreviewOffers: any[] = [];

  allResenyes: Resenya[] = [];
  ressenyesDestacades: Resenya[] = [];
  allUsuaris: Usuari[] = [];
  modalContacteOferta: any | null = null;
  peticioExitDades: {
    tascaId?: string;
    titol: string;
    professional: string;
    preu: string;
    telefon: string;
    email: string;
  } | null = null;

  @ViewChild('proCarouselTrack') proCarouselTrack?: ElementRef<HTMLDivElement>;

  /** Determina si la ruta actual correspon a la secció exclusiva de l'app mòbil (/app) */
  get isAppPage(): boolean {
    const url = this.router.url || '';
    return url.startsWith('/app');
  }

  /**
   * Retorna la ruta adaptada a l'entorn actiu (/app per a l'aplicació o ruta estàndard per a web)
   */
  getNavUrl(path: string): string {
    if (this.isAppPage) {
      if (path === '/' || path === '/inici' || path === '/app') return '/app';
      if (path.startsWith('/app/')) return path;
      return path.startsWith('/') ? `/app${path}` : `/app/${path}`;
    }
    return path;
  }

  /** Determina si s'ha de mostrar la portada inicial immersiva (fullscreen-cover) amb el lliscador */
  get showFullscreenCover(): boolean {
    const url = this.router.url || '';
    if (url.includes('landing=true')) return true;
    return false;
  }

  /** Llista de professionals oficialment verificats a la plataforma */
  get verifiedProfessionals(): Usuari[] {
    const pros = this.allUsuaris.filter(u => u.rol === 'professional' && u.verificat);
    if (pros.length > 0) return pros;
    return this.allUsuaris.filter(u => u.rol === 'professional');
  }

  /** Index del professional actiu mostrat en gran al carrusel Twitch */
  currentProIndex = 0;
  proCarouselInterval?: any;
  private proTransitionTimeout?: ReturnType<typeof setTimeout>;
  isProCarouselPaused = false;
  isProCarouselTransitioning = false;

  /** Retorna el professional actiu mostrat en gran al centre */
  get currentPro(): Usuari | null {
    const list = this.verifiedProfessionals;
    if (list.length === 0) return null;
    return list[((this.currentProIndex % list.length) + list.length) % list.length];
  }

  /** Retorna el professional anterior per a la previsualització lateral esquerra */
  get prevPro(): Usuari | null {
    const list = this.verifiedProfessionals;
    if (list.length <= 1) return null;
    const prevIdx = (this.currentProIndex - 1 + list.length) % list.length;
    return list[prevIdx];
  }

  /** Retorna el professional següent per a la previsualització lateral dreta */
  get nextPro(): Usuari | null {
    const list = this.verifiedProfessionals;
    if (list.length <= 1) return null;
    const nextIdx = (this.currentProIndex + 1) % list.length;
    return list[nextIdx];
  }

  /** Avança al següent professional (rotació Twitch) */
  goToNextPro(): void {
    const list = this.verifiedProfessionals;
    if (list.length <= 1) return;
    this.seleccionarProfessional((this.currentProIndex + 1) % list.length);
    this.restartProCarouselTimer();
  }

  /** Retrocedeix al professional anterior (rotació Twitch) */
  goToPrevPro(): void {
    const list = this.verifiedProfessionals;
    if (list.length <= 1) return;
    this.seleccionarProfessional((this.currentProIndex - 1 + list.length) % list.length);
    this.restartProCarouselTimer();
  }

  /** Salta directament a un professional determinat pels indicadors de posició */
  goToProIndex(idx: number): void {
    this.seleccionarProfessional(idx);
    this.restartProCarouselTimer();
  }

  /** Actualitza la targeta destacada i reinicia l'animació visual del carrusel. */
  private seleccionarProfessional(idx: number): void {
    this.isProCarouselTransitioning = false;
    if (this.proTransitionTimeout) clearTimeout(this.proTransitionTimeout);
    this.currentProIndex = idx;
    this.proTransitionTimeout = setTimeout(() => {
      this.isProCarouselTransitioning = true;
    });
  }

  /** Inicia el temporitzador de rotació automàtica cada 5 segons */
  startProCarouselTimer(): void {
    this.stopProCarouselTimer();
    this.proCarouselInterval = setInterval(() => {
      if (!this.isProCarouselPaused && this.verifiedProfessionals.length > 1) {
        this.seleccionarProfessional((this.currentProIndex + 1) % this.verifiedProfessionals.length);
      }
    }, 5000);
  }

  /** Atura el temporitzador per evitar fugues de memòria */
  stopProCarouselTimer(): void {
    if (this.proCarouselInterval) {
      clearInterval(this.proCarouselInterval);
      this.proCarouselInterval = undefined;
    }
  }

  /** Reinicia el compte enrere quan l'usuari interactua manualment */
  restartProCarouselTimer(): void {
    this.startProCarouselTimer();
  }

  /** Posa en pausa la rotació quan el cursor entra sobre el carrusel */
  pauseProCarousel(): void {
    this.isProCarouselPaused = true;
  }

  /** Reprèn la rotació automàtica quan el cursor surt de la secció */
  resumeProCarousel(): void {
    this.isProCarouselPaused = false;
  }

  /** Obté la foto de perfil o isotip d'empresa si està disponible */
  getProFotoPerfil(pro: any): string | null {
    if (!pro) return null;
    return pro.fotoPerfil || pro.foto_perfil || null;
  }

  /** Imatge de fons del banner principal del professional destacat */
  getProMainBackground(pro: any): string {
    const bg = pro.logo || pro.foto;
    if (bg) {
      return `url('${bg}')`;
    }
    return 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)';
  }

  /** Imatge de fons amb degradat fosc per a les previsualitzacions laterals */
  getProSideBackground(pro: any): string {
    const bg = pro.logo || pro.foto;
    if (bg) {
      return `linear-gradient(180deg, rgba(15, 23, 42, 0.45) 0%, rgba(15, 23, 42, 0.88) 100%), url('${bg}')`;
    }
    return 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)';
  }

  /** Retorna el fons degradat + fotografia assignada per a la targeta del professional recomanat */
  getProCardBackground(pro: any): string {
    const bg = pro.logo || pro.foto;
    if (!bg) return '';
    return `linear-gradient(180deg, rgba(15, 23, 42, 0.72) 0%, rgba(15, 23, 42, 0.90) 100%), url('${bg}')`;
  }

  /** Genera el logo representatiu de l'empresa / professional amb inicials i paleta corporativa */
  getCompanyLogo(pro: Usuari): { initial: string; bg: string; color: string } {
    const nom = (pro.nom || 'P').replace(/\(.*?\)/g, '').trim();
    const parts = nom.split(/\s+/).filter(Boolean);
    const initial = parts.length >= 2
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : nom.substring(0, 2).toUpperCase();

    const palettes = [
      { bg: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)', color: '#ffffff' },
      { bg: 'linear-gradient(135deg, #065f46 0%, #10b981 100%)', color: '#ffffff' },
      { bg: 'linear-gradient(135deg, #7c2d12 0%, #ea580c 100%)', color: '#ffffff' },
      { bg: 'linear-gradient(135deg, #4c1d95 0%, #8b5cf6 100%)', color: '#ffffff' },
      { bg: 'linear-gradient(135deg, #0f766e 0%, #14b8a6 100%)', color: '#ffffff' },
      { bg: 'linear-gradient(135deg, #831843 0%, #ec4899 100%)', color: '#ffffff' }
    ];

    let hash = 0;
    for (let i = 0; i < nom.length; i++) hash = nom.charCodeAt(i) + ((hash << 5) - hash);
    const p = palettes[Math.abs(hash) % palettes.length];

    return { initial, bg: p.bg, color: p.color };
  }

  /** Obté l'especialitat o gremi principal a partir del nom o biografia */
  getProSpeciality(pro: Usuari): string {
    const nom = pro.nom || '';
    const match = nom.match(/\((.*?)\)/);
    if (match && match[1]) {
      return match[1];
    }
    const bio = (pro.bio || '').toLowerCase();
    if (bio.includes('lampist') || bio.includes('canonad')) return 'Lampisteria';
    if (bio.includes('electr')) return 'Electricitat';
    if (bio.includes('pint')) return 'Pintura & Decoració';
    if (bio.includes('clima') || bio.includes('aerot')) return 'Climatització';
    if (bio.includes('fust')) return 'Fusteria';
    return 'Professional Verificat';
  }

  constructor(
    private readonly dashboardService: DashboardService,
    private readonly ofertaService: OfertaService,
    private readonly resenyaService: ResenyaService,
    private readonly usuariService: UsuariService,
    public readonly authService: AuthService,
    private readonly articleService: ArticleService,
    private readonly confirmService: ConfirmService,
    private readonly router: Router,
    public readonly pwaService: PwaService,
    private readonly translationService: TranslationService
  ) {
    this.routerEventsSub = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.generarPrevisualitzacionsAleatories();
      }
    });
  }

  ngOnDestroy(): void {
    if (this.routerEventsSub) {
      this.routerEventsSub.unsubscribe();
    }
    this.stopProCarouselTimer();
    if (this.proTransitionTimeout) clearTimeout(this.proTransitionTimeout);
  }

  ngOnInit(): void {
    this.loadDashboard();
    this.loadResenyes();
    this.loadUsuaris();
  }

  loadUsuaris(): void {
    this.usuariService.getAll().subscribe({
      next: (users) => {
        this.allUsuaris = users ?? [];
        this.startProCarouselTimer();
      },
      error: () => {}
    });
  }

  loadDashboard(): void {
    this.dashboardService.getDashboard().subscribe({
      next: (dashboard) => {
        this.dashboard = dashboard;
        this.loading = false;
        this.generarPrevisualitzacionsAleatories();
      },
      error: () => {
        this.error = 'No s’ha pogut carregar el dashboard del backend.';
        this.loading = false;
      }
    });
  }

  loadResenyes(): void {
    this.resenyaService.getAll().subscribe({
      next: (res) => {
        this.allResenyes = res ?? [];
        this.ressenyesDestacades = this.barrejarArray([...this.allResenyes]).slice(0, 6);
      },
      error: () => {}
    });
  }

  getRatingInfo(pro: Usuari | string): { mitjana: string; total: number } | null {
    if (!pro) return null;
    const nom = typeof pro === 'string' ? pro : (pro.nom || '');
    const id = typeof pro === 'string' ? '' : (pro.id || '');
    const qNom = nom.toLowerCase().trim();
    const qId = id.toLowerCase().trim();

    const list = this.allResenyes.filter(
      (r) =>
        (r.treballadorNom && (r.treballadorNom.toLowerCase().trim() === qNom || (qId && r.treballadorNom.toLowerCase().trim() === qId))) ||
        (r.treballadorId && (r.treballadorId.toLowerCase().trim() === qId || (qNom && r.treballadorId.toLowerCase().trim() === qNom)))
    );
    if (list.length === 0) {
      if (typeof pro !== 'string' && pro.verificat) {
        return { mitjana: '5.0', total: 1 };
      }
      return null;
    }
    const avg = list.reduce((a, b) => a + b.puntuacio, 0) / list.length;
    return {
      mitjana: avg.toFixed(1),
      total: list.length
    };
  }

  /** Genera previsualitzacions aleatòries perquè no surtin sempre les mateixes 3 */
  generarPrevisualitzacionsAleatories(): void {
    const allTasks = [...this.tasks];
    this.randomPreviewTasks = this.barrejarArray(allTasks).slice(0, 1);

    const allOffers = [...this.offers];
    this.randomPreviewOffers = this.barrejarArray(allOffers).slice(0, 1);
  }

  private barrejarArray<T>(array: T[]): T[] {
    const copia = [...array];
    for (let i = copia.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copia[i], copia[j]] = [copia[j], copia[i]];
    }
    return copia;
  }

  get tasks() {
    const rawIncidencies = (this.dashboard?.incidencies ?? [])
      .filter((inc) => !inc.estat || inc.estat === 'Oberta')
      .map((inc) => ({
        id: inc.id,
        title: inc.titol,
        client: inc.clientNom || (inc as any).client || '',
        category: inc.categoria?.trim() ? inc.categoria.trim() : 'Altres Serveis',
        budget: inc.budget,
        status: inc.estat || 'Oberta'
      }));

    const rawTasks = (this.dashboard?.tasks ?? [])
      .filter((task) => (task.tipus === 'incidencia' || !task.professional) && task.estat === 'Oberta' && task.tipus !== 'oferta' && !rawIncidencies.some(i => i.id === task.id))
      .map((task) => ({
        id: task.id,
        title: task.titol,
        client: task.client,
        category: task.categoria?.trim() ? task.categoria.trim() : 'Altres Serveis',
        budget: task.budget,
        status: task.estat
      }));

    return [...rawIncidencies, ...rawTasks];
  }

  get offers() {
    return this.dashboard?.offers.map((offer) => {
      const associatedTask = this.dashboard?.tasks.find((task) => task.id === offer.tascaId);
      const rawCat = (offer as any).categoria || associatedTask?.categoria;
      const category = (rawCat && rawCat.trim()) ? rawCat.trim() : 'Altres Serveis';
      return {
        id: offer.id,
        professional: offer.professional,
        task: associatedTask?.titol ?? offer.tascaId,
        category,
        price: offer.price,
        note: offer.note,
        status: offer.estat
      };
    }) ?? [];
  }

  /** Articles informatius del blog gestionats a través d'ArticleService */
  get articlesBlog(): Article[] {
    return this.articleService.getArticles();
  }

  /** Retorna la vista prèvia aleatòria de tasques (desactivada en favor del tauler net) */
  get previewTasks() {
    return [];
  }

  /** Retorna la vista prèvia d'ofertes (desactivada en favor del tauler net) */
  get previewOffers() {
    return [];
  }

  /** Retorna el títol personalitzat de benvinguda amb el nom d'usuari */
  getUserWelcomeTitle(): string {
    const user = this.authService.getCurrentUser();
    const nom = (user?.nom || user?.email || '').trim() || 'Usuari';
    return this.translationService.t('HOME.WELCOME_USER_TITLE', { nom });
  }

  /** Retorna el subtítol personalitzat segons el rol de l'usuari */
  getUserWelcomeSubtitle(): string {
    if (this.authService.isAdmin()) {
      return this.translationService.t('HOME.WELCOME_USER_SUBTITLE_ADMIN');
    }
    if (this.authService.isProfessional()) {
      return this.translationService.t('HOME.WELCOME_USER_SUBTITLE_PRO');
    }
    return this.translationService.t('HOME.WELCOME_USER_SUBTITLE_CLIENT');
  }

  /** Retorna la classe CSS identificativa del rol per al xip de benvinguda */
  getWelcomeRoleClass(): string {
    if (this.authService.isAdmin()) return 'role-admin';
    if (this.authService.isProfessional()) return 'role-pro';
    return 'role-client';
  }

  /** Retorna l'etiqueta llegible del rol per a l'usuari connectat */
  getWelcomeRoleLabel(): string {
    const user = this.authService.getCurrentUser();
    if (!user) return '';
    const rol = (user.rol || '').toLowerCase();
    if (rol === 'administrador' || rol === 'admin') return 'Administrador';
    if (rol === 'professional' || rol === 'pro') return 'Professional';
    return 'Client';
  }

  getTaskStatusClass(status: string): string {
    return status.toLowerCase().replace(/\s+/g, '-');
  }

  getOfferStatusClass(status: string): string {
    return status.toLowerCase();
  }

  getOfertaTitol(offer: any): string {
    if (offer.titol && typeof offer.titol === 'string' && offer.titol.trim()) {
      return offer.titol.trim();
    }
    if (offer.title && typeof offer.title === 'string' && offer.title.trim()) {
      return offer.title.trim();
    }
    const note = offer.note ? String(offer.note).trim() : '';
    if (note) {
      if (note.includes(' — ')) {
        const parts = note.split(' — ');
        if (parts[0].trim()) return parts[0].trim();
      }
      if (note.includes(' - ')) {
        const parts = note.split(' - ');
        if (parts[0].trim()) return parts[0].trim();
      }
      if (note.length <= 60) {
        return note;
      }
    }
    if (offer.task && offer.task !== 'standalone') {
      return 'Pressupost per a: ' + offer.task;
    }
    if (offer.category && offer.category !== 'Altres Serveis') {
      return 'Servei de ' + offer.category;
    }
    return 'Oferta de servei professional';
  }

  getOfertaDescripcio(offer: any): string {
    const note = offer.note ? String(offer.note).trim() : '';
    if (note) {
      if (note.includes(' — ')) {
        const parts = note.split(' — ');
        const desc = parts.slice(1).join(' — ').trim();
        if (desc) return desc;
      }
      if (note.includes(' - ')) {
        const parts = note.split(' - ');
        const desc = parts.slice(1).join(' - ').trim();
        if (desc) return desc;
      }
      const titol = this.getOfertaTitol(offer);
      if (note !== titol) {
        return note;
      }
    }
    return 'Pack de servei professional ofertat al mercat.';
  }

  private requireLogin(actionDesc: string, returnUrl: string = '/'): boolean {
    if (!this.authService.isLoggedIn()) {
      this.noticeMessage = `Has d'iniciar sessió per ${actionDesc}. Redirigint al formulari de login...`;
      setTimeout(() => {
        this.router.navigate(['/login'], {
          queryParams: {
            message: `Cal iniciar sessió abans de poder ${actionDesc}.`,
            returnUrl
          }
        });
      }, 700);
      return false;
    }
    return true;
  }

  onNovaTasca(): void {
    this.router.navigate([this.getNavUrl('/tasques-ofertes')], { queryParams: { tipus: 'incidencies', accio: 'crear-incidencia' } });
  }

  onNovaOferta(): void {
    this.router.navigate([this.getNavUrl('/tasques-ofertes')], { queryParams: { tipus: 'ofertes', accio: 'crear-oferta' } });
  }

  onNavegarTasquesOfertes(tipus: 'tots' | 'tasques' | 'ofertes' | 'incidencies' = 'tots'): void {
    if (tipus !== 'tots') {
      this.router.navigate([this.getNavUrl('/tasques-ofertes')], { queryParams: { tipus } });
    } else {
      this.router.navigate([this.getNavUrl('/tasques-ofertes')]);
    }
  }

  onVeureTotesTasques(): void {
    this.onNavegarTasquesOfertes('tasques');
  }

  onDetallTasca(taskId: string): void {
    if (!this.requireLogin(`veure el detall de la tasca ${taskId}`, `/tasca-detall/${taskId}`)) return;
    this.router.navigate([this.getNavUrl('/tasca-detall'), taskId]);
  }

  onFerOferta(taskId: string): void {
    this.router.navigate([this.getNavUrl('/tasques-ofertes')], { queryParams: { taskId } });
  }

  onVeureTotesOfertes(): void {
    this.onNavegarTasquesOfertes('ofertes');
  }

  /**
   * Envia la petició d'interès per una oferta des de la portada i, un cop confirmada a l'app, mostra l'opció de contactar.
   */
  async onInteressatOferta(offer: any): Promise<void> {
    const pro = offer.professional || 'aquest professional';
    if (!this.requireLogin(`sol·licitar el servei de ${pro}`, '/')) return;
    if (!this.authService.isClient()) {
      this.noticeMessage = 'Només els comptes amb rol de "Client" o "Ambdós" poden sol·licitar ofertes de serveis.';
      return;
    }

    const currentUserName = this.authService.getCurrentUser()?.nom || 'Client';
    const titol = this.getOfertaTitol(offer);
    const preu = offer.price || '';

    const confirmacio = await this.confirmService.confirm({
      title: this.translationService.t('TASQUES_OFERTES.CONFIRM_INTERES_TITLE'),
      message: `Vols enviar la petició per a l'oferta de ${pro} (${titol}) per ${preu}?\n\nEs confirmarà a l'aplicació AVISA i es generarà la tasca en curs.`,
      confirmText: this.translationService.t('TASQUES_OFERTES.CONFIRM_INTERES_BTN'),
      cancelText: this.translationService.t('COMMON.CANCEL_LAR'),
      icon: 'question'
    });
    if (!confirmacio) return;

    this.ofertaService.contractar(offer.id, currentUserName).subscribe({
      next: (tasca) => {
        this.peticioExitDades = {
          tascaId: tasca?.id,
          titol,
          professional: pro,
          preu,
          telefon: this.getProfessionalPhone(pro),
          email: this.getProfessionalEmail(pro)
        };
        this.noticeMessage = `Petició enviada correctament! S'ha generat la tasca en curs amb ${pro}. Ara pots contactar-hi per WhatsApp o correu.`;
        this.loadDashboard();
      },
      error: () => {
        this.noticeMessage = `No s'ha pogut processar la petició de l'oferta.`;
      }
    });
  }

  /** Alias de compatibilitat */
  onContractarOferta(offer: any): void {
    this.onInteressatOferta(offer);
  }

  tancarModalPeticioExit(): void {
    this.peticioExitDades = null;
  }

  contactarWhatsappPeticio(): void {
    if (!this.peticioExitDades) return;
    const { professional, telefon, titol, preu } = this.peticioExitDades;
    const cleanPhone = telefon.replace(/\D/g, '');
    const phoneWithCountry = cleanPhone.length === 9 ? '34' + cleanPhone : cleanPhone;
    const clientUser = this.authService.getCurrentUser();
    const clientNom = clientUser ? clientUser.nom : 'Client AVISA';
    const missatge = `Hola ${professional}, acabe de sol·licitar la teva oferta a AVISA: "${titol}" (${preu}). Sóc ${clientNom}. Podem parlar dels detalls del servei?`;
    const url = `https://wa.me/${phoneWithCountry}?text=${encodeURIComponent(missatge)}`;
    if (typeof window !== 'undefined') {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  }

  contactarEmailPeticio(): void {
    if (!this.peticioExitDades) return;
    const { professional, email, titol, preu } = this.peticioExitDades;
    const clientUser = this.authService.getCurrentUser();
    const clientNom = clientUser ? clientUser.nom : 'Client interessat';
    const assumpte = `Petició de servei AVISA: ${titol}`;
    const cos = `Hola ${professional},\n\nAcabe de contractar / sol·licitar la teva oferta a l'aplicació AVISA:\n- Servei: ${titol}\n- Preu indicat: ${preu}\n\nEm poso en contacte amb tu per poder coordinar dates, horaris i detalls de l'actuació.\n\nSalutacions cordials,\n${clientNom}`;
    const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(assumpte)}&body=${encodeURIComponent(cos)}`;
    if (typeof window !== 'undefined') {
      window.location.href = mailtoUrl;
    }
  }

  anarTascaPeticio(tascaId: string): void {
    this.tancarModalPeticioExit();
    this.router.navigate([this.getNavUrl('/tasca-detall'), tascaId]);
  }

  getProfessionalUser(proNom: string): Usuari | undefined {
    if (!proNom) return undefined;
    const q = proNom.toLowerCase().trim();
    return this.allUsuaris.find((u) => {
      const uNom = (u.nom || '').toLowerCase().trim();
      const uId = (u.id || '').toLowerCase().trim();
      return uNom === q || uId === q || (uNom && q && (uNom.includes(q) || q.includes(uNom)));
    });
  }

  getProfessionalIdentifier(proNom: string): string {
    const user = this.getProfessionalUser(proNom);
    return user ? user.id : proNom;
  }

  getProfessionalPhone(proNom: string): string {
    const user = this.getProfessionalUser(proNom);
    if (user?.telefon && user.telefon.trim()) {
      return user.telefon.trim();
    }
    return '611223344';
  }

  getProfessionalEmail(proNom: string): string {
    const user = this.getProfessionalUser(proNom);
    if (user?.email && user.email.trim() && user.email.includes('@')) {
      return user.email.trim();
    }
    const clean = (proNom || 'pro').toLowerCase().replace(/[^a-z0-9]/g, '');
    return `${clean}@prof.es`;
  }

  contactarWhatsapp(offer: any, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    const proNom = offer.professional || 'Professional';
    const rawPhone = this.getProfessionalPhone(proNom);
    const cleanPhone = rawPhone.replace(/\D/g, '');
    const phoneWithCountry = cleanPhone.length === 9 ? '34' + cleanPhone : cleanPhone;

    const titol = this.getOfertaTitol(offer);
    const preu = offer.price || '';
    const clientUser = this.authService.getCurrentUser();
    const clientNom = clientUser ? clientUser.nom : 'un client interessat';

    const missatge = `Hola ${proNom}, m'interessa la teva oferta a AVISA: "${titol}" (${preu}). Sóc ${clientNom}. Podem parlar dels detalls del servei?`;
    const url = `https://wa.me/${phoneWithCountry}?text=${encodeURIComponent(missatge)}`;

    if (typeof window !== 'undefined') {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  }

  contactarEmail(offer: any, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    const proNom = offer.professional || 'Professional';
    const email = this.getProfessionalEmail(proNom);
    const titol = this.getOfertaTitol(offer);
    const preu = offer.price || '';
    const clientUser = this.authService.getCurrentUser();
    const clientNom = clientUser ? clientUser.nom : 'Client interessat';

    const assumpte = `Interès en l'oferta AVISA: ${titol}`;
    const cos = `Hola ${proNom},\n\nM'interessa la teva oferta de servei publicada a AVISA:\n- Servei: ${titol}\n- Preu indicat: ${preu}\n\nEm pots respondre a aquest correu per poder coordinar els detalls i la data del servei.\n\nSalutacions cordials,\n${clientNom}`;

    const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(assumpte)}&body=${encodeURIComponent(cos)}`;

    if (typeof window !== 'undefined') {
      window.location.href = mailtoUrl;
    }
  }

  onPublicarOferta(): void {
    this.router.navigate([this.getNavUrl('/tasques-ofertes')], { queryParams: { tipus: 'ofertes', accio: 'crear-oferta' } });
  }

  onAcceptarOferta(offerId: string): void {
    if (!this.requireLogin(`acceptar l'oferta ${offerId}`, '/')) return;
    if (this.authService.isClient()) {
      this.ofertaService.accept(offerId).subscribe({
        next: () => {
          this.noticeMessage = `S'ha acceptat la proposta ${offerId} correctament a la base de dades.`;
          this.loadDashboard();
        },
        error: () => {
          this.noticeMessage = `No s'ha pogut acceptar l'oferta.`;
        }
      });
    } else {
      this.noticeMessage = 'Només el client que ha publicat la tasca pot acceptar aquesta oferta.';
    }
  }

  /**
   * Fa lliscar la pantalla suaument cap a la secció de contingut
   */
  scrollToContent(): void {
    const scrollTarget = window.innerHeight - 44;
    window.scrollTo({
      top: scrollTarget,
      behavior: 'smooth'
    });
  }

  obrirArticle(article: any): void {
    if (article?.id) {
      this.router.navigate([this.getNavUrl('/article'), article.id]);
    }
  }

  onAnarRegistreClient(): void {
    this.router.navigate(['/registre'], { queryParams: { rol: 'client' } });
  }

  onAnarRegistreProfessional(): void {
    this.router.navigate(['/registre'], { queryParams: { rol: 'professional' } });
  }

  /**
   * Tanca la sessió actual des del tauler d'inici i redirigeix al login
   */
  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/login'], { queryParams: { message: 'Sessió tancada correctament.' } });
  }
}

