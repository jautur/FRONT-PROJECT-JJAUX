import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TascaService, CreateTascaDto } from '../../../services/tasca.service';
import { IncidenciaService } from '../../../services/incidencia.service';
import { CrearIncidenciaDTO } from '../../../models/incidencia.model';
import { AuthService } from '../../../core/services/auth.service';

import { TranslatePipe } from '../../../core/pipes/translate.pipe';

/**
 * Component per a la creació i publicació de noves tasques (/client/crear-tasca).
 * Permet als usuaris amb rol de Client detallar una necessitat, seleccionar una categoria
 * i establir un pressupost orientatiu per rebre ofertes de professionals.
 * Disseny net i directe sense barres de desplaçament horitzontals.
 */
@Component({
  selector: 'app-crear-tasca',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TranslatePipe],
  templateUrl: './crear-tasca.component.html',
  styleUrl: './crear-tasca.component.css'
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
    private readonly route: ActivatedRoute,
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

  goBack(): void {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      window.history.back();
    } else {
      this.router.navigate([this.getNavUrl('/tasques-ofertes')]);
    }
  }

  /**
   * Inicialització: assigna les dades de l'usuari client connectat.
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
      this.errorMessage = 'ERRORS.REQUIRED_FIELDS';
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
          this.router.navigate([this.getNavUrl('/tasques-ofertes')], { queryParams: { tipus: 'incidencies' } });
        }, 1200);
      },
      error: () => {
        this.submitting = false;
        this.errorMessage = 'ERRORS.TASK_SAVE_ERROR';
      }
    });
  }
}

