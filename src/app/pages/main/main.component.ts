import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DashboardResponse, DashboardService } from '../../services/dashboard.service';
import { OfertaService } from '../../services/oferta.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="main-page">
      <!-- PORTADA INICIAL DE PANTALLA COMPLETA AMB IMATGE DE FONS -->
      <header class="fullscreen-cover">
        <!-- NOM DE LA WEB EN MIG DE LA PÀGINA I SLOGAN EN CURSIVA LLIGADA -->
        <div class="hero-center">
          <h1 class="hero-brand">JJAUX</h1>
          <p class="hero-slogan">Connectant necessitats i professionals</p>
        </div>

        <div class="cover-scroll-hint">
          <div class="mouse-icon">
            <div class="mouse-wheel"></div>
          </div>
          <span class="hint-label">Llisca cap avall per a descobrir tasques i serveis</span>
        </div>
      </header>

      <!-- CONTINGUT PRINCIPAL DE LA PLATAFORMA (VISUALITZAT EN FER SCROLL) -->
      <div class="dashboard-body">
        <div class="dashboard-header-bar">
          <div>
            <span class="eyebrow-tag">Plataforma JJAUX</span>
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

        <div class="stats">
          <div class="stat-card">
            <span class="label">Tasques obertes</span>
            <strong>{{ dashboard?.openTasks ?? 0 }}</strong>
          </div>
          <div class="stat-card">
            <span class="label">Ofertes actives</span>
            <strong>{{ dashboard?.activeOffers ?? 0 }}</strong>
          </div>
          <div class="stat-card">
            <span class="label">Projectes finalitzats</span>
            <strong>{{ dashboard?.completedProjects ?? 0 }}</strong>
          </div>
        </div>

        <div class="columns">
          <section class="panel">
            <div class="panel-header">
              <h2>Últimes tasques</h2>
              <a href="javascript:void(0)" (click)="onVeureTotesTasques()">Veure totes</a>
            </div>

            <article class="card" *ngFor="let task of tasks">
              <div class="card-top">
                <span class="tag">{{ task.category }}</span>
                <span class="status status-task" [ngClass]="getTaskStatusClass(task.status)">
                  {{ task.status }}
                </span>
              </div>
              <h3>{{ task.title }}</h3>
              <p class="meta">Client: {{ task.client }}</p>
              <div class="card-footer">
                <span>Pressupost: {{ task.budget }}</span>
                <div class="actions">
                  <button type="button" (click)="onDetallTasca(task.id)">Detall</button>
                  <button type="button" class="btn-secondary" (click)="onFerOferta(task.id)">Fer oferta</button>
                </div>
              </div>
            </article>
          </section>

          <section class="panel">
            <div class="panel-header">
              <h2>Ofertes recents</h2>
              <a href="javascript:void(0)" (click)="onVeureTotesOfertes()">Veure totes</a>
            </div>

            <article class="card offer-card" *ngFor="let offer of offers">
              <div class="card-top">
                <span class="tag alt">{{ offer.task }}</span>
                <span class="status status-offer" [ngClass]="getOfferStatusClass(offer.status)">
                  {{ offer.status }}
                </span>
              </div>
              <h3>{{ offer.professional }}</h3>
              <p>{{ offer.note }}</p>
              <div class="card-footer">
                <span>Oferta: {{ offer.price }}</span>
                <button type="button" (click)="onAcceptarOferta(offer.id)">Acceptar</button>
              </div>
            </article>
          </section>
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
        background-color: #f7f3ed;
        color: #0c0c10;
        min-height: 100vh;
      }

      .fullscreen-cover {
        width: 100%;
        height: 100vh;
        min-height: 580px;
        background-image: linear-gradient(rgba(8, 8, 12, 0.45), rgba(8, 8, 12, 0.72)),
          url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=2000&q=80');
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
        margin-top: -2.5rem;
      }

      .hero-brand {
        margin: 0;
        font-family: var(--font-title, 'Boldonse', 'Climate Crisis', sans-serif);
        font-size: clamp(3.6rem, 9vw, 6.8rem);
        font-weight: 900;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        color: #f7f3ed; /* Color blanc brut */
        text-shadow: 0 4px 30px rgba(0, 0, 0, 0.95), 0 2px 10px rgba(0, 0, 0, 0.7);
        line-height: 1.05;
      }

      .hero-slogan {
        margin: 0.85rem 0 0;
        font-family: 'Dancing Script', cursive;
        font-size: clamp(1.8rem, 4.5vw, 3rem);
        font-weight: 600;
        color: #f7f3ed; /* Color blanc brut */
        text-shadow: 0 3px 20px rgba(0, 0, 0, 0.95);
        line-height: 1.3;
        letter-spacing: 0.02em;
      }

      .cover-scroll-hint {
        position: absolute;
        bottom: 2.8rem;
        left: 50%;
        transform: translateX(-50%);
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.75rem;
        color: #f7f3ed;
        opacity: 0.9;
        animation: bounceSlow 2.2s infinite ease-in-out;
        user-select: none;
        z-index: 2;
      }

      @keyframes bounceSlow {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(10px); }
      }

      .mouse-icon {
        width: 24px;
        height: 40px;
        border: 2px solid #ffffff;
        border-radius: 12px;
        position: relative;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
      }

      .mouse-wheel {
        width: 4px;
        height: 8px;
        background: #ff1744;
        border-radius: 2px;
        position: absolute;
        top: 6px;
        left: 50%;
        transform: translateX(-50%);
        animation: wheelScroll 1.6s infinite ease-out;
        box-shadow: 0 0 8px #ff1744;
      }

      @keyframes wheelScroll {
        0% { transform: translate(-50%, 0); opacity: 1; }
        100% { transform: translate(-50%, 14px); opacity: 0; }
      }

      .hint-label {
        font-size: 0.85rem;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        font-weight: 800;
        color: #f7f3ed;
        text-shadow: 0 2px 8px rgba(0, 0, 0, 0.8);
      }

      .dashboard-body {
        width: min(1200px, 100%);
        margin: 0 auto;
        padding: 3.5rem 1.5rem 6rem 1.5rem;
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

      @media (max-width: 900px) {
        .columns,
        .stats {
          grid-template-columns: 1fr;
        }

        .hero {
          flex-direction: column;
          align-items: flex-start;
          gap: 1rem;
        }
      }
    `
  ]
})
export class MainComponent implements OnInit {
  dashboard?: DashboardResponse;
  loading = true;
  error = '';
  noticeMessage = '';

  constructor(
    private readonly dashboardService: DashboardService,
    private readonly ofertaService: OfertaService,
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.dashboardService.getDashboard().subscribe({
      next: (dashboard) => {
        this.dashboard = dashboard;
        this.loading = false;
      },
      error: () => {
        this.error = 'No s’ha pogut carregar el dashboard del backend.';
        this.loading = false;
      }
    });
  }

  get tasks() {
    return this.dashboard?.tasks.map((task) => ({
      id: task.id,
      title: task.titol,
      client: task.client,
      category: task.categoria,
      budget: task.budget,
      status: task.estat
    })) ?? [];
  }

  get offers() {
    return this.dashboard?.offers.map((offer) => ({
      id: offer.id,
      professional: offer.professional,
      task: this.dashboard?.tasks.find((task) => task.id === offer.tascaId)?.titol ?? offer.tascaId,
      price: offer.price,
      note: offer.note,
      status: offer.estat
    })) ?? [];
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

  onVeureTotesTasques(): void {
    if (!this.requireLogin('veure el llistat complet de tasques', '/')) return;
    this.router.navigate(['/']);
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
    if (!this.requireLogin('veure el llistat complet d’ofertes', '/')) return;
    this.router.navigate(['/']);
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
}

