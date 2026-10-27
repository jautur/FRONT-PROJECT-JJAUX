import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ArticleService } from '../../services/article.service';
import { Article } from '../../models/article.model';
import { TranslationService } from '../../core/services/translation.service';
import { TranslatePipe } from '../../core/pipes/translate.pipe';

/**
 * Pàgina dedicada al Blog i Guies Tècniques (/blog).
 * Permet consultar la totalitat d'articles, filtrar per categoria,
 * cercar per text clau o etiquetes, i navegar cap al detall de cada article.
 */
@Component({
  selector: 'app-blog',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, TranslatePipe],
  template: `
    <div class="blog-page-container">
      <!-- Capçalera i Breadcrumbs -->
      <nav class="blog-breadcrumbs" aria-label="Navegació secundària">
        <a [routerLink]="getNavUrl('/inici')" class="breadcrumb-link">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
          {{ 'BLOG.BREADCRUMB_HOME' | translate }}
        </a>
        <span class="breadcrumb-separator">/</span>
        <span class="breadcrumb-current">{{ 'BLOG.BREADCRUMB_BLOG' | translate }}</span>
      </nav>

      <!-- Hero del Blog -->
      <header class="blog-hero">
        <div class="hero-badge">
          <span class="badge-dot"></span>
          {{ 'BLOG.HERO_BADGE' | translate }}
        </div>
        <h1 class="hero-title">{{ 'BLOG.HERO_TITLE' | translate }}</h1>
        <p class="hero-subtitle">
          {{ 'BLOG.HERO_SUBTITLE' | translate }}
        </p>

        <!-- Barra de cerca i filtres -->
        <div class="blog-search-bar">
          <div class="search-input-wrapper">
            <svg class="search-icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input
              type="text"
              class="search-input"
              [(ngModel)]="termeCerca"
              [placeholder]="'BLOG.SEARCH_PLACEHOLDER' | translate"
              aria-label="Cercar articles al blog"
            />
            <button
              *ngIf="termeCerca"
              class="btn-clear-search"
              (click)="termeCerca = ''"
              [title]="'BLOG.CLEAR_SEARCH' | translate"
              type="button"
            >
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>

        <!-- Filtre de categories -->
        <div class="categories-nav">
          <button
            type="button"
            class="category-pill"
            [class.active]="categoriaSeleccionada === 'Totes'"
            (click)="seleccionarCategoria('Totes')"
          >
            {{ 'BLOG.ALL_ARTICLES' | translate }} ({{ articles.length }})
          </button>
          <button
            *ngFor="let cat of categoriesDisponibles"
            type="button"
            class="category-pill"
            [class.active]="categoriaSeleccionada === cat"
            (click)="seleccionarCategoria(cat)"
          >
            {{ cat | translate }}
          </button>
        </div>
      </header>

      <!-- Article Destacat (si no hi ha cerca activa) -->
      <section class="featured-section" *ngIf="articleDestacat && !termeCerca && categoriaSeleccionada === 'Totes'">
        <div class="featured-card">
          <div class="featured-media" [routerLink]="[getNavUrl('/article'), articleDestacat.id]">
            <img [src]="articleDestacat.imatge" [alt]="articleDestacat.titol" loading="lazy" />
            <span class="featured-badge">{{ 'BLOG.FEATURED_BADGE' | translate }}</span>
          </div>
          <div class="featured-content">
            <div class="featured-meta">
              <span class="category-tag">{{ articleDestacat.categoria | translate }}</span>
              <span class="meta-dot">•</span>
              <span class="meta-item">{{ articleDestacat.data }}</span>
              <span class="meta-dot">•</span>
              <span class="meta-item">{{ articleDestacat.tempsLectura }}</span>
            </div>
            <h2 class="featured-title" [routerLink]="[getNavUrl('/article'), articleDestacat.id]">
              {{ articleDestacat.titol }}
            </h2>
            <p class="featured-excerpt">{{ articleDestacat.resum }}</p>
            <div class="featured-footer">
              <div class="author-block">
                <img [src]="articleDestacat.autor.avatar" [alt]="articleDestacat.autor.nom" class="author-avatar" />
                <div class="author-info">
                  <span class="author-name">{{ articleDestacat.autor.nom }}</span>
                  <span class="author-role">{{ articleDestacat.autor.carrec }}</span>
                </div>
              </div>
              <a [routerLink]="[getNavUrl('/article'), articleDestacat.id]" class="btn-read-featured">
                <span>{{ 'HOME.READ_MORE' | translate }}</span>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </section>

      <!-- Llistat de tots els articles -->
      <section class="articles-grid-section">
        <div class="section-results-header">
          <h2>
            {{ getTitolResultats() }}
            <span class="results-count">({{ articlesFiltrats.length }})</span>
          </h2>
          <span *ngIf="termeCerca || categoriaSeleccionada !== 'Totes'" class="active-filter-label">
            Filtres actius: 
            <strong>{{ categoriaSeleccionada !== 'Totes' ? (categoriaSeleccionada | translate) : '' }}</strong>
            <span *ngIf="termeCerca"> «{{ termeCerca }}»</span>
            <button class="btn-reset-filters" (click)="resetFiltres()" type="button">{{ 'TASQUES_OFERTES.RESET_FILTERS' | translate }}</button>
          </span>
        </div>

        <div class="articles-grid" *ngIf="articlesFiltrats.length > 0">
          <article class="article-card" *ngFor="let a of articlesFiltrats">
            <div class="card-media" [routerLink]="[getNavUrl('/article'), a.id]">
              <img [src]="a.imatge" [alt]="a.titol" loading="lazy" />
              <span class="card-category-tag">{{ a.categoria | translate }}</span>
            </div>
            <div class="card-body">
              <div class="card-meta">
                <span class="meta-date">{{ a.data }}</span>
                <span class="meta-dot">•</span>
                <span class="meta-read">{{ a.tempsLectura }}</span>
              </div>
              <h3 class="card-title" [routerLink]="[getNavUrl('/article'), a.id]">
                {{ a.titol }}
              </h3>
              <p class="card-summary">{{ a.resum }}</p>
              
              <!-- Etiquetes / Tags ràpids -->
              <div class="card-tags" *ngIf="a.tags && a.tags.length > 0">
                <span
                  class="tag-pill"
                  *ngFor="let t of a.tags.slice(0, 3)"
                  (click)="filtrarPerTag(t, $event)"
                  title="Filtrar per #{{ t }}"
                >
                  #{{ t }}
                </span>
              </div>

              <div class="card-footer">
                <div class="card-author">
                  <img [src]="a.autor.avatar" [alt]="a.autor.nom" class="author-mini-avatar" />
                  <span class="author-mini-name">{{ a.autor.nom }}</span>
                </div>
                <a [routerLink]="[getNavUrl('/article'), a.id]" class="btn-read-more" title="Llegir article">
                  {{ 'COMMON.DETALL' | translate }} →
                </a>
              </div>
            </div>
          </article>
        </div>

        <!-- Estat buit quan cap article coincideix amb la cerca -->
        <div class="empty-results-box" *ngIf="articlesFiltrats.length === 0">
          <div class="empty-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </div>
          <h3>{{ 'BLOG.NO_ARTICLES_TITLE' | translate }}</h3>
          <p>{{ 'BLOG.NO_ARTICLES_SUB' | translate }}</p>
          <button type="button" class="btn-primary" (click)="resetFiltres()">
            {{ 'BLOG.RESET_SEARCH' | translate }}
          </button>
        </div>
      </section>

      <!-- Banner de crida a l'acció (CTA) cap a les tasques i ofertes -->
      <section class="blog-cta-banner">
        <div class="cta-content">
          <span class="cta-tag">{{ 'BLOG.CTA_BANNER_BADGE' | translate }}</span>
          <h2>{{ 'BLOG.CTA_BANNER_TITLE' | translate }}</h2>
          <p>
            {{ 'BLOG.CTA_BANNER_DESC' | translate }}
          </p>
          <div class="cta-actions">
            <a [routerLink]="getNavUrl('/tasques-ofertes')" [queryParams]="{ tipus: 'incidencies', accio: 'crear-incidencia' }" class="btn-cta-primary">{{ 'BLOG.CTA_BANNER_BTN_TASK' | translate }}</a>
            <a [routerLink]="getNavUrl('/tasques-ofertes')" class="btn-cta-secondary">{{ 'BLOG.CTA_BANNER_BTN_OFFERS' | translate }}</a>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .blog-page-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 1.5rem 1.25rem 4rem;
      font-family: inherit;
    }

    /* Breadcrumbs */
    .blog-breadcrumbs {
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
      color: var(--color-text, #09090c);
      font-weight: 700;
    }

    /* Hero */
    .blog-hero {
      text-align: center;
      max-width: 860px;
      margin: 0 auto 3rem;
    }
    .hero-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      background: rgba(255, 23, 68, 0.08);
      color: #ff1744;
      padding: 0.35rem 0.9rem;
      border-radius: 9999px;
      font-size: 0.82rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      margin-bottom: 1.25rem;
    }
    .badge-dot {
      width: 7px;
      height: 7px;
      background: #ff1744;
      border-radius: 50%;
    }
    .hero-title {
      font-size: 2.6rem;
      font-weight: 900;
      color: var(--color-text, #09090c);
      line-height: 1.15;
      margin: 0 0 1rem;
      letter-spacing: -0.03em;
    }
    .hero-subtitle {
      font-size: 1.12rem;
      color: var(--color-text-muted, #636058);
      line-height: 1.6;
      margin: 0 0 2rem;
      font-weight: 500;
    }

    /* Cerca */
    .blog-search-bar {
      margin-bottom: 1.75rem;
    }
    .search-input-wrapper {
      position: relative;
      max-width: 650px;
      margin: 0 auto;
    }
    .search-icon {
      position: absolute;
      left: 1.15rem;
      top: 50%;
      transform: translateY(-50%);
      color: #8c8980;
      pointer-events: none;
    }
    .search-input {
      width: 100%;
      box-sizing: border-box;
      padding: 0.95rem 2.85rem 0.95rem 3.1rem;
      border: 2px solid #e5e0d7;
      border-radius: 9999px;
      font-size: 1rem;
      font-weight: 500;
      color: var(--color-text, #09090c);
      background: var(--bg-card, #ffffff);
      transition: all var(--transition-fast, 0.2s ease);
      box-shadow: var(--shadow-sm, 0 4px 20px rgba(0, 0, 0, 0.04));
    }
    .search-input:focus {
      outline: none;
      border-color: #ff1744;
      box-shadow: 0 6px 24px rgba(255, 23, 68, 0.15);
    }
    .btn-clear-search {
      position: absolute;
      right: 1.1rem;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      font-size: 1.1rem;
      color: var(--color-text-dim, #8c8980);
      cursor: pointer;
      padding: 0.25rem;
      line-height: 1;
    }
    .btn-clear-search:hover {
      color: var(--color-text, #09090c);
    }

    /* Píndoles de categories */
    .categories-nav {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 0.65rem;
    }
    .category-pill {
      background: var(--bg-card, #ffffff);
      border: 1px solid var(--border-subtle, #d6d0c4);
      padding: 0.5rem 1.1rem;
      border-radius: var(--radius-full, 9999px);
      font-size: 0.88rem;
      font-weight: 800;
      color: var(--color-text-muted, #636058);
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .category-pill:hover {
      border-color: #ff1744;
      color: #09090c;
      transform: translateY(-1px);
    }
    .category-pill.active {
      background: #ff1744;
      border-color: #ff1744;
      color: #ffffff;
      box-shadow: 0 4px 14px rgba(255, 23, 68, 0.35);
    }

    /* Article Destacat */
    .featured-section {
      margin-bottom: 3.5rem;
    }
    .featured-card {
      display: grid;
      grid-template-columns: 1.1fr 1fr;
      background: var(--bg-card, #ffffff);
      border: 1px solid var(--border-subtle, #e5e0d7);
      border-radius: var(--radius-lg, 16px);
      overflow: hidden;
      box-shadow: var(--shadow-md, 0 8px 30px rgba(0, 0, 0, 0.06));
      transition: transform var(--transition-fast, 0.25s ease), box-shadow var(--transition-fast, 0.25s ease);
    }
    .featured-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 14px 40px rgba(0, 0, 0, 0.1);
    }
    .featured-media {
      position: relative;
      cursor: pointer;
      overflow: hidden;
      min-height: 320px;
    }
    .featured-media img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
      transition: transform 0.4s ease;
    }
    .featured-card:hover .featured-media img {
      transform: scale(1.04);
    }
    .featured-badge {
      position: absolute;
      top: 1rem;
      left: 1rem;
      background: #09090c;
      color: #ffffff;
      padding: 0.35rem 0.85rem;
      border-radius: 9999px;
      font-size: 0.78rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }
    .featured-content {
      padding: 2.25rem 2rem;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .featured-meta {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.82rem;
      color: #8c8980;
      margin-bottom: 0.85rem;
      font-weight: 600;
    }
    .category-tag {
      background: rgba(255, 23, 68, 0.08);
      color: #ff1744;
      padding: 0.25rem 0.65rem;
      border-radius: 6px;
      font-weight: 800;
      font-size: 0.75rem;
      text-transform: uppercase;
    }
    .meta-dot {
      color: #d6d0c4;
    }
    .featured-title {
      font-size: 1.65rem;
      font-weight: 900;
      color: var(--color-text, #09090c);
      line-height: 1.25;
      margin: 0 0 1rem;
      cursor: pointer;
      letter-spacing: -0.02em;
      transition: color 0.2s ease;
    }
    .featured-title:hover {
      color: #ff1744;
    }
    .featured-excerpt {
      font-size: 0.98rem;
      color: var(--color-text-muted, #636058);
      line-height: 1.6;
      margin: 0 0 1.5rem;
      font-weight: 500;
    }
    .featured-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      border-top: 1px solid #f0ece1;
      padding-top: 1.25rem;
      flex-wrap: wrap;
    }
    .author-block {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .author-avatar {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      object-fit: cover;
      border: 2px solid #ff1744;
    }
    .author-info {
      display: flex;
      flex-direction: column;
    }
    .author-name {
      font-size: 0.92rem;
      font-weight: 800;
      color: #09090c;
    }
    .author-role {
      font-size: 0.78rem;
      color: #8c8980;
      font-weight: 500;
    }
    .btn-read-featured {
      display: inline-flex;
      align-items: center;
      gap: 0.45rem;
      background: #ff1744;
      color: #ffffff;
      padding: 0.65rem 1.25rem;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 800;
      font-size: 0.88rem;
      transition: all 0.2s ease;
      box-shadow: 0 4px 14px rgba(255, 23, 68, 0.3);
    }
    .btn-read-featured:hover {
      background: #09090c;
      transform: translateY(-2px);
    }

    /* Secció Grid */
    .articles-grid-section {
      margin-bottom: 4rem;
    }
    .section-results-header {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      margin-bottom: 1.75rem;
      flex-wrap: wrap;
      gap: 1rem;
      border-bottom: 2px solid #f0ece1;
      padding-bottom: 0.75rem;
    }
    .section-results-header h2 {
      font-size: 1.5rem;
      font-weight: 900;
      color: var(--color-text, #09090c);
      margin: 0;
    }
    .results-count {
      color: var(--color-text-dim, #8c8980);
      font-weight: 700;
    }
    .active-filter-label {
      font-size: 0.88rem;
      color: var(--color-text-muted, #636058);
    }
    .btn-reset-filters {
      background: none;
      border: none;
      color: #ff1744;
      font-weight: 800;
      text-decoration: underline;
      cursor: pointer;
      margin-left: 0.5rem;
      padding: 0;
    }

    .articles-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(min(100%, 280px), 1fr));
      gap: 1.75rem;
    }
    .article-card {
      background: var(--bg-card, #ffffff);
      border: 1px solid var(--border-subtle, #e5e0d7);
      border-radius: var(--radius-md, 14px);
      overflow: hidden;
      display: flex;
      flex-direction: column;
      box-shadow: var(--shadow-sm, 0 4px 18px rgba(0, 0, 0, 0.04));
      transition: all var(--transition-fast, 0.25s ease);
    }
    .article-card:hover {
      transform: translateY(-4px);
      box-shadow: var(--shadow-hover, 0 10px 28px rgba(0, 0, 0, 0.09));
      border-color: #ff1744;
    }
    .card-media {
      position: relative;
      height: 200px;
      cursor: pointer;
      overflow: hidden;
      background: #f4efe6;
    }
    .card-media img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
      transition: transform 0.35s ease;
    }
    .article-card:hover .card-media img {
      transform: scale(1.05);
    }
    .card-category-tag {
      position: absolute;
      top: 0.85rem;
      left: 0.85rem;
      background: rgba(9, 9, 12, 0.85);
      color: #ffffff;
      padding: 0.25rem 0.65rem;
      border-radius: 6px;
      font-size: 0.72rem;
      font-weight: 800;
      text-transform: uppercase;
      backdrop-filter: blur(4px);
    }

    .card-body {
      padding: 1.35rem 1.25rem;
      display: flex;
      flex-direction: column;
      flex-grow: 1;
    }
    .card-meta {
      display: flex;
      align-items: center;
      gap: 0.45rem;
      font-size: 0.8rem;
      color: var(--color-text-dim, #8c8980);
      font-weight: 600;
      margin-bottom: 0.65rem;
    }
    .card-title {
      font-size: 1.18rem;
      font-weight: 800;
      color: var(--color-text, #09090c);
      line-height: 1.35;
      margin: 0 0 0.65rem;
      cursor: pointer;
      transition: color 0.2s ease;
    }
    .card-title:hover {
      color: #ff1744;
    }
    .card-summary {
      font-size: 0.9rem;
      color: var(--color-text-muted, #636058);
      line-height: 1.55;
      margin: 0 0 1rem;
      flex-grow: 1;
    }

    .card-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 0.4rem;
      margin-bottom: 1.1rem;
    }
    .tag-pill {
      background: #f7f5f0;
      color: #636058;
      font-size: 0.74rem;
      font-weight: 700;
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .tag-pill:hover {
      background: #ff1744;
      color: #ffffff;
    }

    .card-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-top: 1px solid #f0ece1;
      padding-top: 0.9rem;
      margin-top: auto;
    }
    .card-author {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
    }
    .author-mini-avatar {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      object-fit: cover;
    }
    .author-mini-name {
      font-size: 0.82rem;
      font-weight: 700;
      color: #09090c;
    }
    .btn-read-more {
      font-size: 0.85rem;
      font-weight: 800;
      color: #ff1744;
      text-decoration: none;
      transition: transform 0.2s ease;
    }
    .btn-read-more:hover {
      transform: translateX(3px);
    }

    /* Estat buit */
    .empty-results-box {
      text-align: center;
      padding: 4rem 1.5rem;
      background: #ffffff;
      border-radius: 16px;
      border: 1px dashed #d6d0c4;
      max-width: 600px;
      margin: 2rem auto;
    }
    .empty-icon {
      font-size: 3rem;
      margin-bottom: 0.75rem;
    }
    .empty-results-box h3 {
      font-size: 1.35rem;
      font-weight: 800;
      color: #09090c;
      margin: 0 0 0.5rem;
    }
    .empty-results-box p {
      font-size: 0.95rem;
      color: #636058;
      margin: 0 0 1.5rem;
    }
    .btn-primary {
      background: #ff1744;
      color: #ffffff;
      border: none;
      padding: 0.65rem 1.4rem;
      border-radius: 8px;
      font-weight: 800;
      font-size: 0.9rem;
      cursor: pointer;
      box-shadow: 0 4px 14px rgba(255, 23, 68, 0.35);
      transition: background 0.2s;
    }
    .btn-primary:hover {
      background: #09090c;
    }

    /* Banner CTA */
    .blog-cta-banner {
      background: linear-gradient(135deg, #09090c 0%, #1e1e24 100%);
      color: #ffffff;
      padding: 3.5rem 2rem;
      border-radius: 20px;
      text-align: center;
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
      margin-top: 2rem;
    }
    .cta-content {
      max-width: 780px;
      margin: 0 auto;
    }
    .cta-tag {
      display: inline-block;
      color: #ff1744;
      font-size: 0.85rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 0.85rem;
    }
    .blog-cta-banner h2 {
      font-size: 2rem;
      font-weight: 900;
      margin: 0 0 1rem;
      line-height: 1.25;
      letter-spacing: -0.02em;
    }
    .blog-cta-banner p {
      font-size: 1.05rem;
      color: #d6d0c4;
      line-height: 1.6;
      margin: 0 0 2rem;
    }
    .cta-actions {
      display: flex;
      justify-content: center;
      gap: 1rem;
      flex-wrap: wrap;
    }
    .btn-cta-primary {
      background: #ff1744;
      color: #ffffff;
      padding: 0.85rem 1.65rem;
      border-radius: 8px;
      font-weight: 800;
      font-size: 0.95rem;
      text-decoration: none;
      box-shadow: 0 4px 16px rgba(255, 23, 68, 0.4);
      transition: all 0.2s ease;
    }
    .btn-cta-primary:hover {
      background: #ffffff;
      color: #09090c;
      transform: translateY(-2px);
    }
    .btn-cta-secondary {
      background: rgba(255, 255, 255, 0.1);
      color: #ffffff;
      border: 1px solid rgba(255, 255, 255, 0.25);
      padding: 0.85rem 1.65rem;
      border-radius: 8px;
      font-weight: 800;
      font-size: 0.95rem;
      text-decoration: none;
      transition: all 0.2s ease;
    }
    .btn-cta-secondary:hover {
      background: rgba(255, 255, 255, 0.2);
      transform: translateY(-2px);
    }

    @media (max-width: 850px) {
      .blog-page-container {
        padding: 1rem 0.75rem 3.5rem;
      }
      .featured-card {
        grid-template-columns: 1fr;
      }
      .featured-media {
        min-height: 200px;
      }
      .featured-content {
        padding: 1.35rem 1rem;
      }
      .featured-title {
        font-size: 1.35rem;
      }
      .featured-footer {
        flex-direction: column;
        align-items: stretch;
        gap: 0.85rem;
      }
      .btn-read-featured {
        width: 100%;
        justify-content: center;
      }
      .hero-title {
        font-size: 1.65rem;
      }
      .hero-lead {
        font-size: 0.95rem;
      }
      .category-pill {
        font-size: 0.8rem;
        padding: 0.4rem 0.85rem;
      }
      .blog-cta-banner {
        padding: 2.25rem 1.15rem;
        border-radius: 14px;
      }
      .blog-cta-banner h2 {
        font-size: 1.45rem;
      }
      .cta-actions {
        flex-direction: column;
        width: 100%;
      }
      .btn-cta-primary, .btn-cta-secondary {
        width: 100%;
        text-align: center;
        justify-content: center;
      }
    }
  `]
})
export class BlogComponent implements OnInit {
  /** Categoria seleccionada pel filtre */
  categoriaSeleccionada = 'Totes';
  /** Terme de cerca introduït per l'usuari */
  termeCerca = '';

  constructor(
    private readonly articleService: ArticleService,
    private readonly translationService: TranslationService,
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

  ngOnInit(): void {}

  /** Llista completa d'articles adaptats a l'idioma seleccionat */
  get articles(): Article[] {
    return this.articleService.getArticles();
  }

  /** Article principal destacat */
  get articleDestacat(): Article | undefined {
    const list = this.articles;
    return list.length > 0 ? list[0] : undefined;
  }

  /** Llista de categories úniques detectades als articles */
  get categoriesDisponibles(): string[] {
    const cats = new Set<string>();
    for (const a of this.articles) {
      if (a.categoria) {
        cats.add(a.categoria);
      }
    }
    return Array.from(cats);
  }

  /**
   * Retorna els articles filtrats segons la cerca i categoria seleccionada.
   */
  get articlesFiltrats(): Article[] {
    let result = this.articles;

    // Filtre per categoria
    if (this.categoriaSeleccionada !== 'Totes') {
      result = result.filter(a => a.categoria.toLowerCase() === this.categoriaSeleccionada.toLowerCase());
    }

    // Filtre per terme de cerca
    if (this.termeCerca.trim()) {
      const q = this.termeCerca.trim().toLowerCase();
      result = result.filter(a =>
        a.titol.toLowerCase().includes(q) ||
        a.resum.toLowerCase().includes(q) ||
        a.categoria.toLowerCase().includes(q) ||
        a.autor.nom.toLowerCase().includes(q) ||
        (a.tags && a.tags.some(t => t.toLowerCase().includes(q))) ||
        (a.sectorZona && a.sectorZona.toLowerCase().includes(q))
      );
    }

    return result;
  }

  /**
   * Canvia la categoria seleccionada.
   * @param cat Categoria o 'Totes'
   */
  seleccionarCategoria(cat: string): void {
    this.categoriaSeleccionada = cat;
  }

  /**
   * Clica sobre una etiqueta per filtrar directament per ella.
   */
  filtrarPerTag(tag: string, event: Event): void {
    event.stopPropagation();
    this.termeCerca = tag;
    window.scrollTo({ top: 350, behavior: 'smooth' });
  }

  /**
   * Restableix tots els filtres de cerca i categoria.
   */
  resetFiltres(): void {
    this.categoriaSeleccionada = 'Totes';
    this.termeCerca = '';
  }

  /**
   * Genera el títol dinàmic de la secció de resultats.
   */
  getTitolResultats(): string {
    if (this.categoriaSeleccionada !== 'Totes') {
      const translatedCat = this.translationService.translateCategory(this.categoriaSeleccionada);
      return `${this.translationService.t('BLOG.ALL_ARTICLES')}: ${translatedCat}`;
    }
    if (this.termeCerca) {
      return this.translationService.t('TASQUES_OFERTES.EYEBROW');
    }
    return this.translationService.t('BLOG.ALL_ARTICLES');
  }
}

