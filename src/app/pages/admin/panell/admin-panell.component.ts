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
            <option value="professional">Professional</option>
            <option value="ambdos">Ambdós (Híbrid)</option>
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
              </tr>
            </tbody>
          </table>
        </div>

        <div class="empty-box" *ngIf="usuarisFiltrats.length === 0">
          Cap usuari coincideix amb els criteris de cerca.
        </div>
      </section>
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
      margin-bottom: 1.75rem;
      gap: 1rem;
      flex-wrap: wrap;
    }
    .admin-badge {
      display: inline-block;
      background: #581c87;
      color: #f5d0fe;
      font-size: 0.72rem;
      font-weight: 800;
      letter-spacing: 0.1em;
      padding: 0.2rem 0.6rem;
      border-radius: 4px;
      margin-bottom: 0.4rem;
    }
    .title-group h2 {
      margin: 0 0 0.35rem 0;
      color: #0f172a;
      font-size: 1.65rem;
    }
    .subtitle {
      margin: 0;
      color: #64748b;
      font-size: 0.95rem;
    }
    .btn-refresh {
      background: #ffffff;
      border: 1px solid #cbd5e1;
      padding: 0.55rem 1rem;
      border-radius: 8px;
      font-weight: 600;
      font-size: 0.88rem;
      color: #334155;
      cursor: pointer;
      transition: all 0.15s ease;
    }
    .btn-refresh:hover:not(:disabled) {
      background: #f8fafc;
      border-color: #94a3b8;
    }
    .btn-refresh:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 1.25rem;
      margin-bottom: 2rem;
    }
    .metric-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 14px;
      padding: 1.25rem;
      display: flex;
      align-items: center;
      gap: 1.1rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.04);
    }
    .metric-icon {
      font-size: 2.2rem;
    }
    .metric-info {
      display: flex;
      flex-direction: column;
    }
    .metric-value {
      font-size: 1.7rem;
      font-weight: 800;
      color: #0f172a;
      line-height: 1.1;
    }
    .metric-label {
      font-size: 0.85rem;
      color: #64748b;
      font-weight: 600;
      margin-top: 0.2rem;
    }
    .metric-sub {
      font-size: 0.75rem;
      color: #94a3b8;
      margin-top: 0.15rem;
    }
    .nav-tabs {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 1.5rem;
      border-bottom: 2px solid #e2e8f0;
      padding-bottom: 0.5rem;
      flex-wrap: wrap;
    }
    .tab-btn {
      background: none;
      border: none;
      padding: 0.65rem 1.25rem;
      border-radius: 8px;
      font-size: 0.92rem;
      font-weight: 600;
      color: #64748b;
      cursor: pointer;
      transition: all 0.15s ease;
    }
    .tab-btn:hover {
      background: #f1f5f9;
      color: #0f172a;
    }
    .tab-btn.active {
      background: #0f172a;
      color: #ffffff;
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
      padding: 0.65rem 1rem;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      font-size: 0.9rem;
    }
    .search-input:focus {
      outline: none;
      border-color: #2563eb;
    }
    .select-filter {
      padding: 0.65rem 1rem;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      font-size: 0.9rem;
      background: #ffffff;
      cursor: pointer;
    }
    .table-wrapper {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      overflow-x: auto;
      box-shadow: 0 1px 3px rgba(0,0,0,0.03);
    }
    .data-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
      font-size: 0.9rem;
    }
    .data-table th {
      background: #f8fafc;
      color: #475569;
      padding: 0.85rem 1rem;
      font-weight: 700;
      border-bottom: 1px solid #e2e8f0;
      white-space: nowrap;
    }
    .data-table td {
      padding: 0.85rem 1rem;
      border-bottom: 1px solid #f1f5f9;
      vertical-align: middle;
    }
    .data-table tr:hover {
      background: #fbfcfe;
    }
    .font-mono {
      font-family: monospace;
      color: #334155;
    }
    .table-titol {
      font-weight: 600;
      color: #0f172a;
      margin-bottom: 0.2rem;
    }
    .table-desc {
      font-size: 0.8rem;
      color: #64748b;
      max-width: 280px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .tag-cat {
      background: #f1f5f9;
      color: #475569;
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
      font-size: 0.78rem;
      font-weight: 600;
    }
    .badge-status {
      padding: 0.2rem 0.55rem;
      border-radius: 5px;
      font-size: 0.78rem;
      font-weight: 700;
      display: inline-block;
    }
    .badge-oberta {
      background: #e0f2fe;
      color: #0369a1;
    }
    .badge-en-curs {
      background: #fef3c7;
      color: #92400e;
    }
    .badge-finalitzada {
      background: #dcfce7;
      color: #166534;
    }
    .badge-pendent {
      background: #fef3c7;
      color: #92400e;
    }
    .badge-acceptada {
      background: #dcfce7;
      color: #166534;
    }
    .badge-rebutjada {
      background: #fee2e2;
      color: #991b1b;
    }
    .price-cell {
      font-weight: 700;
      color: #0284c7;
      font-size: 0.95rem;
    }
    .note-cell {
      max-width: 220px;
      font-size: 0.82rem;
      color: #64748b;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      font-style: italic;
    }
    .link-ref {
      color: #2563eb;
      text-decoration: underline;
      font-weight: 600;
    }
    .action-buttons {
      display: flex;
      gap: 0.35rem;
      flex-wrap: wrap;
    }
    .btn-sm {
      padding: 0.35rem 0.65rem;
      border-radius: 5px;
      font-size: 0.78rem;
      font-weight: 600;
      cursor: pointer;
      border: 1px solid transparent;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
    }
    .btn-info {
      background: #f0f9ff;
      color: #0369a1;
      border-color: #bae6fd;
    }
    .btn-info:hover {
      background: #e0f2fe;
    }
    .btn-success {
      background: #f0fdf4;
      color: #166534;
      border-color: #bbf7d0;
    }
    .btn-success:hover {
      background: #dcfce7;
    }
    .btn-warning {
      background: #fffbeb;
      color: #92400e;
      border-color: #fde68a;
    }
    .btn-warning:hover {
      background: #fef3c7;
    }
    .btn-danger {
      background: #fef2f2;
      color: #991b1b;
      border-color: #fecaca;
    }
    .btn-danger:hover {
      background: #fee2e2;
    }
    .user-badge-tag {
      padding: 0.2rem 0.55rem;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: 700;
    }
    .user-badge-tag.client {
      background: #e0f2fe;
      color: #0369a1;
    }
    .user-badge-tag.professional {
      background: #dcfce7;
      color: #166534;
    }
    .user-badge-tag.ambdos {
      background: #ede9fe;
      color: #6d28d9;
    }
    .user-badge-tag.admin {
      background: #fae8ff;
      color: #86198f;
    }
    .bio-cell {
      max-width: 250px;
      font-size: 0.8rem;
      color: #64748b;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .empty-box {
      text-align: center;
      padding: 2.5rem;
      background: #ffffff;
      border-radius: 12px;
      border: 1px dashed #cbd5e1;
      color: #64748b;
    }
    .alert-success {
      background: #dcfce7;
      color: #166534;
      padding: 0.75rem 1rem;
      border-radius: 8px;
      margin-bottom: 1rem;
      font-weight: 500;
    }
    .alert-error {
      background: #fee2e2;
      color: #991b1b;
      padding: 0.75rem 1rem;
      border-radius: 8px;
      margin-bottom: 1rem;
      font-weight: 500;
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

  constructor(
    private readonly tascaService: TascaService,
    private readonly ofertaService: OfertaService,
    private readonly usuariService: UsuariService,
    private readonly avisService: AvisService
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
}
