import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ArticleService } from '../../services/article.service';
import { Article } from '../../models/article.model';
import { AuthService } from '../../core/services/auth.service';
import { TranslatePipe } from '../../core/pipes/translate.pipe';

/**
 * Pàgina completa de detall per a cada article del Blog (/article/:id).
 * Presenta el contingut en profunditat, anàlisi del sector local, taules de preus,
 * consells d'experts i accions per crear tasques o contractar professionals.
 */
@Component({
  selector: 'app-article-detall',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslatePipe],
  template: `
    <main class="article-page-container">
      <!-- Barra superior de navegació i fil d'Ariadna -->
      <nav class="breadcrumb-nav" aria-label="Fil d'Ariadna">
        <a [routerLink]="getNavUrl('/inici')" class="breadcrumb-link">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
          {{ 'BLOG.BREADCRUMB_HOME' | translate }}
        </a>
        <span class="breadcrumb-separator">/</span>
        <a [routerLink]="getNavUrl('/blog')" class="breadcrumb-link">{{ 'BLOG.BREADCRUMB_CONSELLS' | translate }}</a>
        <span class="breadcrumb-separator">/</span>
        <span class="breadcrumb-current">{{ article?.categoria | translate }}</span>
      </nav>

      <!-- Botó de retorn ràpid -->
      <div class="back-action-bar">
        <a [routerLink]="getNavUrl('/blog')" class="btn-back">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          <span>{{ 'BLOG.BACK_TO_BLOG' | translate }}</span>
        </a>
      </div>

      <!-- Contingut si l'article existeix -->
      <article class="article-full-view" *ngIf="article; else articleNoTrobat">
        <!-- Capçalera de l'article -->
        <header class="article-header">
          <div class="header-tags">
            <span class="category-badge">{{ article.categoria }}</span>
            <span class="sector-badge" *ngIf="article.sectorZona">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path>
                <path d="M2 12h20"></path>
              </svg>
              {{ article.sectorZona }}
            </span>
          </div>

          <h1 class="article-title">{{ article.titol }}</h1>
          <p class="article-subtitle">{{ article.subtitol }}</p>

          <!-- Dades de l'autor i metadades -->
          <div class="author-meta-card">
            <img [src]="article.autor.avatar" [alt]="article.autor.nom" class="author-avatar" />
            <div class="author-details">
              <span class="author-name">{{ article.autor.nom }}</span>
              <span class="author-role">{{ article.autor.carrec }}</span>
            </div>
            <div class="reading-meta">
              <span class="meta-item">
                <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
                {{ article.data }}
              </span>
              <span class="meta-item">
                <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                {{ article.tempsLectura }}
              </span>
            </div>
          </div>
        </header>

        <!-- Imatge destacada -->
        <figure class="article-hero-media">
          <img [src]="article.imatge" [alt]="article.titol" class="article-hero-img" />
          <figcaption *ngIf="article.imatgePeu" class="article-img-caption">
            {{ article.imatgePeu }}
          </figcaption>
        </figure>

        <!-- Caixa de resum executiu -->
        <div class="executive-summary-card">
          <div class="summary-icon">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
          </div>
          <div class="summary-body">
            <strong>{{ 'BLOG.SUMMARY_TITLE' | translate }}</strong>
            <p>{{ article.resum }}</p>
          </div>
        </div>

        <!-- Seccions de contingut -->
        <div class="article-sections-container">
          <section class="article-section" *ngFor="let sec of article.seccions">
            <h2 class="section-title">{{ sec.subtitol }}</h2>

            <div class="section-paragraphs">
              <p *ngFor="let p of sec.paragrafs" [innerHTML]="formatParagraph(p)"></p>
            </div>

            <!-- Punts clau / Checklist -->
            <div class="key-points-box" *ngIf="sec.puntsClau && sec.puntsClau.length > 0">
              <h3 class="key-points-title">{{ 'BLOG.TIPS_TITLE' | translate }}</h3>
              <ul class="key-points-list">
                <li *ngFor="let pt of sec.puntsClau">
                  <span class="check-icon">✓</span>
                  <span>{{ pt }}</span>
                </li>
              </ul>
            </div>

            <!-- Taula de preus orientatius -->
            <div class="price-table-wrapper" *ngIf="sec.taulaPreus && sec.taulaPreus.length > 0">
              <h3 class="table-title">{{ 'BLOG.TABLE_TITLE' | translate }}</h3>
              <div class="price-table-responsive">
                <table class="price-table">
                  <thead>
                    <tr>
                      <th>{{ 'BLOG.TABLE_COL_JOB' | translate }}</th>
                      <th>{{ 'BLOG.TABLE_COL_PRICE' | translate }}</th>
                      <th>{{ 'BLOG.TABLE_COL_NOTES' | translate }}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let row of sec.taulaPreus">
                      <td class="col-concept"><strong>{{ row.concepte }}</strong></td>
                      <td class="col-price"><span class="price-tag">{{ row.preuAproximat }}</span></td>
                      <td class="col-advice">{{ row.consell }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Consell destacat -->
            <div class="tip-callout-card" *ngIf="sec.destacatConsell">
              <div class="tip-icon">💡</div>
              <div class="tip-text">
                <strong>{{ 'BLOG.TIP_RECOMMENDATION' | translate }}</strong> {{ sec.destacatConsell }}
              </div>
            </div>
          </section>
        </div>

        <!-- Etiquetes / Tags de cerca -->
        <div class="article-tags-footer" *ngIf="article.tags && article.tags.length > 0">
          <span class="tags-label">{{ 'BLOG.RELATED_TOPICS' | translate }}</span>
          <div class="tags-list">
            <span class="tag-pill" *ngFor="let tag of article.tags">#{{ tag }}</span>
          </div>
        </div>

        <!-- Banner de Conversió / Crida a l'acció (CTA) -->
        <section class="conversion-banner">
          <div class="banner-content">
            <span class="banner-badge">{{ 'BLOG.CTA_BANNER_BADGE' | translate }}</span>
            <h2>{{ 'BLOG.CTA_BANNER_TITLE' | translate }}</h2>
            <p>{{ 'BLOG.CTA_BANNER_DESC' | translate }}</p>
            <div class="banner-buttons">
              <button type="button" class="btn-cta-primary" (click)="anarCrearTasca()">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                <span>{{ 'BLOG.CTA_BANNER_BTN_TASK' | translate }}</span>
              </button>
              <a [routerLink]="getNavUrl('/tasques-ofertes')" class="btn-cta-secondary">
                <span>{{ 'BLOG.CTA_BANNER_BTN_OFFERS' | translate }}</span>
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </a>
            </div>
          </div>
        </section>

        <!-- Articles relacionats -->
        <section class="related-articles-section" *ngIf="articlesRelacionats.length > 0">
          <div class="related-header">
            <h3>{{ 'BLOG.RELATED_ARTICLES_TITLE' | translate }}</h3>
            <a [routerLink]="getNavUrl('/blog')" class="link-all-articles">{{ 'HOME.VIEW_ALL_ARTICLES' | translate }}</a>
          </div>
          <div class="related-grid">
            <article class="related-card" *ngFor="let rel of articlesRelacionats" [routerLink]="[getNavUrl('/article'), rel.id]" (click)="carregarArticle(rel.id)">
              <div class="related-media">
                <img [src]="rel.imatge" [alt]="rel.titol" loading="lazy" />
                <span class="related-cat">{{ rel.categoria | translate }}</span>
              </div>
              <div class="related-body">
                <span class="related-time">{{ rel.tempsLectura }}</span>
                <h4>{{ rel.titol }}</h4>
                <p>{{ rel.resum }}</p>
                <span class="related-read-more">{{ 'HOME.READ_MORE' | translate }}</span>
              </div>
            </article>
          </div>
        </section>
      </article>

      <!-- Estat si l'article no s'ha trobat -->
      <ng-template #articleNoTrobat>
        <div class="article-not-found-card">
          <div class="not-found-icon">🔍</div>
          <h2>{{ 'BLOG.NOT_FOUND_TITLE' | translate }}</h2>
          <p>{{ 'BLOG.NOT_FOUND_DESC' | translate }}</p>
          <a [routerLink]="getNavUrl('/inici')" class="btn-back-home">{{ 'NAV.INICI' | translate }}</a>
        </div>
      </ng-template>
    </main>
  `,
  styles: [`
    .article-page-container {
      max-width: 960px;
      margin: 0 auto;
      padding: 1rem 1rem 5rem;
      color: #0c0c10;
      font-family: inherit;
    }

    /* Fil d'Ariadna */
    .breadcrumb-nav {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.85rem;
      color: #716f67;
      margin-bottom: 1.25rem;
    }
    .breadcrumb-link {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      color: #716f67;
      text-decoration: none;
      transition: color 0.2s;
    }
    .breadcrumb-link:hover {
      color: #ff1744;
    }
    .breadcrumb-separator {
      color: #a8a49c;
    }
    .breadcrumb-current {
      color: #0c0c10;
      font-weight: 700;
    }

    /* Barra de tornada */
    .back-action-bar {
      margin-bottom: 1.75rem;
    }
    .btn-back {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.55rem 1.15rem;
      background: #ffffff;
      border: 1px solid #ded8cd;
      border-radius: 8px;
      color: #0c0c10;
      font-size: 0.9rem;
      font-weight: 700;
      text-decoration: none;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
      transition: all 0.2s ease;
    }
    .btn-back:hover {
      background: #ffffff;
      border-color: #ff1744;
      color: #ff1744;
      transform: translateX(-3px);
      box-shadow: 0 4px 14px rgba(255, 23, 68, 0.15);
    }

    /* Targeta d'article complet */
    .article-full-view {
      background: #ffffff;
      border: 1px solid #e5e0d7;
      border-radius: 20px;
      padding: 3rem 2.75rem;
      box-shadow: 0 6px 30px rgba(0, 0, 0, 0.04);
    }

    /* Capçalera de l'article */
    .article-header {
      margin-bottom: 2rem;
    }
    .header-tags {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 0.6rem;
      margin-bottom: 1.25rem;
    }
    .category-badge {
      display: inline-block;
      padding: 0.35rem 0.85rem;
      background: #ff1744;
      color: #ffffff;
      font-size: 0.75rem;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      border-radius: 6px;
    }
    .sector-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.35rem 0.85rem;
      background: #f4f0e8;
      border: 1px solid #ded8cd;
      color: #232220;
      font-size: 0.75rem;
      font-weight: 700;
      border-radius: 6px;
    }
    .article-title {
      font-size: 2.35rem;
      line-height: 1.22;
      font-weight: 900;
      color: #09090c;
      margin: 0.5rem 0 1rem;
      letter-spacing: -0.025em;
    }
    .article-subtitle {
      font-size: 1.15rem;
      line-height: 1.6;
      color: #555249;
      margin: 0 0 1.75rem;
      font-weight: 500;
    }

    /* Metadades de l'autor */
    .author-meta-card {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 1.25rem;
      padding: 1rem 1.35rem;
      background: #faf8f4;
      border: 1px solid #e8e3d8;
      border-radius: 12px;
    }
    .author-avatar {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      object-fit: cover;
      border: 2px solid #ff1744;
    }
    .author-details {
      display: flex;
      flex-direction: column;
      flex: 1;
      min-width: 180px;
    }
    .author-name {
      font-weight: 800;
      font-size: 1rem;
      color: #09090c;
    }
    .author-role {
      font-size: 0.82rem;
      color: #716f67;
      font-weight: 600;
    }
    .reading-meta {
      display: flex;
      align-items: center;
      gap: 1.25rem;
      font-size: 0.85rem;
      color: #716f67;
      font-weight: 600;
    }
    .meta-item {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
    }

    /* Imatge Hero */
    .article-hero-media {
      margin: 2rem 0;
    }
    .article-hero-img {
      width: 100%;
      max-height: 480px;
      object-fit: cover;
      border-radius: 14px;
      border: 1px solid #ded8cd;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
    }
    .article-img-caption {
      font-size: 0.82rem;
      color: #716f67;
      margin-top: 0.6rem;
      text-align: center;
      font-style: italic;
    }

    /* Resum executiu */
    .executive-summary-card {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
      background: #fff8f8;
      border-left: 4px solid #ff1744;
      border: 1px solid #fecdd3;
      border-radius: 12px;
      padding: 1.25rem 1.5rem;
      margin: 2.25rem 0;
    }
    .summary-icon {
      color: #ff1744;
      flex-shrink: 0;
      margin-top: 2px;
    }
    .summary-body strong {
      display: block;
      color: #ff1744;
      font-size: 0.92rem;
      font-weight: 900;
      margin-bottom: 0.35rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .summary-body p {
      margin: 0;
      font-size: 1.02rem;
      line-height: 1.65;
      color: #09090c;
      font-weight: 600;
    }

    /* Seccions */
    .article-section {
      margin-bottom: 3rem;
    }
    .section-title {
      font-size: 1.55rem;
      font-weight: 900;
      color: #09090c;
      margin: 0 0 1.15rem;
      letter-spacing: -0.02em;
      border-bottom: 2px solid #eee9e0;
      padding-bottom: 0.65rem;
    }
    .section-paragraphs p {
      font-size: 1.05rem;
      line-height: 1.82;
      color: #262522;
      font-weight: 500;
      margin-bottom: 1.25rem;
    }

    /* Punts clau / Checklist */
    .key-points-box {
      background: #faf8f4;
      border: 1px solid #e5e0d7;
      border-radius: 12px;
      padding: 1.35rem 1.6rem;
      margin: 1.75rem 0;
    }
    .key-points-title {
      font-size: 1.05rem;
      font-weight: 800;
      color: #09090c;
      margin: 0 0 0.85rem;
    }
    .key-points-list {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      flex-direction: column;
      gap: 0.65rem;
    }
    .key-points-list li {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      font-size: 0.98rem;
      line-height: 1.55;
      color: #262522;
      font-weight: 500;
    }
    .check-icon {
      color: #059669;
      font-weight: 900;
      font-size: 1.15rem;
      line-height: 1;
    }

    /* Taula de preus */
    .price-table-wrapper {
      margin: 2.25rem 0;
    }
    .table-title {
      font-size: 1.15rem;
      font-weight: 800;
      color: #09090c;
      margin-bottom: 0.85rem;
    }
    .price-table-responsive {
      overflow-x: auto;
      border-radius: 12px;
      border: 1px solid #e2ddd3;
    }
    .price-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
      font-size: 0.93rem;
      background: #ffffff;
    }
    .price-table th {
      background: #09090c;
      color: #f7f3ed;
      padding: 0.95rem 1.1rem;
      font-weight: 800;
      border-bottom: 2px solid #ff1744;
      white-space: nowrap;
    }
    .price-table td {
      padding: 0.9rem 1.1rem;
      border-bottom: 1px solid #eee9e0;
      vertical-align: middle;
      color: #262522;
    }
    .price-table tr:last-child td {
      border-bottom: none;
    }
    .col-concept {
      color: #09090c;
      font-weight: 700;
      min-width: 220px;
    }
    .col-price {
      white-space: nowrap;
    }
    .price-tag {
      display: inline-block;
      background: rgba(255, 23, 68, 0.08);
      color: #ff1744;
      border: 1px solid rgba(255, 23, 68, 0.25);
      padding: 0.3rem 0.65rem;
      border-radius: 6px;
      font-weight: 900;
      font-size: 0.92rem;
    }
    .col-advice {
      color: #555249;
      font-size: 0.88rem;
      line-height: 1.45;
    }

    /* Consell destacat */
    .tip-callout-card {
      display: flex;
      align-items: flex-start;
      gap: 0.85rem;
      background: #fffbeb;
      border-left: 4px solid #f59e0b;
      border: 1px solid #fde68a;
      padding: 1.1rem 1.35rem;
      border-radius: 10px;
      margin: 1.75rem 0;
      font-size: 0.96rem;
      line-height: 1.6;
      color: #78350f;
    }
    .tip-icon {
      font-size: 1.35rem;
      flex-shrink: 0;
    }
    .tip-text strong {
      color: #b45309;
      font-weight: 800;
    }

    /* Tags */
    .article-tags-footer {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 0.75rem;
      padding: 1.35rem 0;
      border-top: 1px solid #eee9e0;
      margin-bottom: 3rem;
    }
    .tags-label {
      font-size: 0.88rem;
      color: #716f67;
      font-weight: 700;
    }
    .tags-list {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }
    .tag-pill {
      background: #f4f0e8;
      border: 1px solid #ded8cd;
      color: #232220;
      padding: 0.28rem 0.7rem;
      border-radius: 6px;
      font-size: 0.8rem;
      font-weight: 700;
      transition: all 0.2s ease;
    }
    .tag-pill:hover {
      border-color: #ff1744;
      color: #ff1744;
    }

    /* Banner CTA */
    .conversion-banner {
      background: #09090c;
      border: 1px solid #1f1f28;
      border-radius: 16px;
      padding: 2.75rem 2.25rem;
      text-align: center;
      margin-bottom: 3.5rem;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
    }
    .banner-badge {
      display: inline-block;
      padding: 0.35rem 0.9rem;
      background: rgba(255, 23, 68, 0.18);
      color: #ff1744;
      font-size: 0.78rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      border-radius: 20px;
      margin-bottom: 1rem;
    }
    .conversion-banner h2 {
      font-size: 1.8rem;
      color: #ffffff;
      font-weight: 900;
      margin: 0 0 0.85rem;
      line-height: 1.3;
    }
    .conversion-banner p {
      font-size: 1.05rem;
      color: #cbd5e1;
      max-width: 650px;
      margin: 0 auto 1.85rem;
      line-height: 1.6;
    }
    .banner-buttons {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 1rem;
    }
    .btn-cta-primary {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.8rem 1.75rem;
      background: #ff1744;
      color: #ffffff;
      border: none;
      border-radius: 8px;
      font-size: 0.95rem;
      font-weight: 900;
      cursor: pointer;
      transition: all 0.2s ease;
      box-shadow: 0 4px 15px rgba(255, 23, 68, 0.35);
    }
    .btn-cta-primary:hover {
      background: #d50000;
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(255, 23, 68, 0.5);
    }
    .btn-cta-secondary {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.8rem 1.75rem;
      background: #1e1e28;
      color: #f1f5f9;
      border: 1px solid #38384a;
      border-radius: 8px;
      font-size: 0.95rem;
      font-weight: 700;
      text-decoration: none;
      transition: all 0.2s ease;
    }
    .btn-cta-secondary:hover {
      background: #2a2a3a;
      border-color: #ff1744;
      color: #ff1744;
    }

    /* Articles relacionats */
    .related-articles-section {
      margin-top: 3.5rem;
      border-top: 1px solid #e5e0d7;
      padding-top: 2.5rem;
    }
    .related-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1.75rem;
    }
    .related-header h3 {
      font-size: 1.4rem;
      font-weight: 900;
      color: #09090c;
      margin: 0;
    }
    .link-all-articles {
      color: #ff1744;
      text-decoration: none;
      font-size: 0.88rem;
      font-weight: 800;
    }
    .link-all-articles:hover {
      text-decoration: underline;
    }
    .related-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 1.5rem;
    }
    .related-card {
      background: #ffffff;
      border: 1px solid #e5e0d7;
      border-radius: 14px;
      overflow: hidden;
      text-decoration: none;
      color: inherit;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.03);
      transition: all 0.25s ease;
    }
    .related-card:hover {
      border-color: #ff1744;
      transform: translateY(-4px);
      box-shadow: 0 12px 28px rgba(0, 0, 0, 0.08);
    }
    .related-media {
      position: relative;
      height: 160px;
    }
    .related-media img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .related-cat {
      position: absolute;
      top: 10px;
      left: 10px;
      background: #09090c;
      color: #f7f3ed;
      font-size: 0.7rem;
      font-weight: 900;
      text-transform: uppercase;
      padding: 0.25rem 0.55rem;
      border-radius: 4px;
      border: 1px solid rgba(255, 23, 68, 0.4);
    }
    .related-body {
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      flex: 1;
    }
    .related-time {
      font-size: 0.78rem;
      color: #716f67;
      font-weight: 700;
      margin-bottom: 0.5rem;
    }
    .related-body h4 {
      font-size: 1.08rem;
      font-weight: 800;
      color: #09090c;
      line-height: 1.4;
      margin: 0 0 0.6rem;
    }
    .related-body p {
      font-size: 0.88rem;
      line-height: 1.55;
      color: #555249;
      margin: 0 0 1rem;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .related-read-more {
      margin-top: auto;
      font-size: 0.85rem;
      font-weight: 800;
      color: #ff1744;
    }

    /* Not found */
    .article-not-found-card {
      text-align: center;
      padding: 4rem 1.5rem;
      background: #ffffff;
      border: 1px solid #e5e0d7;
      border-radius: 16px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
    }
    .not-found-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
    }
    .article-not-found-card h2 {
      font-size: 1.75rem;
      color: #09090c;
      font-weight: 900;
      margin-bottom: 0.5rem;
    }
    .article-not-found-card p {
      color: #555249;
      margin-bottom: 1.5rem;
    }
    .btn-back-home {
      display: inline-block;
      padding: 0.75rem 1.6rem;
      background: #ff1744;
      color: #ffffff;
      text-decoration: none;
      font-weight: 800;
      border-radius: 8px;
    }

    @media (max-width: 768px) {
      .article-full-view {
        padding: 1.75rem 1.25rem;
        border-radius: 14px;
      }
      .article-title {
        font-size: 1.75rem;
      }
      .author-meta-card {
        flex-direction: column;
        align-items: flex-start;
      }
      .conversion-banner {
        padding: 1.75rem 1.25rem;
      }
      .conversion-banner h2 {
        font-size: 1.35rem;
      }
      .banner-buttons {
        flex-direction: column;
      }
      .btn-cta-primary, .btn-cta-secondary {
        width: 100%;
        justify-content: center;
      }
    }
  `]
})
export class ArticleDetallComponent implements OnInit {
  currentId?: string | number;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly articleService: ArticleService,
    private readonly authService: AuthService
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

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.currentId = id;
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }

  get article(): Article | undefined {
    return this.currentId ? this.articleService.getArticleById(this.currentId) : undefined;
  }

  get articlesRelacionats(): Article[] {
    return this.currentId ? this.articleService.getArticlesRelacionats(this.currentId, 3) : [];
  }

  carregarArticle(id: string | number): void {
    this.currentId = id;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  formatParagraph(text: string): string {
    // Permet formatar negreta senzilla (**text**)
    return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  }

  anarCrearTasca(): void {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate([this.getNavUrl('/login')], {
        queryParams: {
          message: 'Inicia sessió o crea un compte per publicar la teva tasca.',
          returnUrl: this.getNavUrl('/client/crear-tasca')
        }
      });
      return;
    }
    this.router.navigate([this.getNavUrl('/client/crear-tasca')]);
  }
}

