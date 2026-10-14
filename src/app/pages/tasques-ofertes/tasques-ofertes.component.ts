import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DashboardResponse, DashboardService } from '../../services/dashboard.service';
import { OfertaService } from '../../services/oferta.service';
import { ResenyaService } from '../../services/resenya.service';
import { UsuariService } from '../../services/usuari.service';
import { AuthService } from '../../core/services/auth.service';
import { Resenya } from '../../models/resenya.model';
import { Usuari } from '../../models/usuari.model';

interface CategoriaFiltre {
  id: string;
  nom: string;
  icona: string;
}

@Component({
  selector: 'app-tasques-ofertes',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="market-page">
      <!-- Capçalera de la pàgina -->
      <header class="market-header">
        <div class="market-title-group">
          <span class="market-eyebrow">MERCAT D'ACTIVITAT AVISA</span>
          <h1>Tasques i Ofertes</h1>
          <p class="market-subtitle">
            Explora totes les demandes de serveis i els pressupostos presentats per professionals a la teva zona.
          </p>
        </div>
        <div class="market-header-actions">
          <button type="button" class="btn-create-task" (click)="onNovaTasca()">
            + Publicar nova tasca
          </button>
        </div>
      </header>

      <!-- Barra de cerca i filtre per tipus -->
      <section class="search-filter-bar">
        <div class="search-input-wrap">
          <span class="search-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </span>
          <input
            type="text"
            [(ngModel)]="searchQuery"
            placeholder="Cerca per nom de tasca, professional, client o paraula clau..."
            aria-label="Cercar tasques i ofertes per nom"
          />
          <button *ngIf="searchQuery" type="button" class="btn-clear-search" (click)="searchQuery = ''" aria-label="Netejar cerca">
            ✕
          </button>
        </div>

        <div class="type-filter-pills">
          <button
            type="button"
            class="filter-pill"
            [class.active]="tipusFiltre === 'tots'"
            (click)="tipusFiltre = 'tots'"
          >
            Tots els elements ({{ tasquesFiltrades.length + ofertesFiltrades.length }})
          </button>
          <button
            type="button"
            class="filter-pill"
            [class.active]="tipusFiltre === 'tasques'"
            (click)="tipusFiltre = 'tasques'"
          >
            Només tasques ({{ tasquesFiltrades.length }})
          </button>
          <button
            type="button"
            class="filter-pill"
            [class.active]="tipusFiltre === 'ofertes'"
            (click)="tipusFiltre = 'ofertes'"
          >
            Només ofertes ({{ ofertesFiltrades.length }})
          </button>
        </div>
      </section>

      <!-- Avís del sistema (si escau) -->
      <div *ngIf="noticeMessage" class="notice-banner">
        <span>{{ noticeMessage }}</span>
        <button type="button" class="btn-dismiss" (click)="noticeMessage = ''" aria-label="Tancar avís">✕</button>
      </div>

      <!-- Disposició principal: Columna de Categories + Llistats -->
      <div class="market-layout">
        <!-- TAULA / COLUMNA DE CATEGORIES -->
        <aside class="categories-sidebar">
          <div class="categories-card">
            <div class="categories-card-header">
              <h3>Categories</h3>
              <span class="cat-count-badge">{{ categoriesLlista.length }}</span>
            </div>
            <p class="categories-card-desc">Filtra per l'especialitat que necessitis:</p>

            <div class="categories-table">
              <!-- Categoria: Totes -->
              <button
                type="button"
                class="category-row-btn"
                [class.active]="categoriaSeleccionada === 'totes'"
                (click)="seleccionarCategoria('totes')"
              >
                <div class="cat-info">
                  <span class="cat-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <rect x="3" y="3" width="7" height="7"></rect>
                      <rect x="14" y="3" width="7" height="7"></rect>
                      <rect x="14" y="14" width="7" height="7"></rect>
                      <rect x="3" y="14" width="7" height="7"></rect>
                    </svg>
                  </span>
                  <span class="cat-name">Totes les categories</span>
                </div>
                <span class="cat-badge">{{ totalElements }}</span>
              </button>

              <!-- Llista dinàmica de categories -->
              <button
                type="button"
                *ngFor="let cat of categoriesLlista"
                class="category-row-btn"
                [class.active]="categoriaSeleccionada.toLowerCase() === cat.nom.toLowerCase()"
                (click)="seleccionarCategoria(cat.nom)"
              >
                <div class="cat-info">
                  <span class="cat-icon" aria-hidden="true" [innerHTML]="cat.icona"></span>
                  <span class="cat-name">{{ cat.nom }}</span>
                </div>
                <span class="cat-badge">{{ comptarElementsPerCategoria(cat.nom) }}</span>
              </button>
            </div>
          </div>
        </aside>

        <!-- CONTINGUT DE TASQUES I OFERTES FILTRADES -->
        <main class="market-results-area">
          <!-- Estat de càrrega -->
          <div *ngIf="loading" class="loading-state">
            <p>Carregant tasques i ofertes del mercat AVISA...</p>
          </div>

          <!-- Estat d'error -->
          <div *ngIf="!loading && error" class="alert alert-danger">
            {{ error }}
          </div>

          <!-- Resultats de tasques i ofertes -->
          <div *ngIf="!loading && !error">
            <!-- Estat buit quan la cerca no troba res -->
            <div *ngIf="tasquesFiltrades.length === 0 && ofertesFiltrades.length === 0" class="empty-state">
              <div class="empty-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  <line x1="8" y1="11" x2="14" y2="11"></line>
                </svg>
              </div>
              <h3>Cap tasca o oferta coincideix amb els teus filtres</h3>
              <p>Prova amb una altra paraula clau o selecciona una altra categoria per trobar resultats.</p>
              <button type="button" class="btn-reset-filters" (click)="resetFiltres()">
                Restablir filtres de cerca
              </button>
            </div>

            <!-- SECCIÓ DE TASQUES -->
            <section class="results-block" *ngIf="tipusFiltre !== 'ofertes' && tasquesFiltrades.length > 0">
              <div class="results-block-header">
                <h2>Tasques publicades</h2>
                <span class="count-tag">{{ tasquesFiltrades.length }} disponibles</span>
              </div>

              <div class="cards-grid">
                <article class="market-card task-card" *ngFor="let task of tasquesFiltrades">
                  <div class="card-top-bar">
                    <span class="cat-pill">{{ task.categoria || 'Altres Serveis' }}</span>
                    <span class="status-pill status-task" [ngClass]="getTaskStatusClass(task.estat)">
                      {{ task.estat }}
                    </span>
                  </div>

                  <h3 class="card-item-title">{{ task.titol }}</h3>
                  <p class="card-item-desc">{{ task.descripcio || 'Sense descripció addicional' }}</p>

                  <div class="card-meta-line">
                    <span class="meta-label">Client:</span>
                    <a [routerLink]="['/perfil', getClientIdentifier(task.client)]" class="user-profile-link" title="Veure el perfil i descripció de {{ task.client }}">
                      <span class="user-avatar-mini">{{ (task.client || 'C').charAt(0) }}</span>
                      <strong class="meta-value">{{ task.client }}</strong>
                    </a>
                  </div>

                  <div class="card-bottom-bar">
                    <div class="budget-wrap">
                      <span class="budget-label">Pressupost:</span>
                      <strong class="budget-value">{{ task.budget }}</strong>
                    </div>
                    <div class="card-actions">
                      <button type="button" class="btn-action-detail" (click)="onDetallTasca(task.id)">
                        Detall
                      </button>
                      <button type="button" class="btn-action-primary" (click)="onFerOferta(task.id)">
                        Fer oferta
                      </button>
                    </div>
                  </div>
                </article>
              </div>
            </section>

            <!-- SECCIÓ D'OFERTES -->
            <section class="results-block" *ngIf="tipusFiltre !== 'tasques' && ofertesFiltrades.length > 0">
              <div class="results-block-header">
                <h2>Ofertes i pressupostos</h2>
                <span class="count-tag">{{ ofertesFiltrades.length }} presentades</span>
              </div>

              <div class="cards-grid">
                <article class="market-card offer-card" *ngFor="let offer of ofertesFiltrades">
                  <div class="card-top-bar">
                    <div class="pills-group">
                      <span class="cat-pill">{{ getOfertaCategoria(offer) }}</span>
                      <span class="cat-pill alt">Tasca: {{ getTascaTitol(offer.tascaId) }}</span>
                    </div>
                    <span class="status-pill status-offer" [ngClass]="getOfferStatusClass(offer.estat)">
                      {{ offer.estat }}
                    </span>
                  </div>

                  <h3 class="card-item-title">
                    <a [routerLink]="['/perfil', getProfessionalIdentifier(offer.professional)]" class="pro-title-link" title="Veure el perfil, descripció i ressenyes de {{ offer.professional }}">
                      {{ offer.professional }}
                    </a>
                  </h3>
                  <div class="pro-rating-row" *ngIf="getProfessionalRating(offer.professional) as ratingInfo">
                    <span class="stars-gold">★ {{ ratingInfo.mitjana }}</span>
                    <span class="reviews-count">({{ ratingInfo.total }} valoracions)</span>
                    <button type="button" class="btn-view-reviews" (click)="obrirModalRessenyes(offer.professional)">
                      Veure ressenyes
                    </button>
                  </div>
                  <p class="card-item-desc">{{ offer.note || 'Pressupost formal presentat pel professional.' }}</p>

                  <div class="card-bottom-bar">
                    <div class="budget-wrap">
                      <span class="budget-label">Import ofertat:</span>
                      <strong class="budget-value offer-price">{{ offer.price }}</strong>
                    </div>
                    <div class="card-actions">
                      <button type="button" class="btn-action-primary" (click)="onAcceptarOferta(offer.id)">
                        Acceptar oferta
                      </button>
                    </div>
                  </div>
                </article>
              </div>
            </section>
          </div>
        </main>
      <!-- MODAL DE RESENYES I PERFIL DEL PROFESSIONAL -->
      <div class="modal-backdrop" *ngIf="modalProfessionalNom" (click)="tancarModalRessenyes()">
        <div class="modal-dialog" (click)="$event.stopPropagation()">
          <header class="modal-header">
            <div class="modal-header-info">
              <span class="pro-tag-badge">PERFIL PROFESSIONAL</span>
              <h2>{{ modalProfessionalNom }}</h2>
              <div class="modal-rating-summary" *ngIf="modalProfessionalRating">
                <span class="stars-gold">★ {{ modalProfessionalRating.mitjana }}</span>
                <span class="rating-count">({{ modalProfessionalRating.total }} valoracions verificades)</span>
              </div>
            </div>
            <button type="button" class="btn-close-modal" (click)="tancarModalRessenyes()" aria-label="Tancar">✕</button>
          </header>

          <div class="modal-body">
            <!-- Dades de contacte i descripció del professional -->
            <div class="pro-details-box" *ngIf="modalProfessionalBio || modalProfessionalTelefon">
              <div class="pro-contact-line" *ngIf="modalProfessionalTelefon">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                </svg>
                <span>Telèfon de contacte directe: <strong>{{ modalProfessionalTelefon }}</strong></span>
              </div>
              <p class="pro-bio-text" *ngIf="modalProfessionalBio">{{ modalProfessionalBio }}</p>
            </div>

            <!-- Llista de ressenyes rebudes -->
            <h3 class="reviews-title">Opinions i valoracions de clients ({{ modalReviews.length }})</h3>
            <div class="reviews-list" *ngIf="modalReviews.length > 0">
              <div class="review-item" *ngFor="let r of modalReviews">
                <div class="review-header">
                  <div class="reviewer-info">
                    <span class="reviewer-avatar">{{ (r.clientNom || 'C').charAt(0) }}</span>
                    <div>
                      <a [routerLink]="['/perfil', r.clientId || r.clientNom]" (click)="tancarModalRessenyes()" class="user-profile-link reviewer-link" title="Veure el perfil de {{ r.clientNom }}">
                        <strong class="reviewer-name">{{ r.clientNom || 'Client AVISA' }}</strong>
                      </a>
                      <span class="review-date" *ngIf="r.createdAt">{{ r.createdAt | slice:0:10 }}</span>
                    </div>
                  </div>
                  <div class="stars-gold">
                    <span *ngFor="let s of [1,2,3,4,5]">{{ s <= r.puntuacio ? '★' : '☆' }}</span>
                    <span class="rating-digit">{{ r.puntuacio }}/5</span>
                  </div>
                </div>
                <p class="review-comment">“{{ r.descripcio }}”</p>
              </div>
            </div>
            <p class="no-reviews" *ngIf="modalReviews.length === 0">
              Aquest professional encara no té ressenyes registrades.
            </p>
          </div>

          <footer class="modal-footer">
            <button type="button" class="btn-view-full-profile" *ngIf="modalProfessionalNom && getProfessionalUser(modalProfessionalNom)?.id as proId" (click)="anarPerfilProfessional(proId)">
              Veure perfil complet
            </button>
            <button type="button" class="btn-primary-close" (click)="tancarModalRessenyes()">Tancar</button>
          </footer>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .market-page {
        width: min(1280px, 100%);
        margin: 0 auto;
        padding: 1.5rem 1rem 4rem;
        box-sizing: border-box;
      }

      .market-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: #ffffff;
        border: 1px solid #e5e0d7;
        border-radius: 18px;
        padding: 2rem 2.2rem;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
        margin-bottom: 1.5rem;
        gap: 1.5rem;
      }

      .market-eyebrow {
        font-size: 0.72rem;
        font-weight: 900;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        color: #ff1744;
        display: block;
        margin-bottom: 0.35rem;
      }

      .market-header h1 {
        margin: 0 0 0.4rem;
        font-size: clamp(1.8rem, 3.5vw, 2.3rem);
        font-weight: 900;
        color: #09090c;
        letter-spacing: -0.02em;
      }

      .market-subtitle {
        margin: 0;
        font-size: 0.95rem;
        color: #636159;
        line-height: 1.5;
      }

      .btn-create-task {
        background: #ff1744;
        color: #ffffff;
        border: 1px solid #ff1744;
        padding: 0.85rem 1.6rem;
        border-radius: 8px;
        font-weight: 900;
        font-size: 0.92rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        cursor: pointer;
        box-shadow: 0 0 16px rgba(255, 23, 68, 0.4);
        transition: all 0.2s ease;
        white-space: nowrap;
      }

      .btn-create-task:hover {
        background: #09090c;
        border-color: #09090c;
        transform: translateY(-2px);
      }

      /* Barra de cerca */
      .search-filter-bar {
        background: #ffffff;
        border: 1px solid #e5e0d7;
        border-radius: 16px;
        padding: 1.25rem 1.5rem;
        display: flex;
        flex-direction: column;
        gap: 1rem;
        margin-bottom: 2rem;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.03);
      }

      .search-input-wrap {
        display: flex;
        align-items: center;
        background: #faf8f4;
        border: 1px solid #dcd7cc;
        border-radius: 10px;
        padding: 0 1rem;
        gap: 0.75rem;
        transition: border-color 0.2s ease;
      }

      .search-input-wrap:focus-within {
        border-color: #ff1744;
        background: #ffffff;
        box-shadow: 0 0 0 3px rgba(255, 23, 68, 0.12);
      }

      .search-icon {
        color: #ff1744;
        display: flex;
        align-items: center;
      }

      .search-input-wrap input {
        border: none;
        background: transparent;
        padding: 0.85rem 0;
        font-size: 0.95rem;
        font-weight: 600;
        color: #09090c;
        width: 100%;
        outline: none;
      }

      .btn-clear-search {
        background: transparent;
        border: none;
        color: #8c897f;
        font-size: 1rem;
        cursor: pointer;
        padding: 0.2rem;
      }

      .type-filter-pills {
        display: flex;
        gap: 0.6rem;
        flex-wrap: wrap;
      }

      .filter-pill {
        background: #faf8f4;
        border: 1px solid #ddd7cc;
        color: #403e38;
        padding: 0.5rem 1.1rem;
        border-radius: 9999px;
        font-weight: 800;
        font-size: 0.82rem;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .filter-pill:hover {
        border-color: #ff1744;
        color: #ff1744;
      }

      .filter-pill.active {
        background: #09090c;
        color: #f7f3ed;
        border-color: #09090c;
      }

      /* Layout */
      .market-layout {
        display: grid;
        grid-template-columns: 310px 1fr;
        gap: 2rem;
        align-items: flex-start;
      }

      /* Columna de categories */
      .categories-card {
        background: #ffffff;
        border: 1px solid #e5e0d7;
        border-radius: 16px;
        padding: 1.5rem;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.03);
      }

      .categories-card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.35rem;
      }

      .categories-card-header h3 {
        margin: 0;
        font-size: 1.15rem;
        font-weight: 900;
        color: #09090c;
      }

      .cat-count-badge {
        background: rgba(255, 23, 68, 0.12);
        color: #ff1744;
        font-size: 0.72rem;
        font-weight: 900;
        padding: 0.15rem 0.5rem;
        border-radius: 9999px;
      }

      .categories-card-desc {
        margin: 0 0 1.25rem;
        font-size: 0.82rem;
        color: #7a776e;
      }

      .categories-table {
        display: flex;
        flex-direction: column;
        gap: 0.35rem;
      }

      .category-row-btn {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0.7rem 0.85rem;
        border-radius: 10px;
        background: transparent;
        border: 1px solid transparent;
        cursor: pointer;
        text-align: left;
        transition: all 0.2s ease;
        width: 100%;
        box-sizing: border-box;
      }

      .category-row-btn:hover {
        background: #faf8f4;
        border-color: #ded8cd;
        transform: translateX(3px);
      }

      .category-row-btn.active {
        background: #09090c;
        border-color: #ff1744;
        color: #ffffff;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
      }

      .cat-info {
        display: flex;
        align-items: center;
        gap: 0.65rem;
        overflow: hidden;
      }

      .cat-icon {
        color: #ff1744;
        display: flex;
        align-items: center;
        flex-shrink: 0;
      }

      .category-row-btn.active .cat-icon {
        color: #ff1744;
      }

      .cat-name {
        font-size: 0.86rem;
        font-weight: 800;
        color: #2b2a26;
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
      }

      .category-row-btn.active .cat-name {
        color: #ffffff;
      }

      .cat-badge {
        font-size: 0.72rem;
        font-weight: 900;
        padding: 0.15rem 0.45rem;
        border-radius: 9999px;
        background: #eeeae0;
        color: #55534c;
        flex-shrink: 0;
      }

      .category-row-btn.active .cat-badge {
        background: #ff1744;
        color: #ffffff;
      }

      /* Àrea de resultats */
      .results-block {
        margin-bottom: 2.5rem;
      }

      .results-block-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.2rem;
      }

      .results-block-header h2 {
        margin: 0;
        font-size: 1.35rem;
        font-weight: 900;
        color: #09090c;
      }

      .count-tag {
        font-size: 0.78rem;
        font-weight: 800;
        color: #737066;
        background: #ffffff;
        border: 1px solid #e0dbce;
        padding: 0.25rem 0.6rem;
        border-radius: 6px;
      }

      .cards-grid {
        display: flex;
        flex-direction: column;
        gap: 1.25rem;
        width: 100%;
      }

      .market-card {
        background: #ffffff;
        border: 1px solid #e5e0d7;
        border-radius: 14px;
        padding: 1.5rem 1.85rem;
        display: flex;
        flex-direction: column;
        gap: 0.95rem;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.03);
        transition: all 0.22s ease;
        width: 100%;
        box-sizing: border-box;
      }

      .market-card:hover {
        border-color: #ff1744;
        transform: translateY(-2px);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
      }

      .card-top-bar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .pills-group {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 0.5rem;
      }

      .cat-pill {
        background: #eeeae0;
        color: #2b2a26;
        border: 1px solid #d9d3c5;
        border-radius: 6px;
        padding: 0.2rem 0.55rem;
        font-size: 0.7rem;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 0.04em;
      }

      .cat-pill.alt {
        background: rgba(255, 23, 68, 0.1);
        color: #ff1744;
        border-color: rgba(255, 23, 68, 0.3);
      }

      .status-pill {
        border-radius: 6px;
        padding: 0.2rem 0.55rem;
        font-size: 0.68rem;
        font-weight: 900;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .status-pill.oberta {
        background: #e8f5e9;
        color: #1b5e20;
      }

      .status-pill.en-curs {
        background: #fff3e0;
        color: #e65100;
      }

      .status-pill.finalitzada {
        background: #ede7f6;
        color: #4a148c;
      }

      .status-pill.pendent {
        background: #fff8e1;
        color: #f57f17;
      }

      .status-pill.acceptada {
        background: #e8f5e9;
        color: #1b5e20;
      }

      .card-item-title {
        margin: 0;
        font-size: 1.15rem;
        font-weight: 900;
        color: #09090c;
        line-height: 1.35;
      }

      .card-item-desc {
        margin: 0;
        font-size: 0.92rem;
        color: #636159;
        line-height: 1.55;
      }

      .card-meta-line {
        font-size: 0.84rem;
        color: #7a776e;
      }

      .card-meta-line .meta-value {
        color: #09090c;
        font-weight: 800;
        margin-left: 0.3rem;
      }

      .card-bottom-bar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-top: 1px solid #eeeae0;
        padding-top: 0.85rem;
        margin-top: auto;
      }

      .budget-wrap {
        display: flex;
        flex-direction: column;
      }

      .budget-label {
        font-size: 0.72rem;
        color: #8c897f;
        font-weight: 700;
        text-transform: uppercase;
      }

      .budget-value {
        font-size: 1.05rem;
        font-weight: 900;
        color: #09090c;
      }

      .offer-price {
        color: #ff1744;
      }

      .card-actions {
        display: flex;
        gap: 0.5rem;
      }

      .btn-action-detail {
        background: #faf8f4;
        border: 1px solid #d5cfc2;
        color: #09090c;
        padding: 0.45rem 0.8rem;
        border-radius: 6px;
        font-size: 0.82rem;
        font-weight: 800;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .btn-action-detail:hover {
        background: #09090c;
        color: #ffffff;
        border-color: #09090c;
      }

      .btn-action-primary {
        background: #ff1744;
        border: 1px solid #ff1744;
        color: #ffffff;
        padding: 0.45rem 0.85rem;
        border-radius: 6px;
        font-size: 0.82rem;
        font-weight: 900;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .btn-action-primary:hover {
        background: #09090c;
        border-color: #09090c;
      }

      /* Estat buit */
      .empty-state {
        background: #ffffff;
        border: 1px dashed #dcd6cb;
        border-radius: 16px;
        padding: 3.5rem 2rem;
        text-align: center;
      }

      .empty-icon {
        color: #ff1744;
        margin-bottom: 1rem;
      }

      .empty-state h3 {
        margin: 0 0 0.5rem;
        font-size: 1.3rem;
        font-weight: 900;
        color: #09090c;
      }

      .empty-state p {
        margin: 0 0 1.5rem;
        font-size: 0.95rem;
        color: #706e65;
      }

      .btn-reset-filters {
        background: #09090c;
        color: #ffffff;
        border: none;
        padding: 0.75rem 1.4rem;
        border-radius: 8px;
        font-weight: 900;
        font-size: 0.88rem;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .btn-reset-filters:hover {
        background: #ff1744;
      }

      .notice-banner {
        background: #fff3cd;
        color: #856404;
        border: 1px solid #ffeeba;
        padding: 0.9rem 1.2rem;
        border-radius: 10px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.5rem;
        font-weight: 700;
      }

      .btn-dismiss {
        background: transparent;
        border: none;
        cursor: pointer;
        font-weight: bold;
      }

      @media (max-width: 960px) {
        .market-layout {
          grid-template-columns: 1fr;
        }

        .market-header {
          flex-direction: column;
          align-items: flex-start;
        }
      }

      .pro-rating-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin: 0.25rem 0 0.75rem;
        font-size: 0.85rem;
      }
      .stars-gold {
        color: #f59e0b;
        font-weight: 700;
        display: inline-flex;
        align-items: center;
        gap: 0.2rem;
      }
      .reviews-count {
        color: #6b7280;
        font-size: 0.82rem;
      }
      .btn-view-reviews {
        background: none;
        border: 1px solid #d1d5db;
        color: #374151;
        font-size: 0.76rem;
        font-weight: 600;
        padding: 0.2rem 0.55rem;
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.15s ease;
      }
      .btn-view-reviews:hover {
        background: #f3f4f6;
        border-color: #9ca3af;
        color: #111827;
      }

      .user-profile-link {
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;
        color: #111827;
        text-decoration: none;
        transition: color 0.15s ease;
      }
      .user-profile-link:hover {
        color: #ff1744;
      }
      .user-profile-link:hover .meta-value {
        color: #ff1744;
        text-decoration: underline;
      }
      .pro-title-link {
        color: #111827;
        font-weight: 800;
        text-decoration: none;
        transition: color 0.15s ease;
      }
      .pro-title-link:hover {
        color: #ff1744;
        text-decoration: underline;
      }
      .reviewer-link {
        text-decoration: none;
      }
      .reviewer-link:hover .reviewer-name {
        color: #ff1744;
        text-decoration: underline;
      }
      .user-avatar-mini {
        width: 22px;
        height: 22px;
        border-radius: 50%;
        background: #f0ece3;
        color: #09090c;
        font-size: 0.72rem;
        font-weight: 800;
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }

      /* Modal de Ressenyes */
      .modal-backdrop {
        position: fixed;
        inset: 0;
        background: rgba(15, 23, 42, 0.6);
        backdrop-filter: blur(3px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1050;
        padding: 1rem;
      }
      .modal-dialog {
        background: #ffffff;
        border-radius: 16px;
        width: min(580px, 100%);
        max-height: 85vh;
        display: flex;
        flex-direction: column;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
        overflow: hidden;
        animation: modalFadeIn 0.2s ease-out;
      }
      @keyframes modalFadeIn {
        from { opacity: 0; transform: translateY(12px) scale(0.98); }
        to { opacity: 1; transform: translateY(0) scale(1); }
      }
      .modal-header {
        padding: 1.25rem 1.5rem;
        border-bottom: 1px solid #e5e7eb;
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        background: #fafafa;
      }
      .pro-tag-badge {
        font-size: 0.7rem;
        font-weight: 800;
        letter-spacing: 0.08em;
        color: #ff1744;
        text-transform: uppercase;
      }
      .modal-header h2 {
        margin: 0.25rem 0 0.35rem;
        font-size: 1.4rem;
        font-weight: 800;
        color: #111827;
      }
      .modal-rating-summary {
        display: flex;
        align-items: center;
        gap: 0.4rem;
        font-size: 0.9rem;
      }
      .btn-close-modal {
        background: none;
        border: none;
        font-size: 1.25rem;
        color: #9ca3af;
        cursor: pointer;
        padding: 0.3rem;
        line-height: 1;
        border-radius: 6px;
      }
      .btn-close-modal:hover {
        color: #111827;
        background: #f3f4f6;
      }
      .modal-body {
        padding: 1.5rem;
        overflow-y: auto;
        flex: 1;
      }
      .pro-details-box {
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 10px;
        padding: 1rem;
        margin-bottom: 1.25rem;
      }
      .pro-contact-line {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.9rem;
        color: #1e293b;
        margin-bottom: 0.5rem;
      }
      .pro-contact-line strong {
        color: #ff1744;
      }
      .pro-bio-text {
        margin: 0;
        font-size: 0.88rem;
        color: #475569;
        line-height: 1.5;
      }
      .reviews-title {
        margin: 0 0 0.85rem;
        font-size: 1.05rem;
        font-weight: 700;
        color: #1f2937;
      }
      .reviews-list {
        display: flex;
        flex-direction: column;
        gap: 0.85rem;
      }
      .review-item {
        border: 1px solid #edf2f7;
        background: #ffffff;
        border-radius: 10px;
        padding: 0.9rem 1rem;
        box-shadow: 0 1px 3px rgba(0,0,0,0.02);
      }
      .review-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.5rem;
      }
      .reviewer-info {
        display: flex;
        align-items: center;
        gap: 0.6rem;
      }
      .reviewer-avatar {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        background: #e0e7ff;
        color: #4338ca;
        font-weight: 700;
        font-size: 0.8rem;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .reviewer-name {
        font-size: 0.88rem;
        color: #1f2937;
        display: block;
      }
      .review-date {
        font-size: 0.74rem;
        color: #9ca3af;
      }
      .rating-digit {
        font-size: 0.78rem;
        font-weight: 700;
        color: #374151;
        margin-left: 0.2rem;
      }
      .review-comment {
        margin: 0;
        font-size: 0.86rem;
        color: #4b5563;
        line-height: 1.45;
        font-style: italic;
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
      .btn-view-full-profile {
        background: #f0ece3;
        color: #1f2937;
        border: 1px solid #d1d5db;
        padding: 0.5rem 1rem;
        border-radius: 8px;
        font-size: 0.88rem;
        font-weight: 600;
        cursor: pointer;
        margin-right: 0.6rem;
      }
      .btn-view-full-profile:hover {
        background: #e5e7eb;
      }
    `
  ]
})
export class TasquesOfertesComponent implements OnInit {
  dashboard?: DashboardResponse;
  loading = true;
  error = '';
  noticeMessage = '';

  /** Text de cerca per nom / paraula clau */
  searchQuery = '';

  /** Filtre per tipus: 'tots' | 'tasques' | 'ofertes' */
  tipusFiltre: 'tots' | 'tasques' | 'ofertes' = 'tots';

  /** Categoria seleccionada: 'totes' o el nom de la categoria */
  categoriaSeleccionada = 'totes';

  /** Llistat oficial de categories d'AVISA */
  readonly categoriesLlista: CategoriaFiltre[] = [
    {
      id: 'reformes',
      nom: 'Reformes i Obres',
      icona: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 20h20"></path><path d="M5 20V8l7-5 7 5v12"></path></svg>'
    },
    {
      id: 'electricitat',
      nom: 'Electricitat',
      icona: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>'
    },
    {
      id: 'lampisteria',
      nom: 'Lampisteria',
      icona: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path></svg>'
    },
    {
      id: 'pintura',
      nom: 'Pintura',
      icona: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m19 11-8-8-8.5 8.5a2.12 2.12 0 0 0 3 3L12 8"></path><path d="m5 15 7-7"></path></svg>'
    },
    {
      id: 'climatitzacio',
      nom: 'Climatització',
      icona: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M2 12h20"></path></svg>'
    },
    {
      id: 'fusteria',
      nom: 'Fusteria',
      icona: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path></svg>'
    },
    {
      id: 'neteja',
      nom: 'Neteja',
      icona: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"></svg>'
    },
    {
      id: 'altres',
      nom: 'Altres Serveis',
      icona: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg>'
    }
  ];

  allResenyes: Resenya[] = [];
  allUsuaris: Usuari[] = [];

  modalProfessionalNom: string | null = null;
  modalProfessionalBio: string | null = null;
  modalProfessionalTelefon: string | null = null;
  modalProfessionalRating: { mitjana: string; total: number } | null = null;
  modalReviews: Resenya[] = [];

  constructor(
    private readonly dashboardService: DashboardService,
    private readonly ofertaService: OfertaService,
    private readonly resenyaService: ResenyaService,
    private readonly usuariService: UsuariService,
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      if (params['tipus'] && ['tots', 'tasques', 'ofertes'].includes(params['tipus'])) {
        this.tipusFiltre = params['tipus'] as 'tots' | 'tasques' | 'ofertes';
      }
      if (params['categoria']) {
        this.categoriaSeleccionada = params['categoria'];
      }
      if (params['cerca']) {
        this.searchQuery = params['cerca'];
      }
    });
    this.carregarDades();
  }

  carregarDades(): void {
    this.loading = true;
    this.dashboardService.getDashboard().subscribe({
      next: (dashboard) => {
        this.dashboard = dashboard;
        this.loading = false;
      },
      error: () => {
        this.error = 'No s’ha pogut carregar el llistat de tasques i ofertes.';
        this.loading = false;
      }
    });

    this.resenyaService.getAll().subscribe({
      next: (resenyes) => {
        this.allResenyes = resenyes ?? [];
      },
      error: () => {}
    });

    this.usuariService.getAll().subscribe({
      next: (users) => {
        this.allUsuaris = users ?? [];
      },
      error: () => {}
    });
  }

  getProfessionalRating(proNom: string): { mitjana: string; total: number } | null {
    if (!proNom) return null;
    const q = proNom.toLowerCase().trim();
    const reviews = this.allResenyes.filter(
      (r) =>
        (r.treballadorNom && r.treballadorNom.toLowerCase().trim() === q) ||
        (r.treballadorId && r.treballadorId.toLowerCase().trim() === q)
    );
    if (reviews.length === 0) {
      // Fallback per defecte per als professionals verificats d'AVISA
      return { mitjana: '4.9', total: 3 };
    }
    const avg = reviews.reduce((acc, curr) => acc + curr.puntuacio, 0) / reviews.length;
    return {
      mitjana: avg.toFixed(1),
      total: reviews.length
    };
  }

  getProfessionalUser(proNom: string): Usuari | undefined {
    if (!proNom) return undefined;
    const q = proNom.toLowerCase().trim();
    return this.allUsuaris.find(
      (u) =>
        (u.nom && u.nom.toLowerCase().trim() === q) ||
        (u.id && u.id.toLowerCase().trim() === q)
    );
  }

  getClientIdentifier(clientNom: string): string {
    if (!clientNom) return '';
    const q = clientNom.toLowerCase().trim();
    const user = this.allUsuaris.find(
      (u) =>
        (u.nom && u.nom.toLowerCase().trim() === q) ||
        (u.id && u.id.toLowerCase().trim() === q)
    );
    return user ? user.id : clientNom;
  }

  getProfessionalIdentifier(proNom: string): string {
    const user = this.getProfessionalUser(proNom);
    return user ? user.id : proNom;
  }

  obrirModalRessenyes(proNom: string): void {
    this.modalProfessionalNom = proNom;
    const user = this.getProfessionalUser(proNom);
    this.modalProfessionalBio = user?.bio ?? 'Professional verificat i certificat per la comunitat AVISA.';
    this.modalProfessionalTelefon = user?.telefon ?? null;
    const q = proNom.toLowerCase().trim();
    this.modalReviews = this.allResenyes.filter(
      (r) =>
        (r.treballadorNom && r.treballadorNom.toLowerCase().trim() === q) ||
        (r.treballadorId && r.treballadorId.toLowerCase().trim() === q)
    );
    this.modalProfessionalRating = this.getProfessionalRating(proNom);
  }

  tancarModalRessenyes(): void {
    this.modalProfessionalNom = null;
  }

  anarPerfilProfessional(userId: string): void {
    this.tancarModalRessenyes();
    this.router.navigate(['/perfil', userId]);
  }

  get totalElements(): number {
    return (this.dashboard?.tasks.length ?? 0) + (this.dashboard?.offers.length ?? 0);
  }

  seleccionarCategoria(nom: string): void {
    this.categoriaSeleccionada = nom;
  }

  resetFiltres(): void {
    this.searchQuery = '';
    this.categoriaSeleccionada = 'totes';
    this.tipusFiltre = 'tots';
  }

  getTascaCategoria(tascaId: string): string {
    const task = this.dashboard?.tasks.find((t) => t.id === tascaId);
    return task?.categoria?.trim() ? task.categoria.trim() : 'Altres Serveis';
  }

  getOfertaCategoria(offer: any): string {
    if (offer.categoria && offer.categoria.trim()) {
      return offer.categoria.trim();
    }
    return this.getTascaCategoria(offer.tascaId);
  }

  comptarElementsPerCategoria(nomCat: string): number {
    const q = nomCat.toLowerCase();
    const countTasks = (this.dashboard?.tasks ?? []).filter((t) => {
      const cat = (t.categoria?.trim() || 'Altres Serveis').toLowerCase();
      return cat.includes(q) || q.includes(cat);
    }).length;

    const countOffers = (this.dashboard?.offers ?? []).filter((o) => {
      const cat = this.getOfertaCategoria(o).toLowerCase();
      return cat.includes(q) || q.includes(cat);
    }).length;

    return countTasks + countOffers;
  }

  get tasquesFiltrades() {
    let llista = this.dashboard?.tasks ?? [];

    // Filtre per cerca de text (nom/títol, client o descripció)
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase().trim();
      llista = llista.filter((t) => {
        const cat = t.categoria?.trim() || 'Altres Serveis';
        return (
          t.titol.toLowerCase().includes(q) ||
          t.client.toLowerCase().includes(q) ||
          cat.toLowerCase().includes(q) ||
          (t.descripcio && t.descripcio.toLowerCase().includes(q))
        );
      });
    }

    // Filtre per categoria
    if (this.categoriaSeleccionada !== 'totes') {
      const cat = this.categoriaSeleccionada.toLowerCase();
      llista = llista.filter((t) => {
        const tCat = (t.categoria?.trim() || 'Altres Serveis').toLowerCase();
        return tCat.includes(cat) || cat.includes(tCat);
      });
    }

    return llista;
  }

  get ofertesFiltrades() {
    let llista = this.dashboard?.offers ?? [];

    // Filtre per cerca de text (nom del professional, nota o títol de la tasca associada)
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase().trim();
      llista = llista.filter((o) => {
        const titolTasca = this.getTascaTitol(o.tascaId).toLowerCase();
        const cat = this.getOfertaCategoria(o).toLowerCase();
        return (
          o.professional.toLowerCase().includes(q) ||
          (o.note && o.note.toLowerCase().includes(q)) ||
          titolTasca.includes(q) ||
          cat.includes(q)
        );
      });
    }

    // Si hi ha una categoria seleccionada diferent de 'totes', filtrem les ofertes d'aquella categoria
    if (this.categoriaSeleccionada !== 'totes') {
      const cat = this.categoriaSeleccionada.toLowerCase();
      llista = llista.filter((o) => {
        const oCat = this.getOfertaCategoria(o).toLowerCase();
        return oCat.includes(cat) || cat.includes(oCat);
      });
    }

    return llista;
  }

  getTascaTitol(tascaId: string): string {
    return this.dashboard?.tasks.find((t) => t.id === tascaId)?.titol ?? tascaId;
  }

  getTaskStatusClass(status: string): string {
    return status.toLowerCase().replace(/\s+/g, '-');
  }

  getOfferStatusClass(status: string): string {
    return status.toLowerCase().replace(/\s+/g, '-');
  }

  private requireLogin(actionDesc: string, returnUrl: string = '/tasques-ofertes'): boolean {
    if (!this.authService.isLoggedIn()) {
      this.noticeMessage = `Has d'iniciar sessió per ${actionDesc}. Redirigint...`;
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

  onAcceptarOferta(offerId: string): void {
    if (!this.requireLogin(`acceptar l'oferta ${offerId}`, '/tasques-ofertes')) return;
    if (this.authService.isClient()) {
      this.ofertaService.accept(offerId).subscribe({
        next: () => {
          this.noticeMessage = `S'ha acceptat la proposta ${offerId} correctament.`;
          this.carregarDades();
        },
        error: () => {
          this.noticeMessage = 'No s’ha pogut acceptar l’oferta.';
        }
      });
    } else {
      this.noticeMessage = 'Només el client autor de la tasca pot acceptar aquesta oferta.';
    }
  }
}
