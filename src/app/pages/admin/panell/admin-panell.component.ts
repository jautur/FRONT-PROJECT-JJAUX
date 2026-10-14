import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TascaService } from '../../../services/tasca.service';
import { OfertaService } from '../../../services/oferta.service';
import { UsuariService } from '../../../services/usuari.service';
import { AvisService } from '../../../services/avis.service';
import { Tasca } from '../../../models/tasca.model';
import { Oferta } from '../../../models/oferta.model';
import { Usuari } from '../../../models/usuari.model';
import { AuthService } from '../../../core/services/auth.service';

/**
 * Pestanya activa al panell d'administració.
 */
type AdminTab = 'tasques' | 'ofertes' | 'usuaris';

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
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="admin-container">
      <!-- Capçalera del Panell -->
      <div class="admin-header">
        <div class="title-group">
          <div class="admin-badge">ADMINISTRACIÓ GLOBAL</div>
          <h2>🛡️ Panell de Control i Supervisió JJAUX</h2>
          <p class="subtitle">Gestió centralitzada de tots els usuaris, tasques publicades i ofertes del sistema.</p>
        </div>
        <div class="refresh-group">
          <button type="button" class="btn-refresh" (click)="carregarDades()" [disabled]="loading">
            🔄 {{ loading ? 'Actualitzant...' : 'Actualitzar dades' }}
          </button>
        </div>
      </div>

      <!-- Mètriques globals -->
      <div class="metrics-grid">
        <div class="metric-card">
          <span class="metric-icon">👥</span>
          <div class="metric-info">
            <span class="metric-value">{{ usuaris.length }}</span>
            <span class="metric-label">Usuaris Registrats</span>
          </div>
        </div>

        <div class="metric-card">
          <span class="metric-icon">📋</span>
          <div class="metric-info">
            <span class="metric-value">{{ tasques.length }}</span>
            <span class="metric-label">Tasques Totals</span>
            <small class="metric-sub">{{ countTasquesObertes() }} obertes · {{ countTasquesEnCurs() }} en curs</small>
          </div>
        </div>

        <div class="metric-card">
          <span class="metric-icon">💼</span>
          <div class="metric-info">
            <span class="metric-value">{{ ofertes.length }}</span>
            <span class="metric-label">Ofertes Presentades</span>
            <small class="metric-sub">{{ countOfertesAcceptades() }} acceptades</small>
          </div>
        </div>

        <div class="metric-card">
          <span class="metric-icon">🔔</span>
          <div class="metric-info">
            <span class="metric-value">{{ totalAvisos }}</span>
            <span class="metric-label">Avisos de Sistema</span>
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
          📋 Llistat Complet de Tasques ({{ tasques.length }})
        </button>
        <button
          type="button"
          class="tab-btn"
          [class.active]="tabActiva === 'ofertes'"
          (click)="canviarTab('ofertes')"
        >
          💼 Llistat Complet d'Ofertes ({{ ofertes.length }})
        </button>
        <button
          type="button"
          class="tab-btn"
          [class.active]="tabActiva === 'usuaris'"
          (click)="canviarTab('usuaris')"
        >
          👥 Usuaris del Sistema ({{ usuaris.length }})
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
            placeholder="🔍 Cerca per títol, client o descripció..."
            class="search-input"
          />
          <select [(ngModel)]="filtreEstatTasca" class="select-filter">
            <option value="tots">Tots els estats</option>
            <option value="oberta">Obertes</option>
            <option value="curs">En curs</option>
            <option value="finalitzada">Finalitzades</option>
          </select>
        </div>

        <div class="table-wrapper" *ngIf="tasquesFiltrades.length > 0">
          <table class="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Títol i Descripció</th>
                <th>Client</th>
                <th>Categoria</th>
                <th>Pressupost</th>
                <th>Estat</th>
                <th>Accions Administrador</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let t of tasquesFiltrades">
                <td class="font-mono"><strong>{{ t.id }}</strong></td>
                <td>
                  <div class="table-titol">{{ t.titol }}</div>
                  <div class="table-desc">{{ t.descripcio }}</div>
                </td>
                <td>{{ t.clientNom || t.client }}</td>
                <td><span class="tag-cat">{{ t.categoria }}</span></td>
                <td><strong>{{ t.budget }}</strong></td>
                <td>
                  <span class="badge-status" [ngClass]="getEstatTascaClass(t.estat)">
                    {{ t.estat }}
                  </span>
                </td>
                <td>
                  <div class="action-buttons">
                    <a [routerLink]="['/tasca-detall', t.id]" class="btn-sm btn-info" title="Revisar detall i ofertes">
                      👁️ Detall
                    </a>
                    <button
                      *ngIf="t.estat !== 'Finalitzada'"
                      type="button"
                      class="btn-sm btn-success"
                      (click)="finalitzarTasca(t.id)"
                      title="Forçar finalització"
                    >
                      ✓ Finalitzar
                    </button>
                    <button
                      type="button"
                      class="btn-sm btn-danger"
                      (click)="eliminarTasca(t.id)"
                      title="Eliminar tasca de la base de dades"
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="empty-box" *ngIf="tasquesFiltrades.length === 0">
          Cap tasca coincideix amb els filtres de cerca.
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
            placeholder="🔍 Cerca per professional, ref. tasca o nota..."
            class="search-input"
          />
          <select [(ngModel)]="filtreEstatOferta" class="select-filter">
            <option value="tots">Tots els estats</option>
            <option value="pendent">Pendents</option>
            <option value="acceptada">Acceptades</option>
            <option value="rebutjada">Rebutjades</option>
          </select>
        </div>

        <div class="table-wrapper" *ngIf="ofertesFiltrades.length > 0">
          <table class="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Ref. Tasca</th>
                <th>Professional</th>
                <th>Preu Proposat</th>
                <th>Nota / Justificació</th>
                <th>Estat</th>
                <th>Accions Administrador</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let o of ofertesFiltrades">
                <td class="font-mono"><strong>{{ o.id }}</strong></td>
                <td>
                  <a [routerLink]="['/tasca-detall', o.tascaId]" class="link-ref">
                    {{ o.tascaId }}
                  </a>
                </td>
                <td><strong>{{ o.professionalNom || o.professional }}</strong></td>
                <td class="price-cell">{{ o.price }}</td>
                <td class="note-cell">{{ o.note || '-' }}</td>
                <td>
                  <span class="badge-status" [ngClass]="getEstatOfertaClass(o.estat)">
                    {{ o.estat }}
                  </span>
                </td>
                <td>
                  <div class="action-buttons">
                    <button
                      *ngIf="o.estat !== 'Acceptada'"
                      type="button"
                      class="btn-sm btn-success"
                      (click)="acceptarOferta(o.id)"
                      title="Acceptar oferta"
                    >
                      ✓ Acceptar
                    </button>
                    <button
                      *ngIf="o.estat !== 'Rebutjada'"
                      type="button"
                      class="btn-sm btn-warning"
                      (click)="rebutjarOferta(o.id)"
                      title="Rebutjar oferta"
                    >
                      ✕ Rebutjar
                    </button>
                    <a [routerLink]="['/tasca-detall', o.tascaId]" class="btn-sm btn-info" title="Anar a la tasca">
                      👁️ Tasca
                    </a>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="empty-box" *ngIf="ofertesFiltrades.length === 0">
          Cap oferta coincideix amb els filtres de cerca.
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
            placeholder="🔍 Cerca per nom, email o telèfon..."
            class="search-input"
          />
          <select [(ngModel)]="filtreRolUsuari" class="select-filter">
            <option value="tots">Tots els rols</option>
            <option value="client">Client</option>
            <option value="professional">Professional (Client + Resolutor)</option>
            <option value="admin">Administrador</option>
          </select>
        </div>

        <div class="table-wrapper" *ngIf="usuarisFiltrats.length > 0">
          <table class="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nom d'usuari</th>
                <th>Correu electrònic</th>
                <th>Rol</th>
                <th>Telèfon</th>
                <th>Biografia / Perfil</th>
                <th>Accions Administrador</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let u of usuarisFiltrats">
                <td class="font-mono"><strong>{{ u.id }}</strong></td>
                <td><strong>{{ u.nom }}</strong></td>
                <td>{{ u.email }}</td>
                <td>
                  <span class="user-badge-tag" [ngClass]="u.rol">
                    {{ u.rol | uppercase }}
                  </span>
                </td>
                <td>{{ u.telefon || '-' }}</td>
                <td class="bio-cell">{{ u.bio || '-' }}</td>
                <td>
                  <div class="action-buttons">
                    <button
                      type="button"
                      class="btn-sm btn-password"
                      (click)="obrirModalPassword(u)"
                      title="Canviar contrasenya d'aquest usuari"
                    >
                      🔑 Nova contrasenya
                    </button>
                    <button
                      *ngIf="u.id !== 'u-admin' && u.email !== 'admin@admin'"
                      type="button"
                      class="btn-sm btn-danger"
                      (click)="eliminarUsuari(u)"
                      title="Eliminar aquest usuari de la base de dades"
                    >
                      🗑️ Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="empty-box" *ngIf="usuarisFiltrats.length === 0">
          Cap usuari coincideix amb els criteris de cerca.
        </div>
      </section>

      <!-- ============================================================== -->
      <!-- MODAL D'ADMINISTRADOR: ASSIGNAR NOVA CONTRASENYA SENSE ANTIGA -->
      <!-- ============================================================== -->
      <div class="modal-backdrop" *ngIf="modalPasswordObert">
        <div class="modal-card">
          <div class="modal-header">
            <h3>🔑 Assignar Nova Contrasenya</h3>
            <button type="button" class="btn-close" (click)="tancarModalPassword()">✕</button>
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
              🔒 <strong>Privilegi d'Administrador:</strong> Pots assignar directament una nova contrasenya sense conèixer ni veure la contrasenya anterior de l'usuari.
            </div>

            <div class="form-group">
              <label for="adminNovaPass">Nova Contrasenya:</label>
              <div class="input-password-wrapper">
                <input
                  id="adminNovaPass"
                  [type]="mostrarPassword ? 'text' : 'password'"
                  [(ngModel)]="novaContrasenya"
                  placeholder="Mínim 6 caràcters..."
                  class="form-control"
                />
                <button type="button" class="btn-toggle-eye" (click)="mostrarPassword = !mostrarPassword" title="Mostrar/Amagar">
                  {{ mostrarPassword ? '🙈' : '👁️' }}
                </button>
              </div>
            </div>

            <div class="form-group">
              <label for="adminConfirmaPass">Confirmar Nova Contrasenya:</label>
              <input
                id="adminConfirmaPass"
                [type]="mostrarPassword ? 'text' : 'password'"
                [(ngModel)]="confirmarContrasenya"
                placeholder="Torna a escriure la nova contrasenya..."
                class="form-control"
              />
            </div>

            <div class="modal-error" *ngIf="errorModalPassword">
              ⚠️ {{ errorModalPassword }}
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn-secondary" (click)="tancarModalPassword()" [disabled]="savingPassword">
              Cancel·lar
            </button>
            <button type="button" class="btn-primary" (click)="guardarNovaPassword()" [disabled]="savingPassword">
              {{ savingPassword ? 'Actualitzant...' : '💾 Desar Nova Contrasenya' }}
            </button>
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
      background: rgba(0, 255, 102, 0.1);
      color: #00ff66;
      border: 1px solid rgba(0, 255, 102, 0.3);
      font-size: 0.72rem;
      font-weight: 900;
      letter-spacing: 0.12em;
      padding: 0.25rem 0.65rem;
      border-radius: 4px;
      margin-bottom: 0.5rem;
    }
    .title-group h2 {
      margin: 0 0 0.35rem 0;
      color: #f5f4ef;
      font-size: 1.85rem;
      font-weight: 900;
      letter-spacing: -0.02em;
    }
    .subtitle {
      margin: 0;
      color: #bab8ae;
      font-size: 0.95rem;
      font-weight: 500;
    }
    .btn-refresh {
      background: #111116;
      border: 1px solid #2a2a38;
      padding: 0.65rem 1.25rem;
      border-radius: 8px;
      font-weight: 800;
      font-size: 0.88rem;
      color: #f5f4ef;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .btn-refresh:hover:not(:disabled) {
      border-color: #00ff66;
      color: #00ff66;
      box-shadow: 0 0 12px rgba(0, 255, 102, 0.2);
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
      background: #111116;
      border: 1px solid #1e1e28;
      border-radius: 14px;
      padding: 1.35rem;
      display: flex;
      align-items: center;
      gap: 1.1rem;
      transition: border-color 0.2s;
    }
    .metric-card:hover {
      border-color: rgba(0, 255, 102, 0.35);
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
      color: #f5f4ef;
      line-height: 1.1;
    }
    .metric-label {
      font-size: 0.85rem;
      color: #bab8ae;
      font-weight: 700;
      margin-top: 0.25rem;
    }
    .metric-sub {
      font-size: 0.75rem;
      color: #71717a;
      margin-top: 0.2rem;
      font-weight: 600;
    }
    .nav-tabs {
      display: flex;
      gap: 0.65rem;
      margin-bottom: 1.5rem;
      border-bottom: 1px solid #1e1e28;
      padding-bottom: 0.75rem;
      flex-wrap: wrap;
    }
    .tab-btn {
      background: #111116;
      border: 1px solid #242432;
      padding: 0.65rem 1.25rem;
      border-radius: 8px;
      font-size: 0.92rem;
      font-weight: 800;
      color: #bab8ae;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .tab-btn:hover {
      border-color: #00ff66;
      color: #f5f4ef;
    }
    .tab-btn.active {
      background: #00ff66;
      border-color: #00ff66;
      color: #08080a;
      font-weight: 900;
      box-shadow: 0 0 15px rgba(0, 255, 102, 0.35);
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
      background: #111116;
      border: 1px solid #242432;
      border-radius: 8px;
      font-size: 0.9rem;
      color: #f5f4ef;
      font-weight: 600;
    }
    .search-input:focus {
      outline: none;
      border-color: #00ff66;
      box-shadow: 0 0 10px rgba(0, 255, 102, 0.2);
    }
    .select-filter {
      padding: 0.75rem 1rem;
      background: #111116;
      border: 1px solid #242432;
      border-radius: 8px;
      font-size: 0.9rem;
      color: #f5f4ef;
      font-weight: 700;
      cursor: pointer;
    }
    .select-filter:focus {
      outline: none;
      border-color: #00ff66;
    }
    .table-wrapper {
      background: #111116;
      border: 1px solid #1e1e28;
      border-radius: 12px;
      overflow-x: auto;
    }
    .data-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
      font-size: 0.9rem;
    }
    .data-table th {
      background: #161620;
      color: #f5f4ef;
      padding: 0.9rem 1rem;
      font-weight: 800;
      border-bottom: 1px solid #1e1e28;
      white-space: nowrap;
      letter-spacing: 0.03em;
    }
    .data-table td {
      padding: 0.9rem 1rem;
      border-bottom: 1px solid #181824;
      vertical-align: middle;
      color: #f5f4ef;
    }
    .data-table tr:hover {
      background: #171722;
    }
    .font-mono {
      font-family: monospace;
      color: #00ff66;
      font-weight: 800;
    }
    .table-titol {
      font-weight: 800;
      color: #f5f4ef;
      margin-bottom: 0.2rem;
    }
    .table-desc {
      font-size: 0.8rem;
      color: #bab8ae;
      max-width: 280px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .tag-cat {
      background: #181824;
      border: 1px solid #242432;
      color: #bab8ae;
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
      background: rgba(0, 255, 102, 0.12);
      color: #00ff66;
      border: 1px solid rgba(0, 255, 102, 0.3);
    }
    .badge-en-curs {
      background: rgba(245, 158, 11, 0.12);
      color: #f59e0b;
      border: 1px solid rgba(245, 158, 11, 0.3);
    }
    .badge-finalitzada {
      background: rgba(148, 163, 184, 0.12);
      color: #94a3b8;
      border: 1px solid rgba(148, 163, 184, 0.25);
    }
    .badge-pendent {
      background: rgba(245, 158, 11, 0.12);
      color: #f59e0b;
      border: 1px solid rgba(245, 158, 11, 0.3);
    }
    .badge-acceptada {
      background: rgba(0, 255, 102, 0.12);
      color: #00ff66;
      border: 1px solid rgba(0, 255, 102, 0.3);
    }
    .badge-rebutjada {
      background: rgba(239, 68, 68, 0.12);
      color: #ef4444;
      border: 1px solid rgba(239, 68, 68, 0.3);
    }
    .price-cell {
      font-weight: 900;
      color: #00ff66;
      font-size: 0.95rem;
    }
    .note-cell {
      max-width: 220px;
      font-size: 0.82rem;
      color: #bab8ae;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      font-style: italic;
    }
    .link-ref {
      color: #00ff66;
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
      background: #181824;
      color: #f5f4ef;
      border-color: #2a2a3c;
    }
    .btn-info:hover {
      border-color: #00ff66;
      color: #00ff66;
    }
    .btn-success {
      background: rgba(0, 255, 102, 0.1);
      color: #00ff66;
      border-color: rgba(0, 255, 102, 0.3);
    }
    .btn-success:hover {
      background: rgba(0, 255, 102, 0.2);
    }
    .btn-warning {
      background: rgba(245, 158, 11, 0.1);
      color: #f59e0b;
      border-color: rgba(245, 158, 11, 0.3);
    }
    .btn-warning:hover {
      background: rgba(245, 158, 11, 0.2);
    }
    .btn-danger {
      background: rgba(239, 68, 68, 0.1);
      color: #ef4444;
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
      background: rgba(59, 130, 246, 0.15);
      color: #60a5fa;
      border: 1px solid rgba(59, 130, 246, 0.3);
    }
    .user-badge-tag.professional {
      background: rgba(0, 255, 102, 0.12);
      color: #00ff66;
      border: 1px solid rgba(0, 255, 102, 0.3);
    }
    .user-badge-tag.ambdos {
      background: rgba(168, 85, 247, 0.15);
      color: #c084fc;
      border: 1px solid rgba(168, 85, 247, 0.3);
    }
    .user-badge-tag.admin {
      background: rgba(236, 72, 153, 0.15);
      color: #f472b6;
      border: 1px solid rgba(236, 72, 153, 0.3);
    }
    .bio-cell {
      max-width: 250px;
      font-size: 0.8rem;
      color: #bab8ae;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .empty-box {
      text-align: center;
      padding: 2.5rem;
      background: #111116;
      border-radius: 12px;
      border: 1px dashed #242432;
      color: #bab8ae;
      font-weight: 700;
    }
    .alert-success {
      background: rgba(0, 255, 102, 0.1);
      color: #00ff66;
      border: 1px solid rgba(0, 255, 102, 0.3);
      padding: 0.75rem 1rem;
      border-radius: 8px;
      margin-bottom: 1rem;
      font-weight: 700;
    }
    .alert-error {
      background: rgba(239, 68, 68, 0.1);
      color: #ef4444;
      border: 1px solid rgba(239, 68, 68, 0.3);
      padding: 0.75rem 1rem;
      border-radius: 8px;
      margin-bottom: 1rem;
      font-weight: 700;
    }
    .btn-password {
      background: rgba(0, 255, 102, 0.1);
      color: #00ff66;
      border: 1px solid rgba(0, 255, 102, 0.3);
      padding: 0.35rem 0.65rem;
      border-radius: 6px;
      font-size: 0.8rem;
      cursor: pointer;
      font-weight: 800;
      transition: all 0.2s;
    }
    .btn-password:hover {
      background: #00ff66;
      color: #08080a;
      box-shadow: 0 0 10px rgba(0, 255, 102, 0.4);
    }
    .modal-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.85);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      backdrop-filter: blur(4px);
    }
    .modal-card {
      background: #111116;
      width: 100%;
      max-width: 480px;
      border-radius: 14px;
      border: 1px solid #242432;
      box-shadow: 0 20px 35px rgba(0, 0, 0, 0.6);
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
      background: #161620;
      border-bottom: 1px solid #1e1e28;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .modal-header h3 {
      margin: 0;
      font-size: 1.15rem;
      color: #f5f4ef;
      font-weight: 800;
      display: flex;
      align-items: center;
      gap: 0.4rem;
    }
    .btn-close {
      background: none;
      border: none;
      font-size: 1.25rem;
      color: #bab8ae;
      cursor: pointer;
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
    }
    .btn-close:hover {
      color: #00ff66;
    }
    .modal-body {
      padding: 1.4rem;
      display: flex;
      flex-direction: column;
      gap: 1.1rem;
    }
    .user-highlight {
      background: #181824;
      border: 1px solid #242432;
      padding: 0.75rem 1rem;
      border-radius: 8px;
      font-size: 0.9rem;
      color: #f5f4ef;
      font-weight: 700;
    }
    .user-subinfo {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-top: 0.25rem;
      color: #bab8ae;
      font-weight: 500;
    }
    .alert-info-box {
      background: rgba(0, 255, 102, 0.05);
      border-left: 3px solid #00ff66;
      color: #bab8ae;
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
      color: #bab8ae;
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
      background: #181822;
      border: 1px solid #282836;
      border-radius: 6px;
      font-size: 0.9rem;
      color: #f5f4ef;
      box-sizing: border-box;
      outline: none;
      transition: border-color 0.2s;
    }
    .form-control:focus {
      border-color: #00ff66;
      box-shadow: 0 0 10px rgba(0, 255, 102, 0.2);
    }
    .modal-error {
      background: rgba(239, 68, 68, 0.1);
      color: #ef4444;
      border: 1px solid rgba(239, 68, 68, 0.3);
      padding: 0.6rem 0.8rem;
      border-radius: 6px;
      font-size: 0.82rem;
      font-weight: 700;
    }
    .modal-footer {
      padding: 1rem 1.4rem;
      background: #161620;
      border-top: 1px solid #1e1e28;
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
    }
    .btn-secondary {
      padding: 0.6rem 1.1rem;
      background: #1e1e2a;
      border: 1px solid #2c2c3e;
      border-radius: 6px;
      color: #bab8ae;
      font-weight: 800;
      font-size: 0.85rem;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn-secondary:hover {
      border-color: #bab8ae;
      color: #f5f4ef;
    }
    .btn-primary {
      padding: 0.6rem 1.25rem;
      background: #00ff66;
      border: 1px solid #00ff66;
      border-radius: 6px;
      color: #08080a;
      font-weight: 900;
      font-size: 0.85rem;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn-primary:hover:not(:disabled) {
      background: #00dd55;
      box-shadow: 0 0 15px rgba(0, 255, 102, 0.4);
    }
    .btn-primary:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  `]
})
export class AdminPanellComponent implements OnInit {
  /** Llista de totes les tasques de la plataforma */
  tasques: Tasca[] = [];
  /** Llista de totes les ofertes i pressupostos presentats */
  ofertes: Oferta[] = [];
  /** Llista de tots els usuaris donats d'alta */
  usuaris: Usuari[] = [];
  /** Total de notificacions i avisos */
  totalAvisos = 0;

  /** Pestanya actual seleccionada ('tasques' | 'ofertes' | 'usuaris') */
  tabActiva: AdminTab = 'tasques';

  /** Criteris de cerca i filtres */
  searchTasca = '';
  filtreEstatTasca = 'tots';

  searchOferta = '';
  filtreEstatOferta = 'tots';

  searchUsuari = '';
  filtreRolUsuari = 'tots';

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

  constructor(
    private readonly tascaService: TascaService,
    private readonly ofertaService: OfertaService,
    private readonly usuariService: UsuariService,
    private readonly avisService: AvisService,
    private readonly authService: AuthService
  ) {}

  /**
   * Cicle de vida inicial del component: obté totes les dades del backend.
   */
  ngOnInit(): void {
    this.carregarDades();
  }

  /**
   * Carrega en paral·lel totes les tasques, ofertes, usuaris i avisos de PostgreSQL.
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
      next: (a) => this.totalAvisos = a.length,
      error: () => this.totalAvisos = 0
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
      const matchSearch =
        !this.searchOferta ||
        proName.toLowerCase().includes(this.searchOferta.toLowerCase()) ||
        o.tascaId?.toLowerCase().includes(this.searchOferta.toLowerCase()) ||
        o.note?.toLowerCase().includes(this.searchOferta.toLowerCase()) ||
        o.price?.toLowerCase().includes(this.searchOferta.toLowerCase());

      const matchEstat =
        this.filtreEstatOferta === 'tots' ||
        o.estat?.toLowerCase().includes(this.filtreEstatOferta);

      return matchSearch && matchEstat;
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
  finalitzarTasca(id: string): void {
    if (!confirm(`Com a Administrador, segur que vols marcar la tasca ${id} com a finalitzada?`)) return;

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
  eliminarTasca(id: string): void {
    if (!confirm(`ATENCIÓ: Vols eliminar definitivament la tasca ${id} i totes les seves ofertes?`)) return;

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
   * Acció d'administrador: rebutja una oferta concreta.
   * @param offerId Identificador de l'oferta
   */
  rebutjarOferta(offerId: string): void {
    this.ofertaService.reject(offerId).subscribe({
      next: () => {
        this.successMsg = `Oferta ${offerId} rebutjada.`;
        const o = this.ofertes.find(x => x.id === offerId);
        if (o) o.estat = 'Rebutjada';
        setTimeout(() => this.successMsg = '', 3500);
      },
      error: () => this.errorMsg = 'Error en rebutjar l’oferta.'
    });
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
   * Acció d'administrador: elimina definitivament un usuari del sistema.
   * Protegeix el compte d'administrador principal contra eliminació accidental.
   * @param u Usuari seleccionat per a ser donat de baixa
   */
  eliminarUsuari(u: Usuari): void {
    if (u.id === 'u-admin' || u.email?.toLowerCase() === 'admin@admin') {
      alert("No es pot eliminar el compte d'administrador principal del sistema.");
      return;
    }

    const confirmMsg = `ATENCIÓ: Vols eliminar definitivament l'usuari "${u.nom}" (${u.email})?\n\n` +
      `Es cancel·larà el seu accés i s'esborraran els seus avisos associats.\n` +
      `Aquesta acció no es pot desfer. Vols continuar?`;

    if (!confirm(confirmMsg)) return;

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
}
