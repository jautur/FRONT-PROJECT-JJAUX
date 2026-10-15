import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { OfertaService, CreateOfertaDto } from '../../../services/oferta.service';
import { TascaService } from '../../../services/tasca.service';
import { Tasca } from '../../../models/tasca.model';
import { AuthService } from '../../../core/services/auth.service';

/**
 * Component per presentar una oferta econòmica (/professional/crear-oferta).
 * Permet als professionals enviar pressupostos i propostes de treball
 * per a les tasques que es troben en estat 'Oberta'.
 */
@Component({
  selector: 'app-crear-oferta',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <section class="offer-form-container">
      <header class="form-header">
        <div class="role-badge-tag">PER A PROFESSIONALS I AUTÒNOMS</div>
        <h1>{{ mode === 'oferta' ? 'Publicar Oferta / Servei Professional' : 'Enviar Pressupost a una Incidència' }}</h1>
        <p class="subtitle">
          {{ mode === 'oferta'
              ? 'Anuncia el teu pack de servei o tarifa tancada al mercat. Els clients podran contractar-lo directament per convertir-lo en Tasca.'
              : 'Envia la teva proposta econòmica i pressupost detallat per a una incidència publicada per un client.'
          }}
        </p>
      </header>

      <!-- Selector de modalitat professional -->
      <div class="mode-tabs">
        <button
          type="button"
          class="mode-tab-btn"
          [class.active]="mode === 'oferta'"
          (click)="canviarMode('oferta')"
        >
          <span class="tab-badge">Tarifa Directa (-- preu)</span>
          <strong>Publicar Oferta / Pack de Servei</strong>
        </button>
        <button
          type="button"
          class="mode-tab-btn"
          [class.active]="mode === 'pressupost'"
          (click)="canviarMode('pressupost')"
        >
          <span class="tab-badge">Licitació (++ preu)</span>
          <strong>Enviar Pressupost a Incidència</strong>
        </button>
      </div>

      <div *ngIf="errorMessage" class="alert alert-danger">
        {{ errorMessage }}
      </div>
      <div *ngIf="successMessage" class="alert alert-success">
        {{ successMessage }}
      </div>

      <!-- FORMULARI 1: PUBLICAR OFERTA / PACK DE SERVEI PROFESSIONAL -->
      <form *ngIf="mode === 'oferta'" (ngSubmit)="onSubmitOfertaServei()" class="card">
        <div class="mode-info-box">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
          <p>
            Aquesta oferta apareixerà destacada a la borsa d'ofertes públiques. Quan un client hi cliqui
            <strong>«Contractar / M'interessa»</strong>, es generarà automàticament una nova <strong>TASCA en curs</strong> assignada a tu.
          </p>
        </div>

        <label>
          Títol del servei o pack que ofereixes
          <input
            type="text"
            [(ngModel)]="ofertaServei.titol"
            name="titolServei"
            required
            placeholder="Ex: Revisió oficial de caldera i neteja de filtres (o Pintura de pis blanc llis 3 hab)" />
        </label>

        <label>
          Gremi o Especialitat del servei
          <select [(ngModel)]="ofertaServei.categoria" name="categoriaServei" required>
            <option value="" disabled>Selecciona el gremi professional</option>
            <option value="Reformes i Obres">Reformes i Obres (Paleteria, banys, cuines)</option>
            <option value="Lampisteria">Lampisteria i Fontaneria (Fuites, calderes, gas)</option>
            <option value="Electricitat">Electricitat i Il·luminació (Quadres, butlletins oficials)</option>
            <option value="Climatització">Climatització i Calefacció (Aire condicionat, aerotèrmia)</option>
            <option value="Pintura">Pintura i Decoració (Alisat de parets, pintura plàstica)</option>
            <option value="Fusteria">Fusteria i Parquet (Portes, armaris, sòls laminats)</option>
            <option value="Neteja">Neteja i Manteniment (Final d'obra, desinfecció)</option>
            <option value="Serralleria">Serralleria (Panys antibumping, obertura portes)</option>
            <option value="Arquitectura">Arquitectura & Llicències (Cèdules, certificats, ITE)</option>
            <option value="Informàtica">Informàtica, Web & Suport IT</option>
            <option value="Altres">Altres serveis professionals</option>
          </select>
        </label>

        <label>
          Tarifa / Preu tancat del servei (€)
          <input
            type="text"
            [(ngModel)]="ofertaServei.price"
            name="priceServei"
            required
            placeholder="Ex: €75 o €550" />
        </label>

        <label>
          Què inclou el teu pack de servei?
          <textarea
            [(ngModel)]="ofertaServei.note"
            name="noteServei"
            rows="5"
            required
            placeholder="Descriu amb detall el contingut del servei: desplaçament inclòs, revisió de seguretat, peces, garantia per escrit, etc..."></textarea>
        </label>

        <div class="form-actions">
          <button type="submit" class="btn btn-primary" [disabled]="submitting">
            {{ submitting ? 'Publicant oferta...' : 'Publicar Oferta / Servei al Mercat' }}
          </button>
          <a routerLink="/" class="btn btn-cancel">Cancel·lar</a>
        </div>
      </form>

      <!-- FORMULARI 2: ENVIAR PRESSUPOST A UNA INCIDÈNCIA OBERTA -->
      <form *ngIf="mode === 'pressupost'" (ngSubmit)="onSubmitPressupost()" class="card">
        <label>
          Incidència a la qual presentes candidatura
          <select [(ngModel)]="formData.tascaId" name="tascaId" required>
            <option value="" disabled>Selecciona una incidència oberta</option>
            <option *ngFor="let task of availableTasks" [value]="task.id">
              [{{ task.id }}] {{ task.titol }} — Pressupost orientatiu del client: {{ task.budget }}
            </option>
          </select>
        </label>

        <label>
          El teu pressupost proposat (€)
          <input
            type="text"
            [(ngModel)]="formData.price"
            name="price"
            required
            placeholder="Ex: €340" />
        </label>

        <label>
          Descripció de la teva proposta i terminis
          <textarea
            [(ngModel)]="formData.note"
            name="note"
            rows="5"
            required
            placeholder="Explica què inclou el teu pressupost, la teva experiència i el termini estimat d'execució..."></textarea>
        </label>

        <div class="form-actions">
          <button type="submit" class="btn btn-primary" [disabled]="submitting || availableTasks.length === 0">
            {{ submitting ? 'Enviant pressupost...' : 'Enviar Pressupost al Client' }}
          </button>
          <a routerLink="/" class="btn btn-cancel">Cancel·lar</a>
        </div>
      </form>
    </section>
  `,
  styles: [
    `
      .offer-form-container {
        width: min(700px, 100%);
        margin: 0 auto;
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .role-badge-tag {
        display: inline-block;
        font-size: 0.72rem;
        font-weight: 900;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        color: #ff1744;
        background: rgba(255, 23, 68, 0.08);
        border: 1px solid rgba(255, 23, 68, 0.25);
        padding: 0.3rem 0.75rem;
        border-radius: 6px;
        margin-bottom: 0.6rem;
      }

      .mode-tabs {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 0.75rem;
        background: #ede8df;
        padding: 0.4rem;
        border-radius: 14px;
        border: 1px solid #dcd5c7;
      }

      .mode-tab-btn {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.25rem;
        padding: 0.85rem 1rem;
        border-radius: 10px;
        background: transparent;
        border: none;
        cursor: pointer;
        color: #55524b;
        transition: all 0.2s ease;
        text-align: center;
      }

      .mode-tab-btn.active {
        background: #ffffff;
        color: #09090c;
        box-shadow: 0 4px 14px rgba(0, 0, 0, 0.08);
      }

      .tab-badge {
        font-size: 0.7rem;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        color: #ff1744;
      }

      .mode-info-box {
        display: flex;
        align-items: flex-start;
        gap: 0.75rem;
        background: rgba(255, 23, 68, 0.06);
        border: 1px solid rgba(255, 23, 68, 0.2);
        padding: 0.9rem 1.1rem;
        border-radius: 12px;
        color: #09090c;
        font-size: 0.88rem;
        line-height: 1.45;
      }

      .mode-info-box svg {
        color: #ff1744;
        flex-shrink: 0;
        margin-top: 2px;
      }

      .mode-info-box p {
        margin: 0;
      }

      .form-header h1 {
        margin: 0 0 0.4rem;
        font-size: 2rem;
        font-weight: 900;
        color: #09090c;
        letter-spacing: -0.02em;
      }

      .subtitle {
        margin: 0;
        color: #636058;
        font-size: 0.95rem;
        font-weight: 500;
      }

      .card {
        background: #ffffff;
        padding: 2.2rem;
        border-radius: 18px;
        border: 1px solid #e5e0d7;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
        display: flex;
        flex-direction: column;
        gap: 1.35rem;
      }

      label {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        font-weight: 800;
        font-size: 0.9rem;
        color: #09090c;
      }

      input, select, textarea {
        background: #ffffff;
        border: 1.5px solid #d6d0c4;
        border-radius: 10px;
        padding: 0.85rem 1rem;
        font-size: 0.95rem;
        color: #09090c;
        font-family: inherit;
        font-weight: 600;
        transition: border-color 0.2s ease, box-shadow 0.2s ease;
      }

      input:focus, select:focus, textarea:focus {
        outline: none;
        border-color: #ff1744;
        box-shadow: 0 0 12px rgba(255, 23, 68, 0.25);
      }

      .form-actions {
        display: flex;
        gap: 1rem;
        align-items: center;
        margin-top: 0.75rem;
      }

      .btn {
        padding: 0.85rem 1.6rem;
        border-radius: 10px;
        font-weight: 900;
        font-size: 0.95rem;
        text-decoration: none;
        cursor: pointer;
        border: none;
        transition: all 0.2s ease;
      }

      .btn-primary {
        background: #ff1744;
        color: #ffffff;
        box-shadow: 0 4px 14px rgba(255, 23, 68, 0.35);
      }

      .btn-primary:hover:not(:disabled) {
        background: #09090c;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
      }

      .btn-cancel {
        background: #f0ece3;
        color: #09090c;
        border: 1px solid #dcd6cb;
      }

      .btn-cancel:hover {
        border-color: #09090c;
        background: #09090c;
        color: #ffffff;
      }

      .btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .alert {
        padding: 0.9rem 1.25rem;
        border-radius: 12px;
        font-weight: 700;
        font-size: 0.95rem;
      }

      .alert-success {
        background: rgba(255, 23, 68, 0.08);
        color: #ff1744;
        border: 1px solid rgba(255, 23, 68, 0.25);
      }

      .alert-danger {
        background: #fef2f2;
        color: #dc2626;
        border: 1px solid #fecaca;
      }

      @media (max-width: 600px) {
        .card {
          padding: 1.25rem 1rem;
          border-radius: 14px;
        }
        .form-header h1 {
          font-size: 1.45rem;
        }
        .mode-tabs {
          grid-template-columns: 1fr;
        }
        .form-actions {
          flex-direction: column-reverse;
          gap: 0.6rem;
        }
        .btn {
          width: 100%;
          text-align: center;
        }
      }
    `
  ]
})
export class CrearOfertaComponent implements OnInit {
  /** Mode actiu: 'oferta' per publicar tarifa/pack, 'pressupost' per licitar a incidència oberta */
  mode: 'oferta' | 'pressupost' = 'oferta';

  /** Llista de tasques obertes disponibles per a ofertar */
  availableTasks: Tasca[] = [];

  /** Model per a la publicació d'oferta pública / pack de servei */
  ofertaServei = {
    titol: '',
    categoria: '',
    price: '',
    note: ''
  };

  /** Model de dades per al pressupost a incidència oberta */
  formData: CreateOfertaDto = {
    tascaId: '',
    professional: '',
    price: '',
    note: '',
    estat: 'Pendent'
  };

  /** Estat de la petició */
  submitting = false;

  /** Missatges informatius */
  successMessage = '';
  errorMessage = '';

  constructor(
    private readonly ofertaService: OfertaService,
    private readonly tascaService: TascaService,
    private readonly authService: AuthService,
    private readonly route: ActivatedRoute,
    private readonly router: Router
  ) {}

  /**
   * Càrrega de tasques obertes i comprovació de paràmetres d'URL.
   */
  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.formData.professional = user.nom;
    }

    // Carreguem les tasques obertes
    this.tascaService.getAvailable().subscribe({
      next: (tasks) => {
        this.availableTasks = tasks;
        // Si s'ha passat una tasca concreta per paràmetre de consulta, activem mode pressupost
        this.route.queryParams.subscribe((params) => {
          if (params['taskId']) {
            this.mode = 'pressupost';
            this.formData.tascaId = params['taskId'];
          } else if (tasks.length > 0) {
            this.formData.tascaId = tasks[0].id;
          }
        });
      },
      error: () => {
        this.errorMessage = 'No s’han pogut carregar les incidències obertes.';
      }
    });
  }

  canviarMode(nouMode: 'oferta' | 'pressupost'): void {
    this.mode = nouMode;
    this.errorMessage = '';
    this.successMessage = '';
  }

  /**
   * Publica un pack de servei / oferta pública amb tarifa tancada.
   */
  onSubmitOfertaServei(): void {
    const user = this.authService.getCurrentUser();
    if (!this.ofertaServei.titol || !this.ofertaServei.categoria || !this.ofertaServei.price || !this.ofertaServei.note) {
      this.errorMessage = 'Cal emplenar tots els camps del pack de servei.';
      return;
    }

    this.submitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    const payload: CreateOfertaDto = {
      tascaId: 'standalone',
      professional: user ? user.nom : 'Professional AVISA',
      categoria: this.ofertaServei.categoria,
      price: this.ofertaServei.price.startsWith('€') ? this.ofertaServei.price : ('€' + this.ofertaServei.price.replace('€', '').trim()),
      note: this.ofertaServei.titol + ' — ' + this.ofertaServei.note,
      estat: 'Pendent'
    };

    this.ofertaService.create(payload).subscribe({
      next: () => {
        this.submitting = false;
        this.successMessage = 'Oferta de servei publicada al mercat amb èxit! Els clients ja poden contractar-la directament.';
        setTimeout(() => {
          this.router.navigate(['/tasques-ofertes'], { queryParams: { tipus: 'ofertes' } });
        }, 1200);
      },
      error: () => {
        this.submitting = false;
        this.errorMessage = 'S’ha produït un error en publicar l’oferta de servei.';
      }
    });
  }

  /**
   * Envia un pressupost a una incidència oberta d'un client.
   */
  onSubmitPressupost(): void {
    if (!this.formData.tascaId || !this.formData.price || !this.formData.note) {
      this.errorMessage = 'Cal emplenar tots els camps obligatoris del pressupost.';
      return;
    }

    this.submitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.ofertaService.create(this.formData).subscribe({
      next: () => {
        this.submitting = false;
        this.successMessage = 'Pressupost enviat al client correctament! Quan el client l\'accepti, passarà a ser una Tasca en curs.';
        setTimeout(() => {
          this.router.navigate(['/tasques-ofertes'], { queryParams: { tipus: 'ofertes' } });
        }, 1200);
      },
      error: () => {
        this.submitting = false;
        this.errorMessage = 'S’ha produït un error en registrar el pressupost al servidor.';
      }
    });
  }
}

