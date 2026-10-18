import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Usuari } from '../../models/usuari.model';
import { UsuariService } from '../../services/usuari.service';
import { AuthService } from '../../core/services/auth.service';
import { Tasca } from '../../models/tasca.model';
import { TascaService } from '../../services/tasca.service';

/**
 * Component de Perfil d'Usuari (/perfil).
 * Permet a l'usuari autenticat:
 * 1. Consultar la seva informació actual (nom, correu, rol, telèfon, biografia).
 * 2. Editar i desar canvis a la base de dades PostgreSQL mitjançant UsuariService.
 * 3. Canviar la seva contrasenya d'accés de forma segura.
 * 4. Visualitzar l'historial de tasques realitzades amb valoracions i opinions directes dels clients.
 */
@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="perfil-container">
      <!-- Capçalera del Perfil -->
      <header class="perfil-header">
        <div class="avatar-badge">
          {{ userInitial }}
        </div>
        <div class="header-info">
          <div class="header-name-row">
            <h1>{{ usuari?.nom || 'El meu perfil' }}</h1>
            <div class="pro-rating-badge-head" *ngIf="mitjanaPuntuacio">
              <span class="stars-gold">★ {{ mitjanaPuntuacio }}</span>
              <span class="count-head">({{ totalValoracions }} {{ totalValoracions === 1 ? 'valoració' : 'valoracions' }})</span>
            </div>
          </div>
          <p class="email">{{ usuari?.email }}</p>
          <div class="badges-row">
            <span class="role-badge" [ngClass]="usuari?.rol">
              {{ usuari?.rol | uppercase }}
            </span>
            <span class="verified-badge" *ngIf="usuari?.rol === 'professional' && usuari?.verificat">
              ✓ Professional Verificat AVISA
            </span>
            <span class="pending-badge" *ngIf="usuari?.rol === 'professional' && !usuari?.verificat && usuari?.sollicitudVerificacio">
              ⏳ Verificació Pendent (Trucada)
            </span>
            <span class="unverified-badge" *ngIf="usuari?.rol === 'professional' && !usuari?.verificat && !usuari?.sollicitudVerificacio">
              ⚠️ No verificat
            </span>
          </div>
        </div>
      </header>

      <!-- Missatges d'alerta o notificació -->
      <div *ngIf="successMessage" class="alert alert-success">
        {{ successMessage }}
      </div>
      <div *ngIf="errorMessage" class="alert alert-danger">
        {{ errorMessage }}
      </div>

      <!-- Vista per al propi perfil (editable) -->
      <div class="perfil-grid" *ngIf="isOwnProfile">
        <!-- Formulari d'edició de dades bàsiques -->
        <article class="card">
          <h2>Dades personals</h2>
          <p class="subtitle">Actualitza la teva informació de contacte i presentació.</p>

          <form (ngSubmit)="onSaveProfile()">
            <label>
              Nom complet o comercial
              <input type="text" [(ngModel)]="formData.nom" name="nom" required placeholder="El teu nom" />
            </label>

            <label>
              Correu electrònic
              <input type="email" [value]="usuari?.email" disabled class="input-disabled" />
              <small class="hint">El correu s'utilitza per identificar el compte i no es pot canviar directament.</small>
            </label>

            <label>
              Telèfon de contacte
              <input type="tel" [(ngModel)]="formData.telefon" name="telefon" placeholder="+34 600 000 000" />
            </label>

            <label>
              Biografia / Presentació
              <textarea [(ngModel)]="formData.bio" name="bio" rows="4" placeholder="Explica breument la teva experiència o serveis..."></textarea>
            </label>

            <!-- Percentil de comissió reservat per a la plataforma (0-100%, defecte 3%) -->
            <label class="percentil-form-group">
              Percentil de comissió plataforma (%)
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
                  {{ formData.percentil ?? (usuari?.percentil ?? 3) }}% reservat plataforma
                </span>
              </div>
              <small class="hint" *ngIf="isAdmin" style="color: #059669; font-weight: 600; margin-top: 0.3rem; display: block;">
                ★ Com a Administrador, disposes de permisos per assignar o reduir qualsevol percentil (0% - 100%).
              </small>
              <small class="hint" *ngIf="!isAdmin" style="margin-top: 0.3rem; display: block;">
                Com a usuari pots editar el percentil per a augmentar-lo (mínim actual: {{ usuari?.percentil ?? 3 }}%). Per reduir-lo cal intervenció d'un administrador.
              </small>
              <div class="commission-simulation-box" style="margin-top: 0.5rem; padding: 0.6rem 0.85rem; background: #fdfbf7; border: 1px dashed #dcd6cb; border-radius: 6px; font-size: 0.82rem; color: #4b4841;">
                <strong>Normalització i càlcul estimat:</strong> Per a un servei de 100€, es reservaran <strong>{{ getCommissionSimulation() }}€</strong> com a comissió per a la plataforma.
              </div>
            </label>

            <button type="submit" class="btn btn-primary" [disabled]="saving">
              {{ saving ? 'Desant...' : 'Desar canvis' }}
            </button>
          </form>
        </article>

        <!-- Secció de Seguretat i Canvi de contrasenya -->
        <div class="side-column">
          <article class="card">
            <h2>Seguretat del compte</h2>
            <p class="subtitle">Canvia la contrasenya d'accés a la plataforma.</p>

            <form (ngSubmit)="onChangePassword()">
              <label>
                Nova contrasenya
                <input type="password" [(ngModel)]="passwordData.newPassword" name="newPassword" required minlength="6" placeholder="Mínim 6 caràcters" />
              </label>

              <label>
                Repeteix la nova contrasenya
                <input type="password" [(ngModel)]="passwordData.confirmPassword" name="confirmPassword" required placeholder="Repeteix la contrasenya" />
              </label>

              <button type="submit" class="btn btn-secondary" [disabled]="changingPassword">
                {{ changingPassword ? 'Actualitzant...' : 'Actualitzar contrasenya' }}
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
                <h2>Estat de Verificació</h2>
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
                <span>Email registrat: <strong>{{ usuari?.email || 'Mancant' }}</strong></span>
              </div>
              <div class="check-item" [class.valid]="!!usuari?.telefon">
                <span class="check-icon">{{ !!usuari?.telefon ? '✓' : '✗' }}</span>
                <span>Telèfon de trucada: <strong>{{ usuari?.telefon || 'Cal afegir un telèfon' }}</strong></span>
              </div>
            </div>

            <!-- Botó per sol·licitar verificació -->
            <div *ngIf="!usuari?.verificat && !usuari?.sollicitudVerificacio" style="margin-top: 0.85rem;">
              <button
                type="button"
                class="btn btn-verif"
                (click)="onSollicitarVerificacio()"
                [disabled]="sollicitantVerificacio || !usuari?.telefon">
                {{ sollicitantVerificacio ? 'Enviant sol·licitud...' : '📞 Sol·licitar Verificació per Trucada' }}
              </button>
              <small *ngIf="!usuari?.telefon" class="field-error-text" style="display:block; margin-top: 0.35rem;">
                * Cal que desis un telèfon de contacte abans de poder sol·licitar la verificació.
              </small>
            </div>

            <!-- Avís si la sol·licitud està pendent de trucada -->
            <div *ngIf="!usuari?.verificat && usuari?.sollicitudVerificacio" class="pending-notice-box" style="margin-top: 0.85rem;">
              <span class="notice-icon">📞</span>
              <div>
                <strong>Sol·licitud en curs:</strong> L'administrador d'AVISA es posarà en contacte amb tu en breu al telèfon <strong>{{ usuari?.telefon }}</strong> per comprovar la teva identitat.
              </div>
            </div>

            <!-- Avís si ja està verificat -->
            <div *ngIf="usuari?.verificat" class="verified-notice-box" style="margin-top: 0.85rem;">
              <span class="notice-icon">✓</span>
              <div>
                <strong>Compte Oficialment Verificat:</strong> La teva identitat i telèfon han estat comprovats telefònicament. Disposes del distintiu visible al mercat.
              </div>
            </div>

            <!-- Accions de l'Administrador -->
            <div *ngIf="isAdmin" class="admin-verif-actions" style="margin-top: 1.15rem; padding-top: 0.85rem; border-top: 1px dashed #cbd5e1;">
              <p style="font-size: 0.8rem; font-weight: 700; color: #475569; margin-bottom: 0.5rem;">
                ★ Acció Administrador (Comprovació Trucada):
              </p>
              <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                <button
                  type="button"
                  class="btn btn-success-sm"
                  *ngIf="!usuari?.verificat"
                  (click)="onVerificarProfessional(true)"
                  [disabled]="processantVerificacioAdmin">
                  ✓ Aprovar Trucada i Verificar
                </button>
                <button
                  type="button"
                  class="btn btn-danger-sm"
                  *ngIf="usuari?.verificat || usuari?.sollicitudVerificacio"
                  (click)="onVerificarProfessional(false)"
                  [disabled]="processantVerificacioAdmin">
                  ✕ Rebutjar / Desverificar
                </button>
              </div>
            </div>
          </article>

          <!-- Targeta informativa de rol -->
          <article class="card info-card">
            <h3>Informació del Rol</h3>
            <div *ngIf="usuari?.rol === 'client'">
              <p>Com a <strong>Client</strong>, pots publicar peticions i feines, rebre pressupostos i contractar serveis. Només necessites correu i contrasenya.</p>
            </div>
            <div *ngIf="usuari?.rol === 'professional'">
              <p>Com a <strong>Professional</strong> (fill del client), disposes de totes les funcions del client (publicar feines) i a més disposes de telèfon per <strong>resoldre peticions</strong> i enviar pressupostos a altres usuaris.</p>
            </div>
            <div *ngIf="usuari?.rol === 'admin'">
              <p>Com a <strong>Administrador</strong>, tens accés global de gestió d'usuaris, supervisió de tasques i configuració d'avisos.</p>
            </div>
          </article>
        </div>
      </div>

      <!-- Vista per a perfil públic d'un altre professional o usuari -->
      <div class="perfil-grid" *ngIf="!isOwnProfile">
        <article class="card">
          <h2>Dades de contacte i presentació</h2>
          <p class="subtitle">Informació oficial del professional registrat a la plataforma AVISA.</p>

          <div class="public-info-list">
            <div class="public-info-row" *ngIf="usuari?.telefon">
              <span class="info-label">Telèfon directe:</span>
              <strong class="info-value tel-value">{{ usuari?.telefon }}</strong>
            </div>

            <div class="public-info-row" *ngIf="usuari?.email">
              <span class="info-label">Correu electrònic:</span>
              <span class="info-value">{{ usuari?.email }}</span>
            </div>

            <div class="public-info-row" *ngIf="usuari?.percentil != null">
              <span class="info-label">Comissió plataforma (Percentil):</span>
              <strong class="info-value" style="color: #ff1744;">{{ usuari?.percentil }}%</strong>
            </div>

            <div class="public-bio-box" *ngIf="usuari?.bio">
              <span class="info-label">Biografia / Especialitat:</span>
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
                <h2>Verificació Professional</h2>
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
                ★ Acció Administrador (Comprovació Trucada):
              </p>
              <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                <button
                  type="button"
                  class="btn btn-success-sm"
                  *ngIf="!usuari?.verificat"
                  (click)="onVerificarProfessional(true)"
                  [disabled]="processantVerificacioAdmin">
                  ✓ Aprovar Trucada i Verificar
                </button>
                <button
                  type="button"
                  class="btn btn-danger-sm"
                  *ngIf="usuari?.verificat || usuari?.sollicitudVerificacio"
                  (click)="onVerificarProfessional(false)"
                  [disabled]="processantVerificacioAdmin">
                  ✕ Desverificar / Rebutjar
                </button>
              </div>
            </div>
          </article>

          <article class="card info-card">
            <h3>Garantia AVISA</h3>
            <p>
              Tots els professionals de la plataforma compten amb compte registrat, telèfon verificat i valoracions auditades per part de clients reals en finalitzar cada encàrrec.
            </p>
          </article>
        </div>
      </div>

      <!-- SECCIÓ DE TASQUES REALITZADES I VALORACIONS (directament de la taula TASQUES) -->
      <section class="card reviews-profile-card" *ngIf="tasquesFinalitzades.length > 0">
        <div class="reviews-card-header">
          <div>
            <h2>{{ usuari?.rol === 'professional' ? 'Tasques realitzades i valoracions' : 'Historial de tasques finalitzades' }}</h2>
            <p class="subtitle">
              {{ usuari?.rol === 'professional' 
                  ? 'Tasques completades a la plataforma AVISA amb la puntuació i opinió directa dels clients.' 
                  : 'Historial de feines concloses amb èxit a la plataforma.' }}
            </p>
          </div>
          <div class="score-summary-pill" *ngIf="mitjanaPuntuacio">
            <span class="stars-gold">★ {{ mitjanaPuntuacio }}</span>
            <span class="score-count">({{ totalValoracions }} {{ totalValoracions === 1 ? 'valoració' : 'valoracions' }})</span>
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
                    <span class="badge-cat" *ngIf="t.categoria">{{ t.categoria }}</span>
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
                <span class="opinion-quote-label">Opinió del client:</span>
                <p class="review-item-comment">“{{ t.opinio }}”</p>
              </div>
            </div>
          </article>
        </div>
      </section>

      <!-- Sense tasques finalitzades encara -->
      <section class="card reviews-profile-card empty-reviews" *ngIf="usuari?.rol === 'professional' && tasquesFinalitzades.length === 0">
        <h3>Encara no té tasques finalitzades</h3>
        <p class="subtitle">Aquest professional encara no ha conclòs cap tasca valorada a la plataforma AVISA.</p>
      </section>
    </section>
  `,
  styles: [
    `
      :host {
        display: flex;
        justify-content: center;
        width: 100%;
      }

      .perfil-container {
        width: min(1000px, 100%);
        margin: 0 auto;
        display: flex;
        flex-direction: column;
        gap: 1.75rem;
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
    private readonly router: Router,
    private readonly route: ActivatedRoute
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
   * Comprova l'autenticació i carrega les dades actuals des de PostgreSQL.
   */
  ngOnInit(): void {
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
          this.carregarTasquesPerfil(freshUser);
        }
      },
      error: () => {
        if (this.isOwnProfile && this.usuari) {
          this.carregarTasquesPerfil(this.usuari);
        }
      }
    });
  }

  /**
   * Carrega les tasques finalitzades de l'usuari (que contenen la valoració i opinió).
   * Les mateixes tasques completades són les que es mostren com a valoracions públiques del professional!
   */
  private carregarTasquesPerfil(user: Usuari): void {
    const ident = user.nom || user.id;
    const fetchObs = (user.rol === 'professional')
      ? this.tascaService.getByProfessional(ident)
      : this.tascaService.getByClient(ident);

    fetchObs.subscribe({
      next: (tasks) => {
        const all = tasks ?? [];
        this.tasquesFinalitzades = all.filter(
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
      },
      error: () => {
        this.tasquesFinalitzades = [];
        this.totalValoracions = 0;
        this.mitjanaPuntuacio = null;
      }
    });
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
    if (this.usuari?.verificat) return 'Oficialment Verificat';
    if (this.usuari?.sollicitudVerificacio) return 'Pendent de Trucada';
    return 'No Verificat';
  }

  getVerifDescription(): string {
    if (this.usuari?.verificat) {
      return "Enhorabona! L'equip d'administració d'AVISA ha verificat la teva identitat mitjançant trucada telefònica. Disposes del distintiu oficial a tot el mercat.";
    }
    if (this.usuari?.sollicitudVerificacio) {
      return "Hem rebut la teva sol·licitud. Un administrador et trucarà en breu al telèfon registrat per comprovar que ets tu i activar el teu distintiu.";
    }
    return "Tots els professionals comencen sense verificar. Per obtindre el distintiu de confiança oficial, sol·licita la verificació: l'administrador et trucarà per validar la teva identitat.";
  }

  getPublicVerifDescription(): string {
    if (this.usuari?.verificat) {
      return "Aquest professional ha estat contrastat oficialment mitjançant comprovació telefònica per l'administració d'AVISA.";
    }
    return "Aquest professional encara no ha completat la verificació telefònica oficial.";
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
}

