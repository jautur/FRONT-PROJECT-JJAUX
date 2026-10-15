import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TascaService, CreateTascaDto } from '../../../services/tasca.service';
import { IncidenciaService } from '../../../services/incidencia.service';
import { CrearIncidenciaDTO } from '../../../models/incidencia.model';
import { AuthService } from '../../../core/services/auth.service';

/**
 * Component per a la creació i publicació de noves tasques (/client/crear-tasca).
 * Permet als usuaris amb rol de Client detallar una necessitat, seleccionar una categoria
 * i establir un pressupost orientatiu per rebre ofertes de professionals.
 */
@Component({
  selector: 'app-crear-tasca',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <section class="task-form-container">
      <header class="form-header">
        <div class="role-badge-tag">PER A CLIENTS I PARTICULARS · NOVA INCIDÈNCIA</div>
        <h1>Crear Incidència / Petició de Treball</h1>
        <p class="subtitle">
          Descriu la teva avaria, reforma o necessitat a la llar. Els professionals verificats de la comarca
          rebran la notificació immediata i et proposaran pressupostos a mida.
        </p>
      </header>

      <!-- Banner de flux de treball explicatiu -->
      <div class="workflow-info-strip">
        <div class="wf-step">
          <span class="step-num">1</span>
          <span>Creació d'Incidència</span>
        </div>
        <span class="wf-arrow">→</span>
        <div class="wf-step">
          <span class="step-num">2</span>
          <span>Pressupostos dels Professionals</span>
        </div>
        <span class="wf-arrow">→</span>
        <div class="wf-step highlight">
          <span class="step-num">3</span>
          <span>Conversió a TASCA en curs (++)</span>
        </div>
      </div>

      <div *ngIf="errorMessage" class="alert alert-danger">
        {{ errorMessage }}
      </div>
      <div *ngIf="successMessage" class="alert alert-success">
        {{ successMessage }}
      </div>

      <form (ngSubmit)="onSubmit()" class="card">
        <label>
          Títol de la incidència o necessitat
          <input
            type="text"
            [(ngModel)]="formData.titol"
            name="titol"
            required
            placeholder="Ex: Reparació urgent de fuita d'aigua sota l'aigüera o canvi de banyera" />
        </label>

        <label>
          Gremi o Especialitat requerida
          <select [(ngModel)]="formData.categoria" name="categoria" required>
            <option value="" disabled>Selecciona el gremi professional</option>
            <option value="Reformes i Obres">Reformes i Obres (Paleteria, banys, cuines)</option>
            <option value="Lampisteria">Lampisteria i Fontaneria (Fuites, calderes, desbussos)</option>
            <option value="Electricitat">Electricitat i Il·luminació (Quadres, butlletins oficials, LED)</option>
            <option value="Climatització">Climatització i Calefacció (Aire condicionat, aerotèrmia)</option>
            <option value="Pintura">Pintura i Decoració (Alisat de parets, pintura plàstica)</option>
            <option value="Fusteria">Fusteria i Parquet (Portes de pas, armaris, terres)</option>
            <option value="Neteja">Neteja i Manteniment (Final d'obra, desinfecció)</option>
            <option value="Serralleria">Serralleria (Panys de seguretat, obertures 24h)</option>
            <option value="Arquitectura">Arquitectura & Llicències (Cèdules, certificats, ITE)</option>
            <option value="Informàtica">Informàtica, Web & Suport IT</option>
            <option value="Altres">Altres serveis professionals</option>
          </select>
        </label>

        <label>
          Descripció detallada de l'avaria o feina
          <textarea
            [(ngModel)]="formData.descripcio"
            name="descripcio"
            rows="6"
            required
            placeholder="Detalla què ha passat, quins materials calen, terminis d'execució o la teva disponibilitat..."></textarea>
        </label>

        <label>
          Pressupost màxim orientatiu (€)
          <input
            type="text"
            [(ngModel)]="formData.budget"
            name="budget"
            required
            placeholder="Ex: €350" />
        </label>

        <div class="form-actions">
          <button type="submit" class="btn btn-primary" [disabled]="submitting">
            {{ submitting ? 'Publicant incidència...' : 'Publicar Incidència' }}
          </button>
          <a routerLink="/" class="btn btn-cancel">Cancel·lar</a>
        </div>
      </form>
    </section>
  `,
  styles: [
    `
      .task-form-container {
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

      .workflow-info-strip {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        background: #ffffff;
        border: 1px solid #e5e0d7;
        border-radius: 12px;
        padding: 0.75rem 1.25rem;
        font-size: 0.82rem;
        font-weight: 700;
        color: #636058;
        overflow-x: auto;
      }

      .wf-step {
        display: flex;
        align-items: center;
        gap: 0.4rem;
        white-space: nowrap;
      }

      .wf-step.highlight {
        color: #ff1744;
      }

      .step-num {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: #09090c;
        color: #ffffff;
        font-size: 0.72rem;
        font-weight: 900;
      }

      .wf-step.highlight .step-num {
        background: #ff1744;
      }

      .wf-arrow {
        color: #b0aba0;
        font-weight: 900;
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
        background: #09090c;
        color: #ffffff;
        border-color: #09090c;
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
export class CrearTascaComponent implements OnInit {
  /** Model del formulari */
  formData: CreateTascaDto = {
    titol: '',
    descripcio: '',
    categoria: '',
    client: '',
    budget: '',
    estat: 'Oberta'
  };

  /** Estat del procés d'enviament */
  submitting = false;

  /** Missatges d'èxit o error */
  successMessage = '';
  errorMessage = '';

  constructor(
    private readonly incidenciaService: IncidenciaService,
    private readonly tascaService: TascaService,
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  /**
   * Inicialització: assigna automàticament el client a partir de l'usuari connectat.
   */
  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.formData.client = user.nom;
    }
  }

  /**
   * Envia el formulari al servei per crear la incidència a PostgreSQL.
   */
  onSubmit(): void {
    if (!this.formData.titol || !this.formData.descripcio || !this.formData.categoria || !this.formData.budget) {
      this.errorMessage = 'Cal emplenar tots els camps obligatoris.';
      return;
    }

    this.submitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    const user = this.authService.getCurrentUser();
    const payload: CrearIncidenciaDTO = {
      titol: this.formData.titol,
      descripcio: this.formData.descripcio,
      categoria: this.formData.categoria,
      client: user?.nom || this.formData.client || 'Client AVISA',
      clientId: user?.id,
      budget: this.formData.budget,
      estat: 'Oberta'
    };

    this.incidenciaService.create(payload).subscribe({
      next: (created) => {
        this.submitting = false;
        this.successMessage = 'Incidència publicada amb èxit! Els professionals de la teva zona ja poden enviar-te pressupostos. Redirigint...';
        setTimeout(() => {
          this.router.navigate(['/tasques-ofertes'], { queryParams: { tipus: 'incidencies' } });
        }, 1200);
      },
      error: () => {
        this.submitting = false;
        this.errorMessage = 'S’ha produït un error en desar la incidència a la base de dades.';
      }
    });
  }
}

