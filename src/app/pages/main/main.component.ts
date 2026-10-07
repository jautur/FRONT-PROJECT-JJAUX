import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DashboardResponse, DashboardService } from '../../services/dashboard.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="main-page">
      <header class="hero">
        <div>
          <p class="eyebrow">Plataforma JJAUX</p>
          <h1>Flux principal de tasques i ofertes</h1>
        </div>
        <button type="button" (click)="onNovaTasca()">+ Nova tasca</button>
      </header>

      <div *ngIf="noticeMessage" class="notice-banner">
        <span>{{ noticeMessage }}</span>
        <button type="button" class="btn-dismiss" (click)="noticeMessage = ''">✕</button>
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
    </section>
  `,
  styles: [
    `
      .main-page {
        width: min(1200px, 100%);
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .hero {
        display: flex;
        align-items: center;
        justify-content: space-between;
        background: linear-gradient(120deg, #111827 0%, #1f2937 100%);
        color: white;
        border-radius: 22px;
        padding: 2rem 2.2rem;
        box-shadow: 0 18px 35px rgba(15, 23, 42, 0.15);
      }

      .eyebrow {
        margin: 0 0 0.5rem;
        text-transform: uppercase;
        letter-spacing: 0.12em;
        font-size: 0.72rem;
        color: #bfdbfe;
      }

      h1 {
        margin: 0;
        font-size: clamp(2rem, 4vw, 3rem);
      }

      .hero button,
      .card button {
        border: none;
        border-radius: 10px;
        padding: 0.8rem 1.1rem;
        font-weight: 700;
        cursor: pointer;
      }

      .hero button {
        background: #38bdf8;
        color: #082f49;
      }

      .stats {
        display: grid;
        grid-template-columns: repeat(3, minmax(150px, 1fr));
        gap: 1rem;
      }

      .stat-card {
        background: rgba(255, 255, 255, 0.8);
        border: 1px solid rgba(148, 163, 184, 0.2);
        border-radius: 16px;
        padding: 1.2rem 1.25rem;
        display: flex;
        flex-direction: column;
        gap: 0.45rem;
      }

      .label {
        color: #4b5563;
        font-size: 0.9rem;
      }

      .stat-card strong {
        font-size: 1.8rem;
        color: #111827;
      }

      .columns {
        display: grid;
        grid-template-columns: 1.2fr 1fr;
        gap: 1.25rem;
      }

      .panel {
        background: rgba(255, 255, 255, 0.9);
        border: 1px solid rgba(148, 163, 184, 0.2);
        border-radius: 18px;
        padding: 1.1rem;
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .panel-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .panel-header h2 {
        margin: 0;
        font-size: 1.2rem;
      }

      .panel-header a {
        text-decoration: none;
        color: #2563eb;
        font-weight: 600;
      }

      .card {
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 14px;
        padding: 1rem;
        display: flex;
        flex-direction: column;
        gap: 0.8rem;
      }

      .card-top,
      .card-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 1rem;
      }

      .tag {
        background: #dbeafe;
        color: #1d4ed8;
        border-radius: 999px;
        padding: 0.35rem 0.7rem;
        font-size: 0.72rem;
        font-weight: 700;
      }

      .tag.alt {
        background: #dcfce7;
        color: #166534;
      }

      .status {
        border-radius: 999px;
        padding: 0.35rem 0.7rem;
        font-size: 0.7rem;
        font-weight: 700;
      }

      .status-task {
        background: #e0f2fe;
        color: #075985;
      }

      .status-task.oberta {
        background: #dbeafe;
        color: #1d4ed8;
      }

      .status-task.en-curs {
        background: #fef3c7;
        color: #92400e;
      }

      .status-task.finalitzada {
        background: #dcfce7;
        color: #166534;
      }

      .status-offer {
        background: #f3f4f6;
        color: #374151;
      }

      .status-offer.pendent {
        background: #fef3c7;
        color: #92400e;
      }

      .status-offer.acceptada {
        background: #dcfce7;
        color: #166534;
      }

      .status-offer.rebutjada {
        background: #fee2e2;
        color: #991b1b;
      }

      h3 {
        margin: 0;
        font-size: 1.1rem;
      }

      p {
        margin: 0;
        color: #4b5563;
      }

      .meta {
        font-size: 0.9rem;
      }

      .card-footer button {
        background: #111827;
        color: white;
      }

      .offer-card button {
        background: #16a34a;
      }

      .notice-banner {
        background: #fee2e2;
        border: 1px solid #f87171;
        color: #991b1b;
        padding: 0.9rem 1.2rem;
        border-radius: 12px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-weight: 500;
        animation: fadeIn 0.2s ease-in-out;
      }

      .btn-dismiss {
        background: transparent !important;
        border: none !important;
        color: #991b1b !important;
        cursor: pointer;
        font-size: 1.1rem;
        padding: 0 !important;
      }

      .actions {
        display: flex;
        gap: 0.5rem;
      }

      .btn-secondary {
        background: #0284c7 !important;
        color: white !important;
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
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
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
    const user = this.authService.getCurrentUser();
    if (user?.rol === 'client' || user?.rol === 'admin') {
      this.router.navigate(['/client/crear-tasca']);
    } else {
      this.noticeMessage = 'Només els comptes amb rol de "Client" poden crear noves tasques.';
    }
  }

  onVeureTotesTasques(): void {
    if (!this.requireLogin('veure el llistat complet de tasques', '/client/tasques')) return;
    const user = this.authService.getCurrentUser();
    if (user?.rol === 'professional') {
      this.router.navigate(['/professional/tasques']);
    } else if (user?.rol === 'admin') {
      this.router.navigate(['/admin/tasques']);
    } else {
      this.router.navigate(['/client/tasques']);
    }
  }

  onDetallTasca(taskId: string): void {
    if (!this.requireLogin(`veure el detall de la tasca ${taskId}`, '/client/tasca-detall')) return;
    const user = this.authService.getCurrentUser();
    if (user?.rol === 'professional') {
      this.router.navigate(['/professional/tasca-detall']);
    } else {
      this.router.navigate(['/client/tasca-detall']);
    }
  }

  onFerOferta(taskId: string): void {
    if (!this.requireLogin(`fer una oferta per a la tasca ${taskId}`, '/professional/crear-oferta')) return;
    const user = this.authService.getCurrentUser();
    if (user?.rol === 'professional' || user?.rol === 'admin') {
      this.router.navigate(['/professional/crear-oferta']);
    } else {
      this.noticeMessage = 'Només els comptes amb rol de "Professional" poden fer ofertes econòmiques.';
    }
  }

  onVeureTotesOfertes(): void {
    if (!this.requireLogin('veure el llistat complet d’ofertes', '/professional/ofertes')) return;
    const user = this.authService.getCurrentUser();
    if (user?.rol === 'client') {
      this.router.navigate(['/client/tasques']);
    } else if (user?.rol === 'admin') {
      this.router.navigate(['/admin/ofertes']);
    } else {
      this.router.navigate(['/professional/ofertes']);
    }
  }

  onAcceptarOferta(offerId: string): void {
    if (!this.requireLogin(`acceptar l'oferta ${offerId}`, '/client/dashboard')) return;
    const user = this.authService.getCurrentUser();
    if (user?.rol === 'client' || user?.rol === 'admin') {
      alert(`Has acceptat l'oferta ${offerId}.`);
    } else {
      this.noticeMessage = 'Només el client que ha publicat la tasca pot acceptar aquesta oferta.';
    }
  }
}

