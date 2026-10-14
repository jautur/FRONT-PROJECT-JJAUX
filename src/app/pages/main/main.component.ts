import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { DashboardResponse, DashboardService } from '../../services/dashboard.service';
import { OfertaService } from '../../services/oferta.service';
import { ResenyaService } from '../../services/resenya.service';
import { AuthService } from '../../core/services/auth.service';
import { Resenya } from '../../models/resenya.model';
import { ArticleService } from '../../services/article.service';
import { Article } from '../../models/article.model';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section class="main-page">
      <!-- PORTADA INICIAL DE PANTALLA COMPLETA AMB 1 SOLA FOTO FIXA DE FONS -->
      <header class="fullscreen-cover">
        <!-- NOM DE LA WEB EN MIG DE LA PÀGINA I SLOGAN ORIGINAL FIX -->
        <div class="hero-center">
          <h1 class="hero-brand">AVISA</h1>
          <p class="hero-slogan">Connectant necessitats i professionals</p>
        </div>

        <div class="cover-scroll-hint" (click)="scrollToContent()" role="button" aria-label="Llisca cap avall" title="Llisca cap avall">
          <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </div>
      </header>

      <!-- CONTINGUT PRINCIPAL DE LA PLATAFORMA (VISUALITZAT EN FER SCROLL) -->
      <div class="dashboard-body">
        <div class="dashboard-header-bar">
          <div>
            <span class="eyebrow-tag">Plataforma AVISA</span>
            <h2 class="dashboard-title">Tauler de Tasques i Ofertes</h2>
          </div>
          <button type="button" class="btn-create-task" (click)="onNovaTasca()">+ Nova tasca</button>
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

        <div class="columns">
          <!-- SECCIÓ DE TASQUES RECENTS -->
          <section class="panel">
            <div class="panel-header">
              <h2>Últimes tasques</h2>
              <a routerLink="/tasques-ofertes" [queryParams]="{ tipus: 'tasques' }">
                Veure totes ({{ tasks.length }})
              </a>
            </div>

            <article class="card" *ngFor="let task of previewTasks">
              <div class="card-top">
                <span class="tag">{{ task.category }}</span>
                <span class="status status-task" [ngClass]="getTaskStatusClass(task.status)">
                  {{ task.status }}
                </span>
              </div>
              <h3>{{ task.title }}</h3>
              <p class="meta">Client: <a [routerLink]="['/perfil', task.client]" class="user-inline-link" title="Veure perfil de {{ task.client }}">{{ task.client }}</a></p>
              <div class="card-footer">
                <span>Pressupost: {{ task.budget }}</span>
                <div class="actions">
                  <button type="button" (click)="onDetallTasca(task.id)">Detall</button>
                  <button type="button" class="btn-secondary" (click)="onFerOferta(task.id)">Fer oferta</button>
                </div>
              </div>
            </article>

            <div class="preview-toggle-wrap">
              <button type="button" class="btn-preview-toggle" (click)="onNavegarTasquesOfertes('tasques')">
                Explorar totes les tasques disponibles ({{ tasks.length }})
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-left: 6px; vertical-align: middle;">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </button>
            </div>
          </section>

          <!-- SECCIÓ D'OFERTES RECENTS -->
          <section class="panel">
            <div class="panel-header">
              <h2>Ofertes recents</h2>
              <a routerLink="/tasques-ofertes" [queryParams]="{ tipus: 'ofertes' }">
                Veure totes ({{ offers.length }})
              </a>
            </div>

            <article class="card offer-card" *ngFor="let offer of previewOffers">
              <div class="card-top">
                <span class="tag alt">{{ offer.category || 'Altres Serveis' }}</span>
                <span class="status status-offer" [ngClass]="getOfferStatusClass(offer.status)">
                  {{ offer.status }}
                </span>
              </div>
              <h3>
                <a [routerLink]="['/perfil', offer.professional]" class="user-inline-link pro-title-link" title="Veure perfil de {{ offer.professional }}">{{ offer.professional }}</a>
              </h3>
              <div class="pro-preview-rating" *ngIf="getRatingInfo(offer.professional) as r">
                <span class="stars-gold">★ {{ r.mitjana }}</span>
                <span class="reviews-count">({{ r.total }} opinions)</span>
              </div>
              <p class="meta" *ngIf="offer.task">Tasca: {{ offer.task }}</p>
              <p>{{ offer.note }}</p>
              <div class="card-footer">
                <span>Oferta: {{ offer.price }}</span>
                <button type="button" (click)="onAcceptarOferta(offer.id)">Acceptar</button>
              </div>
            </article>

            <div class="preview-toggle-wrap">
              <button type="button" class="btn-preview-toggle" (click)="onNavegarTasquesOfertes('ofertes')">
                Explorar totes les ofertes disponibles ({{ offers.length }})
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-left: 6px; vertical-align: middle;">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </button>
            </div>
          </section>
        </div>

        <!-- ============================================================== -->
        <!-- SECCIÓ 1: QUÈ ÉS I PER A QUÈ SERVEIX AVISA (PROPÒSIT I SEO)     -->
        <!-- ============================================================== -->
        <section class="seo-feature-section" id="que-es-avisa">
          <div class="section-badge-tag">LA PLATAFORMA DE SERVEIS PROFESSIONALS</div>
          <h2 class="seo-section-title">Connectem persones amb necessitats i especialistes de confiança</h2>
          <p class="seo-section-intro">
            <strong>AVISA</strong> és la plataforma digital creada per fer ràpida, transparent i segura la gestió de qualsevol encàrrec o avaria. 
            Tant si necessites una petita reparació urgent a la llar com un projecte complet de reforma, obra nova o manteniment d'instal·lacions, 
            AVISA elimina els intermediaris innecessaris i et posa en contacte directe amb professionals verificats de la teva localitat.
          </p>

          <div class="feature-grid">
            <div class="feature-card">
              <div class="feature-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
              </div>
              <h3>Publicació àgil i gratuïta</h3>
              <p>
                Descriu el que necessites en menys de 2 minuts, estableix el teu pressupost de referència i la feina es publicarà immediatament per a professionals de la teva zona.
              </p>
            </div>

            <div class="feature-card">
              <div class="feature-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                  <path d="m9 12 2 2 4-4"></path>
                </svg>
              </div>
              <h3>Professionals verificats</h3>
              <p>
                Lampistes, electricistes, fusters, pintors, instal·ladors i paletes amb perfils revisats, telèfon directe de contacte i valoracions públiques per a la teva tranquil·litat.
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
              <h3>Sense comissions ocultes</h3>
              <p>
                Preus justos i pactats lliurement entre client i professional. Sense lletra petita ni recàrrecs que inflin el cost final de la teva feina.
              </p>
            </div>
          </div>
        </section>

        <!-- ============================================================== -->
        <!-- SECCIÓ 2: EXPERIÈNCIA SINCRONITZADA AMB L'APP MÒBIL            -->
        <!-- ============================================================== -->
        <section class="app-sync-banner">
          <div class="app-sync-content">
            <span class="sync-tag">100% SINCRONITZAT AMB L'APP MÒBIL</span>
            <h2>La mateixa potència des del navegador o des del mòbil</h2>
            <p>
              AVISA està dissenyada per funcionar exactament igual a la web que a l'aplicació mòbil nativa. 
              Tots els teus avisos, tasques actives, ofertes rebudes i notificacions es sincronitzen instantàniament en temps real al teu telèfon.
            </p>
            <div class="sync-highlights">
              <div class="highlight-item">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <span>Avisos push immediats en rebre una oferta</span>
              </div>
              <div class="highlight-item">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <span>Geolocalització de tasques a prop de la teva ubicació</span>
              </div>
              <div class="highlight-item">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <span>Contacte directe per telèfon i missatgeria</span>
              </div>
            </div>
            <div class="sync-actions">
              <button type="button" class="btn-sync-action" (click)="onNovaTasca()">Provar a la web ara</button>
              <button type="button" class="btn-sync-secondary" (click)="onAnarRegistreClient()">Crear compte gratuït</button>
            </div>
          </div>
        </section>

        <!-- ============================================================== -->
        <!-- SECCIÓ 3: BENEFICIS SEGONS EL TEU PERFIL (CLIENT I PRO)        -->
        <!-- ============================================================== -->
        <section class="roles-showcase-section">
          <div class="role-box client-role-box">
            <div class="role-box-header">
              <span class="role-badge client-badge">PER A CLIENTS I PARTICULARS</span>
              <h3>Necessites resoldre una tasca o reforma?</h3>
              <p>Publica qualsevol necessitat de manteniment o obra i rep pressupostos personalitzats.</p>
            </div>
            <ul class="role-benefits-list">
              <li>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <span>Publicació 100% gratuïta i sense compromís de contractació</span>
              </li>
              <li>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <span>Compara ofertes, terminis i preus de diversos professionals</span>
              </li>
              <li>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <span>Accés al telèfon directe del professional en acceptar l'oferta</span>
              </li>
            </ul>
            <button type="button" class="btn-role-action" (click)="onNovaTasca()">Publicar la meva tasca</button>
          </div>

          <div class="role-box pro-role-box">
            <div class="role-box-header">
              <span class="role-badge pro-badge">PER A PROFESSIONALS I AUTÒNOMS</span>
              <h3>Busques feines noves i clients a la teva zona?</h3>
              <p>Accedeix a la borsa diària de demandes reals sense intermediaris ni comissions abusives.</p>
            </div>
            <ul class="role-benefits-list">
              <li>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <span>Consulta tasques obertes i envia pressupostos adaptats al teu marge</span>
              </li>
              <li>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <span>Herència de capacitats: publica tasques pròpies i respon a altres usuaris</span>
              </li>
              <li>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <span>Notificacions al mòbil immediates quan s'obre una feina a la teva especialitat</span>
              </li>
            </ul>
            <button type="button" class="btn-role-action pro-btn" (click)="onAnarRegistreProfessional()">Començar com a professional</button>
          </div>
        </section>

        <!-- ============================================================== -->
        <!-- SECCIÓ 4: BLOG I GUIA D'EXPERTS (OPTIMITZACIÓ SEO)             -->
        <!-- ============================================================== -->
        <section class="blog-seo-section" id="blog-avisa">
          <div class="blog-header-group">
            <div>
              <span class="section-badge-tag">BLOG D'AVISA · CONSELLS I RECURSOS</span>
              <h2 class="seo-section-title">Guies pràctiques per a la llar i claus per a professionals</h2>
              <p class="seo-section-intro">
                Articles actualitzats amb consells tècnics, estimacions de preus i bones pràctiques per treure el màxim rendiment a la plataforma.
              </p>
            </div>
          </div>

          <div class="blog-grid">
            <article class="blog-card" *ngFor="let article of articlesBlog">
              <div class="blog-card-media" [routerLink]="['/article', article.id]" style="cursor: pointer;">
                <img [src]="article.imatge" [alt]="article.titol" loading="lazy" />
                <span class="blog-category-tag">{{ article.categoria }}</span>
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
                  <span>Llegir article complet</span>
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
          <div class="section-badge-tag">OPINIONS I VALORACIONS VERIFICADES</div>
          <h2 class="seo-section-title">La confiança dels nostres clients parla per nosaltres</h2>
          <p class="seo-section-intro">
            Consulta les experiències recents de particulars i comunitats de veïns que han contractat serveis a través d'AVISA. Qualitat, puntualitat i acabats excel·lents garantits.
          </p>

          <div class="reviews-home-grid">
            <div class="review-home-card" *ngFor="let r of ressenyesDestacades">
              <div class="review-stars-row">
                <span class="star-gold" *ngFor="let s of [1,2,3,4,5]">{{ s <= r.puntuacio ? '★' : '☆' }}</span>
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
            <span class="cta-tag">UN PAS ENDAVANT AMB AVISA</span>
            <h2>Preparat per resoldre la teva propera feina o aconseguir clients?</h2>
            <p>
              Tant si ets un particular amb una tasca a resoldre com un professional autònom, 
              AVISA és la comunitat que simplifica la teva activitat diària des de la web i el mòbil.
            </p>
            <div class="cta-buttons-row">
              <button type="button" class="btn-cta-main" (click)="onNovaTasca()">
                + Publicar una tasca gratuïta
              </button>
              <button type="button" class="btn-cta-secondary" (click)="onAnarRegistreProfessional()">
                Registrar-se com a professional
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
                La plataforma de referència per a la publicació de tasques, serveis professionals, reformes i manteniment de la llar. 
                Sincronització total entre plataforma web i aplicació mòbil nativa.
              </p>
              <span class="footer-status-pill">Plataforma operativa 24/7</span>
            </div>

            <div class="footer-col">
              <h4>Serveis populars</h4>
              <ul>
                <li><span>Reformes integrals i paletes</span></li>
                <li><span>Electricistes homologats</span></li>
                <li><span>Lampisteria i desatascos</span></li>
                <li><span>Pintura i restauració</span></li>
                <li><span>Climatització i aerotèrmia</span></li>
                <li><span>Fusteria i serralleria</span></li>
              </ul>
            </div>

            <div class="footer-col">
              <h4>Navegació i Àrees</h4>
              <ul>
                <li><a routerLink="/tasques-ofertes">Mercat de Tasques i Ofertes</a></li>
                <li><a routerLink="/client/crear-tasca">Publicar tasca nova</a></li>
                <li><a routerLink="/registre" [queryParams]="{ rol: 'professional' }">Àrea Professionals</a></li>
                <li><a routerLink="/registre" [queryParams]="{ rol: 'client' }">Registre de clients</a></li>
                <li><a href="#que-es-avisa">Què fa AVISA</a></li>
                <li><a href="#blog-avisa">Blog i Consells SEO</a></li>
              </ul>
            </div>

            <div class="footer-col">
              <h4>Seguretat i Legal</h4>
              <ul>
                <li><span>Model d'herència de rols</span></li>
                <li><span>Professionals verificats</span></li>
                <li><span>Privacitat i protecció de dades</span></li>
                <li><span>Condicions generals d'ús</span></li>
                <li><span>Atenció i suport tècnic</span></li>
              </ul>
            </div>
          </div>

          <div class="footer-bottom">
            <p>© 2026 AVISA Platform. Tots els drets reservats. Connexió web i mòbil garantida.</p>
          </div>
        </footer>
      </div>
    </section>
  `,
  styles: [
    `
      .main-page {
        width: 100%;
        display: flex;
        flex-direction: column;
        background-color: #f7f3ed;
        color: #0c0c10;
        min-height: 100vh;
      }

      .fullscreen-cover {
        width: 100%;
        height: calc(100vh - 48px);
        min-height: 560px;
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
        background-color: #f7f3ed;
      }

      .dashboard-header-bar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        background: #ffffff;
        border-radius: 16px;
        padding: 1.6rem 2.2rem;
        border: 1px solid #e5e0d7;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
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
        color: #09090c;
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
        background: #ffffff;
        border: 1px solid #e5e0d7;
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
        border-bottom: 1px solid #eeeae1;
        padding-bottom: 0.85rem;
      }

      .panel-header h2 {
        margin: 0;
        font-size: 1.35rem;
        font-weight: 900;
        color: #09090c;
      }

      .panel-header a {
        text-decoration: none;
        color: #09090c;
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
        background: #faf8f4;
        border: 1px solid #e7e2d9;
        border-radius: 14px;
        padding: 1.25rem;
        display: flex;
        flex-direction: column;
        gap: 1rem;
        transition: all 0.2s ease;
      }

      .card:hover {
        background: #ffffff;
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
        color: #09090c;
      }

      p {
        margin: 0;
        color: #4c4b45;
        font-size: 0.92rem;
        font-weight: 600;
      }

      .meta {
        font-size: 0.85rem;
        color: #716f67;
        font-weight: 700;
      }

      .card-footer span {
        font-weight: 900;
        color: #09090c;
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
        background: #ffffff;
        border: 1px dashed #d5cfc4;
        color: #09090c;
        padding: 0.75rem 1rem;
        border-radius: 10px;
        font-weight: 800;
        font-size: 0.86rem;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .btn-preview-toggle:hover {
        background: #fdfcf9;
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

      /* ============================================================== */
      /* SECCIÓ 4: BLOG SEO I GUIA D'EXPERTS                            */
      /* ============================================================== */
      .blog-seo-section {
        margin-top: 1rem;
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
        .feature-grid,
        .roles-showcase-section,
        .blog-grid,
        .footer-grid {
          grid-template-columns: 1fr;
        }

        .cta-buttons-row,
        .sync-actions {
          flex-direction: column;
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
        color: #6b7280;
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
        grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
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
        color: #6b7280;
      }
      .pro-assigned-note strong {
        color: #1f2937;
      }
    `
  ]
})
export class MainComponent implements OnInit {
  dashboard?: DashboardResponse;
  loading = true;
  error = '';
  noticeMessage = '';

  randomPreviewTasks: any[] = [];
  randomPreviewOffers: any[] = [];

  allResenyes: Resenya[] = [];
  ressenyesDestacades: Resenya[] = [];

  constructor(
    private readonly dashboardService: DashboardService,
    private readonly ofertaService: OfertaService,
    private readonly resenyaService: ResenyaService,
    private readonly authService: AuthService,
    private readonly articleService: ArticleService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.loadDashboard();
    this.loadResenyes();
    this.articlesBlog = this.articleService.getArticles();
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

  getRatingInfo(proNom: string): { mitjana: string; total: number } | null {
    if (!proNom) return null;
    const q = proNom.toLowerCase().trim();
    const list = this.allResenyes.filter(
      (r) =>
        (r.treballadorNom && r.treballadorNom.toLowerCase().trim() === q) ||
        (r.treballadorId && r.treballadorId.toLowerCase().trim() === q)
    );
    if (list.length === 0) {
      return { mitjana: '4.9', total: 3 };
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
    this.randomPreviewTasks = this.barrejarArray(allTasks).slice(0, 3);

    const allOffers = [...this.offers];
    this.randomPreviewOffers = this.barrejarArray(allOffers).slice(0, 3);
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
    return this.dashboard?.tasks.map((task) => ({
      id: task.id,
      title: task.titol,
      client: task.client,
      category: task.categoria?.trim() ? task.categoria.trim() : 'Altres Serveis',
      budget: task.budget,
      status: task.estat
    })) ?? [];
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
  articlesBlog: Article[] = [];

  /** Retorna la vista prèvia aleatòria de 3 tasques per a la pàgina principal */
  get previewTasks() {
    return this.randomPreviewTasks.length > 0 ? this.randomPreviewTasks : this.tasks.slice(0, 3);
  }

  /** Retorna la vista prèvia aleatòria de 3 ofertes per a la pàgina principal */
  get previewOffers() {
    return this.randomPreviewOffers.length > 0 ? this.randomPreviewOffers : this.offers.slice(0, 3);
  }

  getTaskStatusClass(status: string): string {
    return status.toLowerCase().replace(/\s+/g, '-');
  }

  getOfferStatusClass(status: string): string {
    return status.toLowerCase();
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
    if (!this.requireLogin('crear una tasca nova', '/client/crear-tasca')) return;
    if (this.authService.isClient()) {
      this.router.navigate(['/client/crear-tasca']);
    } else {
      this.noticeMessage = 'Només els comptes amb rol de "Client" o "Ambdós" poden crear noves tasques.';
    }
  }

  onNavegarTasquesOfertes(tipus: 'tots' | 'tasques' | 'ofertes' = 'tots'): void {
    if (tipus !== 'tots') {
      this.router.navigate(['/tasques-ofertes'], { queryParams: { tipus } });
    } else {
      this.router.navigate(['/tasques-ofertes']);
    }
  }

  onVeureTotesTasques(): void {
    this.onNavegarTasquesOfertes('tasques');
  }

  onDetallTasca(taskId: string): void {
    if (!this.requireLogin(`veure el detall de la tasca ${taskId}`, `/tasca-detall/${taskId}`)) return;
    this.router.navigate(['/tasca-detall', taskId]);
  }

  onFerOferta(taskId: string): void {
    if (!this.requireLogin(`fer una oferta per a la tasca ${taskId}`, '/professional/crear-oferta')) return;
    if (this.authService.isProfessional()) {
      this.router.navigate(['/professional/crear-oferta'], { queryParams: { taskId } });
    } else {
      this.noticeMessage = 'Només els comptes amb rol de "Professional" o "Ambdós" poden fer ofertes econòmiques.';
    }
  }

  onVeureTotesOfertes(): void {
    this.onNavegarTasquesOfertes('ofertes');
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
      this.router.navigate(['/article', article.id]);
    }
  }

  onAnarRegistreClient(): void {
    this.router.navigate(['/registre'], { queryParams: { rol: 'client' } });
  }

  onAnarRegistreProfessional(): void {
    this.router.navigate(['/registre'], { queryParams: { rol: 'professional' } });
  }
}

