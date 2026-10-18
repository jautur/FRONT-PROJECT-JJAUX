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

/**
 * Component del Mercat de Tasques i Ofertes (/tasques-ofertes).
 * Actua com a tauler principal d'anuncis d'AVISA:
 * 1. Mostra en primer lloc les OFERTES dels professionals quan se selecciona «Tots els anuncis».
 * 2. Mostra a continuació les INCIDÈNCIES obertes pels clients sol·licitant pressupostos.
 * 3. Mostra les TASQUES acordades exclusivament als 2 usuaris implicats (client i professional) o administrador,
 *    garantint la privadesa dels contractes.
 * 4. Permet cercar per text i filtrar per especialitat / gremi (lampisteria, electricitat, pintura, etc.).
 * 5. Permet obrir el modal de ressenyes d'un professional per consultar el seu historial de valoracions públiques.
 * 6. Disseny adaptable (responsive) optimitzat per a mòbils: carrusel lliscant de categories (chip-strip) en lloc
 *    de la columna vertical massiva, botons tàctils ergonòmics (44px), accions adaptades i inputs anti-zoom en iOS.
 */
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
          <button type="button" class="btn-create-task" (click)="onNovaIncidencia()">
            + Publicar Incidència
          </button>
          <button type="button" class="btn-create-offer" (click)="onNovaOferta()">
            + Publicar Oferta / Servei
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
            placeholder="Cerca per nom, professional, client o paraula clau..."
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
            Tots els anuncis ({{ totalElements }})
          </button>
          <button
            type="button"
            class="filter-pill"
            [class.active]="tipusFiltre === 'ofertes'"
            (click)="tipusFiltre = 'ofertes'"
          >
            Ofertes de professionals ({{ ofertesFiltrades.length }})
          </button>
          <button
            type="button"
            class="filter-pill"
            [class.active]="tipusFiltre === 'incidencies'"
            (click)="tipusFiltre = 'incidencies'"
          >
            Incidències de clients ({{ incidenciesFiltrades.length }})
          </button>
          <button
            type="button"
            class="filter-pill"
            [class.active]="tipusFiltre === 'tasques'"
            (click)="tipusFiltre = 'tasques'"
          >
            Les teues tasques ({{ tasquesFiltrades.length }})
          </button>
        </div>
      </section>

      <!-- Avís del sistema (si escau) -->
      <div *ngIf="noticeMessage" class="notice-banner">
        <span>{{ noticeMessage }}</span>
        <button type="button" class="btn-dismiss" (click)="noticeMessage = ''" aria-label="Tancar avís">✕</button>
      </div>

      <!-- Barra horitzontal de xips / categories en carrusel lliscant per a mòbils -->
      <nav class="mobile-categories-strip" aria-label="Categories per a mòbil">
        <button
          type="button"
          class="mobile-cat-chip"
          [class.active]="categoriaSeleccionada === 'totes'"
          (click)="seleccionarCategoria('totes')"
        >
          <span class="mobile-cat-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="3" width="7" height="7"></rect>
              <rect x="14" y="3" width="7" height="7"></rect>
              <rect x="14" y="14" width="7" height="7"></rect>
              <rect x="3" y="14" width="7" height="7"></rect>
            </svg>
          </span>
          <span class="mobile-cat-label">Totes</span>
          <span class="mobile-cat-count">{{ totalElements }}</span>
        </button>

        <button
          type="button"
          *ngFor="let cat of categoriesLlista"
          class="mobile-cat-chip"
          [class.active]="categoriaSeleccionada.toLowerCase() === cat.nom.toLowerCase()"
          (click)="seleccionarCategoria(cat.nom)"
        >
          <span class="mobile-cat-icon" aria-hidden="true" [innerHTML]="cat.icona"></span>
          <span class="mobile-cat-label">{{ cat.nom }}</span>
          <span class="mobile-cat-count">{{ comptarElementsPerCategoria(cat.nom) }}</span>
        </button>
      </nav>

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
            <!-- Estat buit quan no hi ha resultats segons el filtre actiu -->
            <div *ngIf="(tipusFiltre === 'tots' && incidenciesFiltrades.length === 0 && ofertesFiltrades.length === 0 && tasquesFiltrades.length === 0) ||
                        (tipusFiltre === 'ofertes' && ofertesFiltrades.length === 0) ||
                        (tipusFiltre === 'incidencies' && incidenciesFiltrades.length === 0) ||
                        (tipusFiltre === 'tasques' && tasquesFiltrades.length === 0)" class="empty-state">
              <div class="empty-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  <line x1="8" y1="11" x2="14" y2="11"></line>
                </svg>
              </div>
              <ng-container [ngSwitch]="tipusFiltre">
                <div *ngSwitchCase="'tasques'">
                  <h3>No tens cap tasca acordada visible</h3>
                  <p>
                    Les tasques acordades són privades i només són visibles per als 2 usuaris implicats (el client i el professional) i al panell de control.
                    {{ !isLoggedIn ? 'Inicia sessió per consultar les teves tasques acordades.' : 'Quan contractis un servei o s’accepti una oferta, la teva tasca en curs apareixerà aquí.' }}
                  </p>
                  <a *ngIf="!isLoggedIn" routerLink="/login" class="btn-reset-filters" style="display: inline-block; text-decoration: none; margin-top: 0.5rem;">
                    Iniciar Sessió
                  </a>
                </div>
                <div *ngSwitchCase="'ofertes'">
                  <h3>Cap oferta coincideix amb els teus filtres</h3>
                  <p>Prova amb una altra paraula clau o selecciona una altra categoria per trobar serveis.</p>
                  <button type="button" class="btn-reset-filters" (click)="resetFiltres()">
                    Restablir filtres de cerca
                  </button>
                </div>
                <div *ngSwitchCase="'incidencies'">
                  <h3>Cap incidència de client coincideix amb els teus filtres</h3>
                  <p>Prova amb una altra paraula clau o selecciona una altra categoria per trobar peticions.</p>
                  <button type="button" class="btn-reset-filters" (click)="resetFiltres()">
                    Restablir filtres de cerca
                  </button>
                </div>
                <div *ngSwitchDefault>
                  <h3>Cap anunci coincideix amb els teus filtres</h3>
                  <p>Prova amb una altra paraula clau o selecciona una altra categoria per trobar resultats.</p>
                  <button type="button" class="btn-reset-filters" (click)="resetFiltres()">
                    Restablir filtres de cerca
                  </button>
                </div>
              </ng-container>
            </div>

            <!-- SECCIÓ D'OFERTES I PACKS DE SERVEIS PROFESSIONALS (SOLS PROFESSIONAL) -->
            <section class="results-block" *ngIf="(tipusFiltre === 'tots' || tipusFiltre === 'ofertes') && ofertesFiltrades.length > 0">
              <div class="results-block-header">
                <h2>Ofertes i packs de servei professional</h2>
                <span class="count-tag">{{ ofertesFiltrades.length }} disponibles</span>
              </div>

              <div class="cards-grid">
                <article class="market-card offer-card" *ngFor="let offer of ofertesFiltrades">
                  <div class="card-top-bar">
                    <div class="pills-group">
                      <span class="nature-pill pro-nature">OFERTA DE SERVEI</span>
                      <span class="cat-pill">{{ getOfertaCategoria(offer) }}</span>
                    </div>
                  </div>

                  <h3 class="card-item-title">{{ getOfertaTitol(offer) }}</h3>
                  <p class="card-item-desc">{{ getOfertaDescripcio(offer) }}</p>

                  <div class="card-meta-line">
                    <span class="meta-label">Professional que ofereix el servei:</span>
                    <a [routerLink]="['/perfil', getProfessionalIdentifier(offer.professional)]" class="user-profile-link pro-profile-link" title="Veure el perfil, descripció i ressenyes de {{ offer.professional }}">
                      <span class="user-avatar-mini pro-avatar-mini">{{ (offer.professional || 'P').charAt(0) }}</span>
                      <strong class="meta-value pro-name-val">{{ offer.professional }}</strong>
                    </a>
                    <span class="pro-rating-inline" *ngIf="getProfessionalRating(offer.professional) as ratingInfo">
                      <span class="stars-gold">★ {{ ratingInfo.mitjana }}</span>
                      <span class="reviews-count">({{ ratingInfo.total }} valoracions)</span>
                      <button type="button" class="btn-view-reviews" (click)="obrirModalRessenyes(offer.professional)">
                        Veure ressenyes
                      </button>
                    </span>
                  </div>

                  <div class="card-bottom-bar">
                    <div class="budget-wrap">
                      <span class="budget-label">Tarifa del servei:</span>
                      <strong class="budget-value offer-price">{{ offer.price }}</strong>
                    </div>
                    <div class="card-actions">
                      <button *ngIf="isOfferOwner(offer)" type="button" class="btn-action-delete-offer" (click)="onDeleteOferta(offer.id)" title="Borrar oferta">
                        Borrar
                      </button>
                      <button type="button" class="btn-action-primary btn-contractar" (click)="onContractarOferta(offer)">
                        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 4px; vertical-align: -2px;">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                        Contractar
                      </button>
                    </div>
                  </div>
                </article>
              </div>
            </section>

            <!-- SECCIÓ D'INCIDÈNCIES DE CLIENTS (SOLS CLIENT, SENSE PROFESSIONAL ASSIGNAT) -->
            <section class="results-block" *ngIf="(tipusFiltre === 'tots' || tipusFiltre === 'incidencies') && incidenciesFiltrades.length > 0">
              <div class="results-block-header">
                <h2>Incidències i peticions de clients</h2>
                <span class="count-tag">{{ incidenciesFiltrades.length }} disponibles</span>
              </div>

              <div class="cards-grid">
                <article class="market-card task-card" *ngFor="let task of incidenciesFiltrades">
                  <div class="card-top-bar">
                    <div class="pills-group">
                      <span class="nature-pill client-nature">INCIDÈNCIA</span>
                      <span class="cat-pill">{{ task.categoria || 'Altres Serveis' }}</span>
                    </div>
                  </div>

                  <h3 class="card-item-title">{{ task.titol }}</h3>
                  <p class="card-item-desc">{{ task.descripcio || 'Sense descripció addicional' }}</p>

                  <div class="card-meta-line">
                    <span class="meta-label">Client que demana ajuda:</span>
                    <a [routerLink]="['/perfil', getClientIdentifier(task.client)]" class="user-profile-link" title="Veure el perfil i descripció de {{ task.client }}">
                      <span class="user-avatar-mini">{{ (task.client || 'C').charAt(0) }}</span>
                      <strong class="meta-value">{{ task.client }}</strong>
                    </a>
                  </div>

                  <div class="card-bottom-bar">
                    <div class="budget-wrap">
                      <span class="budget-label">Pressupost estimat client:</span>
                      <strong class="budget-value">{{ task.budget }}</strong>
                    </div>
                    <div class="card-actions">
                      <button type="button" class="btn-action-detail" (click)="onDetallTasca(task.id)">
                        Detall
                      </button>
                      <button type="button" class="btn-action-primary" (click)="onFerOferta(task.id)">
                        Proposar pressupost
                      </button>
                    </div>
                  </div>
                </article>
              </div>
            </section>

            <!-- SECCIÓ DE TASQUES ACORDADES (CONVERGEIXEN CLIENT I PROFESSIONAL OBLIGATORIS) -->
            <section class="results-block" *ngIf="(tipusFiltre === 'tots' || tipusFiltre === 'tasques') && tasquesFiltrades.length > 0">
              <div class="results-block-header">
                <h2>Les teues tasques acordades (Client + Professional)</h2>
                <span class="count-tag count-tag-tasca">{{ tasquesFiltrades.length }} acordades</span>
              </div>

              <div class="cards-grid">
                <article class="market-card task-card converged-card" *ngFor="let task of tasquesFiltrades">
                  <div class="card-top-bar">
                    <div class="pills-group">
                      <span class="nature-pill task-nature">TASCA CONVERGIDA</span>
                      <span class="cat-pill">{{ task.categoria || 'Altres Serveis' }}</span>
                    </div>
                    <span class="status-pill status-task" [ngClass]="getTaskStatusClass(task.estat)">
                      {{ task.estat }}
                    </span>
                  </div>

                  <h3 class="card-item-title">{{ task.titol }}</h3>
                  <p class="card-item-desc">{{ task.descripcio || 'Feina pactada entre client i professional.' }}</p>

                  <div class="card-meta-dual">
                    <div class="card-meta-line">
                      <span class="meta-label">Client:</span>
                      <a [routerLink]="['/perfil', getClientIdentifier(task.client)]" class="user-profile-link" title="Veure el perfil de {{ task.client }}">
                        <span class="user-avatar-mini">{{ (task.client || 'C').charAt(0) }}</span>
                        <strong class="meta-value">{{ task.client }}</strong>
                      </a>
                    </div>
                    <div class="card-meta-line" *ngIf="task.professional">
                      <span class="meta-label">Professional assignat:</span>
                      <a [routerLink]="['/perfil', getProfessionalIdentifier(task.professional)]" class="user-profile-link pro-profile-link" title="Veure el perfil de {{ task.professional }}">
                        <span class="user-avatar-mini pro-avatar-mini">{{ (task.professional || 'P').charAt(0) }}</span>
                        <strong class="meta-value pro-name-val">{{ task.professional }}</strong>
                      </a>
                    </div>
                  </div>

                  <div class="card-bottom-bar">
                    <div class="budget-wrap">
                      <span class="budget-label">Preu acordat:</span>
                      <strong class="budget-value">{{ task.budget }}</strong>
                    </div>
                    <div class="card-actions">
                      <button type="button" class="btn-action-detail" (click)="onDetallTasca(task.id)">
                        Veure seguiment & detall
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

      .market-header-actions {
        display: flex;
        gap: 0.75rem;
        flex-wrap: wrap;
        align-items: center;
      }

      .btn-create-task {
        background: #ff1744;
        color: #ffffff;
        border: 1px solid #ff1744;
        padding: 0.75rem 1.35rem;
        border-radius: 8px;
        font-weight: 800;
        font-size: 0.88rem;
        cursor: pointer;
        box-shadow: 0 0 14px rgba(255, 23, 68, 0.3);
        transition: all 0.2s ease;
        white-space: nowrap;
      }

      .btn-create-task:hover {
        background: #09090c;
        border-color: #09090c;
        transform: translateY(-2px);
      }

      .btn-create-offer {
        background: #09090c;
        color: #ffffff;
        border: 1px solid #09090c;
        padding: 0.75rem 1.35rem;
        border-radius: 8px;
        font-weight: 800;
        font-size: 0.88rem;
        cursor: pointer;
        transition: all 0.2s ease;
        white-space: nowrap;
      }

      .btn-create-offer:hover {
        background: #ff1744;
        border-color: #ff1744;
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

      /* Barra horitzontal de categories per a mòbils (oculta en escriptori >= 961px) */
      .mobile-categories-strip {
        display: none;
        align-items: center;
        gap: 0.5rem;
        overflow-x: auto;
        white-space: nowrap;
        -webkit-overflow-scrolling: touch;
        scrollbar-width: none;
        padding: 0.2rem 0.1rem 0.85rem;
        margin-bottom: 0.85rem;
      }

      .mobile-categories-strip::-webkit-scrollbar {
        display: none;
      }

      .mobile-cat-chip {
        display: inline-flex;
        align-items: center;
        gap: 0.45rem;
        padding: 0.45rem 0.85rem;
        border-radius: 9999px;
        background: #ffffff;
        border: 1px solid #dcd7cc;
        color: #374151;
        font-size: 0.82rem;
        font-weight: 700;
        cursor: pointer;
        flex-shrink: 0;
        transition: all 0.2s ease;
        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
      }

      .mobile-cat-chip:active {
        transform: scale(0.97);
      }

      .mobile-cat-chip .mobile-cat-icon {
        display: flex;
        align-items: center;
        color: #ff1744;
      }

      .mobile-cat-chip .mobile-cat-count {
        font-size: 0.72rem;
        background: #eeeae0;
        color: #55534c;
        padding: 0.1rem 0.45rem;
        border-radius: 9999px;
        font-weight: 800;
      }

      .mobile-cat-chip.active {
        background: #09090c;
        color: #ffffff;
        border-color: #ff1744;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.25);
      }

      .mobile-cat-chip.active .mobile-cat-icon {
        color: #ff1744;
      }

      .mobile-cat-chip.active .mobile-cat-count {
        background: #ff1744;
        color: #ffffff;
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

      .nature-pill {
        border-radius: 6px;
        padding: 0.2rem 0.55rem;
        font-size: 0.68rem;
        font-weight: 900;
        text-transform: uppercase;
        letter-spacing: 0.06em;
      }

      .nature-pill.client-nature {
        background: #09090c;
        color: #f7f3ed;
        border: 1px solid #2b2a36;
      }

      .nature-pill.pro-nature {
        background: rgba(255, 23, 68, 0.12);
        color: #ff1744;
        border: 1px solid rgba(255, 23, 68, 0.35);
      }

      .nature-pill.task-nature {
        background: rgba(16, 185, 129, 0.12);
        color: #059669;
        border: 1px solid rgba(16, 185, 129, 0.35);
      }

      .count-tag-tasca {
        background: #ecfdf5 !important;
        color: #065f46 !important;
        border-color: #a7f3d0 !important;
      }

      .converged-card {
        border-left: 4px solid #10b981;
      }

      .card-meta-dual {
        display: flex;
        flex-direction: column;
        gap: 0.35rem;
        background: #faf8f4;
        padding: 0.65rem 0.85rem;
        border-radius: 8px;
        border: 1px solid #eeeae0;
      }

      .pro-profile-link {
        color: #059669;
      }
      .pro-avatar-mini {
        background: #d1fae5 !important;
        color: #065f46 !important;
      }
      .pro-name-val {
        color: #059669 !important;
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
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 0.35rem 0.5rem;
      }

      .card-meta-line .meta-value {
        color: #09090c;
        font-weight: 800;
        margin-left: 0.3rem;
      }

      .pro-rating-inline {
        display: inline-flex;
        align-items: center;
        gap: 0.35rem;
        margin-left: 0.4rem;
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
      .btn-action-delete-offer {
        padding: 0.6rem 0.95rem;
        background: rgba(239, 68, 68, 0.1);
        color: #dc2626;
        border: 1px solid rgba(239, 68, 68, 0.3);
        border-radius: 9px;
        font-weight: 800;
        font-size: 0.85rem;
        cursor: pointer;
        transition: all 0.2s ease;
      }
      .btn-action-delete-offer:hover {
        background: #fee2e2;
        border-color: #dc2626;
      }

      /* ============================================================== */
      /* ADAPTACIÓ RESPONSIVE I USABILITAT PER A DISPOSITIUS MÒBILS    */
      /* ============================================================== */
      @media (max-width: 960px) {
        .market-page {
          padding: 0.5rem 0 3.5rem;
        }

        /* Oculta la columna vertical de categories en mòbils per no desplaçar el contingut cap avall */
        .categories-sidebar {
          display: none !important;
        }

        /* Activa el carrusel horitzontal de xips de categoria */
        .mobile-categories-strip {
          display: flex;
        }

        .market-layout {
          grid-template-columns: 1fr;
          gap: 1rem;
        }

        .market-header {
          flex-direction: column;
          align-items: stretch;
          padding: 1.25rem 1rem;
          border-radius: 14px;
          margin-bottom: 1rem;
          gap: 1rem;
        }

        .market-header h1 {
          font-size: 1.55rem;
          line-height: 1.25;
        }

        .market-subtitle {
          font-size: 0.88rem;
          line-height: 1.45;
        }

        .market-header-actions {
          width: 100%;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.5rem;
        }

        .btn-create-task,
        .btn-create-offer {
          width: 100%;
          text-align: center;
          padding: 0.65rem 0.5rem;
          font-size: 0.82rem;
          white-space: normal;
          display: flex;
          align-items: center;
          justify-content: center;
          box-sizing: border-box;
          min-height: 44px;
          border-radius: 9px;
        }

        .search-filter-bar {
          padding: 0.85rem 0.95rem;
          border-radius: 14px;
          margin-bottom: 0.85rem;
          gap: 0.75rem;
        }

        .search-input-wrap {
          border-radius: 9px;
          padding: 0 0.85rem;
        }

        .search-input-wrap input {
          font-size: 16px; /* Impedeix el zoom forçat a navegadors mòbils com iOS Safari */
          padding: 0.75rem 0;
        }

        .type-filter-pills {
          overflow-x: auto;
          flex-wrap: nowrap;
          padding-bottom: 0.35rem;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
          gap: 0.45rem;
        }

        .type-filter-pills::-webkit-scrollbar {
          display: none;
        }

        .filter-pill {
          white-space: nowrap;
          flex-shrink: 0;
          font-size: 0.8rem;
          padding: 0.45rem 0.85rem;
        }

        .results-block {
          margin-bottom: 2rem;
        }

        .results-block-header {
          margin-bottom: 0.85rem;
          flex-wrap: wrap;
          gap: 0.4rem;
        }

        .results-block-header h2 {
          font-size: 1.15rem;
        }

        .market-card {
          padding: 1.15rem 1rem;
          border-radius: 12px;
          gap: 0.75rem;
        }

        .card-top-bar {
          gap: 0.4rem;
        }

        .card-item-title {
          font-size: 1.08rem;
        }

        .card-item-desc {
          font-size: 0.88rem;
          line-height: 1.48;
        }

        .card-meta-line {
          font-size: 0.82rem;
          flex-wrap: wrap;
          gap: 0.35rem 0.5rem;
        }

        .pro-rating-inline {
          margin-left: 0;
          width: 100%;
          display: flex;
          align-items: center;
          gap: 0.35rem;
          margin-top: 0.25rem;
          font-size: 0.82rem;
        }

        .card-bottom-bar {
          flex-direction: column;
          align-items: stretch;
          gap: 0.65rem;
          padding-top: 0.75rem;
        }

        .budget-wrap {
          flex-direction: row;
          justify-content: space-between;
          align-items: center;
          background: #faf8f4;
          padding: 0.5rem 0.75rem;
          border-radius: 8px;
          border: 1px solid #eeeae0;
        }

        .budget-label {
          font-size: 0.72rem;
        }

        .budget-value {
          font-size: 1.05rem;
        }

        .card-actions {
          width: 100%;
          display: flex;
          gap: 0.5rem;
        }

        .btn-action-detail,
        .btn-action-primary,
        .btn-action-delete-offer {
          flex: 1;
          text-align: center;
          padding: 0.65rem 0.85rem;
          font-size: 0.85rem;
          min-height: 42px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-sizing: border-box;
          border-radius: 8px;
        }

        .btn-action-delete-offer {
          flex: 0 0 auto;
          padding: 0.65rem 0.95rem;
        }

        .empty-state {
          padding: 2.25rem 1.25rem;
        }
      }

      @media (max-width: 480px) {
        .market-header-actions {
          grid-template-columns: 1fr;
        }

        .btn-create-task,
        .btn-create-offer {
          font-size: 0.85rem;
        }

        .market-header h1 {
          font-size: 1.4rem;
        }

        .modal-backdrop {
          padding: 0;
          align-items: flex-end;
        }

        .modal-dialog {
          width: 100%;
          max-height: 90vh;
          border-radius: 18px 18px 0 0;
        }

        .modal-header {
          padding: 1rem 1.15rem;
        }

        .modal-body {
          padding: 1rem 1.15rem;
        }

        .modal-footer {
          padding: 0.75rem 1.15rem;
          flex-direction: column;
          gap: 0.5rem;
        }

        .btn-view-full-profile,
        .btn-primary-close {
          width: 100%;
          margin: 0;
          text-align: center;
          padding: 0.75rem 1rem;
        }
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

  /** Filtre per tipus: 'tots' | 'incidencies' | 'ofertes' | 'tasques' */
  tipusFiltre: 'tots' | 'incidencies' | 'ofertes' | 'tasques' = 'tots';

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
      if (params['tipus']) {
        const t = params['tipus'];
        if (t === 'tasques' || t === 'incidencies' || t === 'ofertes' || t === 'tots') {
          this.tipusFiltre = t as 'tots' | 'incidencies' | 'ofertes' | 'tasques';
        }
      }
      if (params['categoria']) {
        this.categoriaSeleccionada = params['categoria'];
      }
      if (params['cerca']) {
        this.searchQuery = params['cerca'];
      }
      if (params['avis'] || params['avís']) {
        this.noticeMessage = params['avis'] || params['avís'];
      }
      if (params['accio'] === 'crear-incidencia') {
        setTimeout(() => this.onNovaIncidencia(), 100);
      } else if (params['accio'] === 'crear-oferta') {
        setTimeout(() => this.onNovaOferta(), 100);
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

  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  get totalElements(): number {
    return this.incidenciesFiltrades.length + this.ofertesFiltrades.length + this.tasquesFiltrades.length;
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
    if (task?.categoria?.trim()) return task.categoria.trim();
    const inc = this.dashboard?.incidencies?.find((i) => i.id === tascaId);
    if (inc?.categoria?.trim()) return inc.categoria.trim();
    return 'Altres Serveis';
  }

  getOfertaCategoria(offer: any): string {
    if (offer.categoria && offer.categoria.trim()) {
      return offer.categoria.trim();
    }
    const targetId = offer.tascaId || offer.incidenciaId;
    return this.getTascaCategoria(targetId);
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
    const targetId = offer.tascaId || (offer as any).incidenciaId;
    if (targetId && targetId !== 'standalone') {
      const titolTasca = this.getTascaTitol(targetId);
      if (titolTasca && titolTasca !== 'Tasca desconeguda') {
        return 'Pressupost per a: ' + titolTasca;
      }
    }
    const cat = this.getOfertaCategoria(offer);
    if (cat && cat !== 'Altres Serveis') {
      return 'Servei de ' + cat;
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

  comptarElementsPerCategoria(nomCat: string): number {
    const q = nomCat.toLowerCase();
    const countIncidencies = (this.dashboard?.incidencies ?? []).filter((i) => {
      const cat = (i.categoria?.trim() || 'Altres Serveis').toLowerCase();
      return cat.includes(q) || q.includes(cat);
    }).length;

    const countTasks = this.tasquesFiltrades.filter((t) => {
      const cat = (t.categoria?.trim() || 'Altres Serveis').toLowerCase();
      return cat.includes(q) || q.includes(cat);
    }).length;

    const countOffers = (this.dashboard?.offers ?? []).filter((o) => {
      const cat = this.getOfertaCategoria(o).toLowerCase();
      return cat.includes(q) || q.includes(cat);
    }).length;

    return countIncidencies + countTasks + countOffers;
  }

  /**
   * Incidències obertes creades per clients:
   * Provenen de la taula incidencies (sols tenen client, no tenen professional assignat encara).
   */
  get incidenciesFiltrades() {
    const rawIncidencies = (this.dashboard?.incidencies ?? []).map((inc) => ({
      id: inc.id,
      titol: inc.titol,
      descripcio: inc.descripcio,
      categoria: inc.categoria,
      client: inc.clientNom || (inc as any).client || '',
      clientId: inc.clientId,
      professional: undefined,
      budget: inc.budget,
      estat: inc.estat,
      tipus: 'incidencia'
    }));

    const rawTasks = (this.dashboard?.tasks ?? [])
      .filter(
        (t) =>
          (t.tipus === 'incidencia' || !t.professional) &&
          t.estat !== 'Finalitzada' &&
          t.estat !== 'En curs' &&
          t.tipus !== 'oferta' &&
          !rawIncidencies.some((i) => i.id === t.id)
      )
      .map((t) => ({
        id: t.id,
        titol: t.titol,
        descripcio: t.descripcio,
        categoria: t.categoria,
        client: t.client,
        clientId: (t as any).clientId,
        professional: undefined,
        budget: t.budget,
        estat: t.estat,
        tipus: 'incidencia'
      }));

    let llista = [...rawIncidencies, ...rawTasks].filter(
      (t) => t.estat !== 'Finalitzada' && t.estat !== 'En curs'
    );

    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase().trim();
      llista = llista.filter((t) => {
        const cat = t.categoria?.trim() || 'Altres Serveis';
        return (
          t.titol.toLowerCase().includes(q) ||
          (t.client && t.client.toLowerCase().includes(q)) ||
          cat.toLowerCase().includes(q) ||
          (t.descripcio && t.descripcio.toLowerCase().includes(q))
        );
      });
    }

    if (this.categoriaSeleccionada !== 'totes') {
      const cat = this.categoriaSeleccionada.toLowerCase();
      llista = llista.filter((t) => {
        const tCat = (t.categoria?.trim() || 'Altres Serveis').toLowerCase();
        return tCat.includes(cat) || cat.includes(tCat);
      });
    }

    return llista;
  }

  /**
   * Ofertes i packs publicats per professionals:
   * Sols tenen professional, no tenen client assignat encara.
   */
  get ofertesFiltrades() {
    let llista = this.dashboard?.offers ?? [];

    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase().trim();
      llista = llista.filter((o) => {
        const targetId = o.tascaId || (o as any).incidenciaId;
        const titolTasca = this.getTascaTitol(targetId).toLowerCase();
        const cat = this.getOfertaCategoria(o).toLowerCase();
        const titolOferta = this.getOfertaTitol(o).toLowerCase();
        return (
          titolOferta.includes(q) ||
          o.professional.toLowerCase().includes(q) ||
          (o.note && o.note.toLowerCase().includes(q)) ||
          titolTasca.includes(q) ||
          cat.includes(q)
        );
      });
    }

    if (this.categoriaSeleccionada !== 'totes') {
      const cat = this.categoriaSeleccionada.toLowerCase();
      llista = llista.filter((o) => {
        const oCat = this.getOfertaCategoria(o).toLowerCase();
        return oCat.includes(cat) || cat.includes(oCat);
      });
    }

    return llista;
  }

  /**
   * Tasques acordades:
   * On ja convergeixen Client I Professional obligatoris!
   * PRIVADESA: Les tasques acordades només són visibles per als 2 usuaris implicats (client i professional) i per a l'admin al panell de control.
   */
  get tasquesFiltrades() {
    const user = this.authService.getCurrentUser();
    // Si no hi ha sessió iniciada, les tasques privades no són visibles
    if (!user) {
      return [];
    }

    let llista = (this.dashboard?.tasks ?? []).filter(
      (t) => (t.tipus === 'tasca' || (!!t.professional && !!t.client)) && t.tipus !== 'oferta'
    );

    // Si no és administrador, filtrar exclusivament per als 2 usuaris implicats
    if (!this.authService.isAdmin()) {
      const uNom = (user.nom || '').toLowerCase();
      const uId = (user.id || '').toLowerCase();
      llista = llista.filter((t) => {
        const isClient = (t.client && t.client.toLowerCase() === uNom) ||
                         ((t as any).clientId && String((t as any).clientId).toLowerCase() === uId) ||
                         ((t as any).clientNom && String((t as any).clientNom).toLowerCase() === uNom);
        const isPro = (t.professional && t.professional.toLowerCase() === uNom) ||
                      ((t as any).professionalId && String((t as any).professionalId).toLowerCase() === uId) ||
                      ((t as any).professionalNom && String((t as any).professionalNom).toLowerCase() === uNom);
        return isClient || isPro;
      });
    }

    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase().trim();
      llista = llista.filter((t) => {
        const cat = t.categoria?.trim() || 'Altres Serveis';
        const pro = t.professional?.toLowerCase() || '';
        const cli = t.client?.toLowerCase() || '';
        return (
          t.titol.toLowerCase().includes(q) ||
          cli.includes(q) ||
          pro.includes(q) ||
          cat.toLowerCase().includes(q) ||
          (t.descripcio && t.descripcio.toLowerCase().includes(q))
        );
      });
    }

    if (this.categoriaSeleccionada !== 'totes') {
      const cat = this.categoriaSeleccionada.toLowerCase();
      llista = llista.filter((t) => {
        const tCat = (t.categoria?.trim() || 'Altres Serveis').toLowerCase();
        return tCat.includes(cat) || cat.includes(tCat);
      });
    }

    return llista;
  }

  getTascaTitol(tascaId: string): string {
    const task = this.dashboard?.tasks.find((t) => t.id === tascaId);
    if (task) return task.titol;
    const inc = this.dashboard?.incidencies?.find((i) => i.id === tascaId);
    if (inc) return inc.titol;
    return tascaId;
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

  onNovaIncidencia(): void {
    if (!this.requireLogin('publicar una incidència', '/client/crear-tasca')) return;
    if (this.authService.isClient()) {
      this.router.navigate(['/client/crear-tasca'], { queryParams: { origen: 'tasques-ofertes' } });
    } else {
      this.noticeMessage = 'Només els comptes amb rol de "Client" o "Ambdós" poden publicar incidències.';
    }
  }

  onNovaOferta(): void {
    if (!this.requireLogin('publicar una oferta professional', '/professional/crear-oferta')) return;
    if (this.authService.isProfessional()) {
      this.router.navigate(['/professional/crear-oferta'], { queryParams: { origen: 'tasques-ofertes' } });
    } else {
      this.noticeMessage = 'Només els comptes amb rol de "Professional" o "Ambdós" poden publicar ofertes de servei.';
    }
  }

  onNovaTasca(): void {
    this.onNovaIncidencia();
  }

  onDetallTasca(taskId: string): void {
    if (!this.requireLogin(`veure el detall de la tasca ${taskId}`, `/tasca-detall/${taskId}`)) return;
    this.router.navigate(['/tasca-detall', taskId]);
  }

  onFerOferta(taskId: string): void {
    if (!this.requireLogin(`fer una oferta per a la tasca ${taskId}`, '/professional/crear-oferta')) return;
    if (this.authService.isProfessional()) {
      this.router.navigate(['/professional/crear-oferta'], { queryParams: { taskId, origen: 'tasques-ofertes' } });
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

  /**
   * Contractar una oferta d'un professional i convertir-la directament en TASCA ('OFERTA to TAREA').
   */
  onContractarOferta(offer: any): void {
    const pro = offer.professional || 'aquest professional';
    if (!this.requireLogin(`contractar l'oferta de ${pro}`, '/tasques-ofertes')) return;
    const user = this.authService.getCurrentUser();
    if (!this.authService.isClient()) {
      this.noticeMessage = 'Només els comptes amb rol de "Client" o "Ambdós" poden contractar ofertes de professionals.';
      return;
    }

    const preu = offer.price || '';
    const confirmacio = confirm(
      `Vols contractar el servei de ${pro} per ${preu}?\n\n` +
      `Aquesta acció generarà automàticament una nova TASCA en curs al teu panell i notificarà al professional.`
    );
    if (!confirmacio) return;

    this.ofertaService.contractar(offer.id, user ? user.nom : 'Client AVISA').subscribe({
      next: (tascaCreada) => {
        this.noticeMessage = `Enhorabona! Has contractat l'oferta de ${pro} (${preu}). S'ha generat la teva nova TASCA en curs!`;
        this.carregarDades();
      },
      error: () => {
        this.noticeMessage = 'No s’ha pogut completar la contractació de l’oferta. Si us plau, torna-ho a provar.';
      }
    });
  }

  isOfferOwner(offer: any): boolean {
    const user = this.authService.getCurrentUser();
    if (!user) return false;
    if (user.rol === 'admin') return true;
    const pro = (offer.professional || '').toLowerCase().trim();
    const curNom = (user.nom || '').toLowerCase().trim();
    const curId = (user.id || '').toLowerCase().trim();
    return pro === curNom || pro === curId;
  }

  onDeleteOferta(offerId: string): void {
    if (!confirm('Vols borrar aquesta oferta? Aquesta acció no es pot desfer.')) return;
    this.ofertaService.delete(offerId).subscribe({
      next: () => {
        this.noticeMessage = 'Oferta esborrada correctament.';
        this.carregarDades();
      },
      error: () => {
        this.noticeMessage = 'No s’ha pogut borrar l’oferta.';
      }
    });
  }
}
