import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { OfertaService, CreateOfertaDto } from '../../../services/oferta.service';
import { PressupostService } from '../../../services/pressupost.service';
import { CrearPressupostRequest } from '../../../models/pressupost.model';
import { TascaService } from '../../../services/tasca.service';
import { IncidenciaService } from '../../../services/incidencia.service';
import { Tasca } from '../../../models/tasca.model';
import { AuthService } from '../../../core/services/auth.service';

import { TranslatePipe } from '../../../core/pipes/translate.pipe';

/**
 * Component per publicar ofertes i presentar pressupostos (/professional/crear-oferta).
 * Ofereix dues modalitats clau per a professionals i autònoms:
 * 1. 'Publicar Oferta / Pack de Servei': Anunciar al mercat un paquet tancat amb tarifa directa (ex: revisió caldera, pintura).
 *    Quan un client hi clica «Contractar», es converteix directament en una Tasca en curs assignada al professional.
 * 2. 'Enviar Pressupost a Incidència': Licitar a una petició o incidència oberta d'un client concret amb preu i condicions.
 */
@Component({
  selector: 'app-crear-oferta',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TranslatePipe],
  templateUrl: './crear-oferta.component.html',
  styleUrl: './crear-oferta.component.css'
})
export class CrearOfertaComponent implements OnInit {
  /** Mode actiu: 'oferta' per publicar tarifa/pack, 'pressupost' per licitar a incidència oberta */
  mode: 'oferta' | 'pressupost' = 'oferta';

  /** Llista de tasques obertes disponibles per a ofertar */
  availableTasks: Tasca[] = [];

  /** Obté l'objecte complet de la incidència o tasca actualment seleccionada al desplegable */
  get selectedTask(): Tasca | undefined {
    if (!this.formData.tascaId) return undefined;
    return this.availableTasks.find(t => t.id === this.formData.tascaId);
  }

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
    private readonly pressupostService: PressupostService,
    private readonly tascaService: TascaService,
    private readonly incidenciaService: IncidenciaService,
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
   * Càrrega d'incidències i tasques obertes per a l'usuari professional.
   */
  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.formData.professional = user.nom;
    }

    // Carreguem tant incidències obertes com tasques obertes
    const incidencies$ = this.incidenciaService.getAll().pipe(catchError(() => of([])));
    const tasques$ = this.tascaService.getAvailable().pipe(catchError(() => of([])));

    forkJoin([incidencies$, tasques$]).subscribe({
      next: ([incidencies, tasks]) => {
        const mappedIncidencies: Tasca[] = (incidencies || [])
          .filter(inc => !inc.estat || inc.estat === 'Oberta')
          .map(inc => ({
            id: inc.id,
            titol: inc.titol,
            descripcio: inc.descripcio || '',
            categoria: inc.categoria || 'Altres Serveis',
            client: inc.clientNom || (inc as any).client || '',
            clientId: inc.clientId,
            budget: inc.budget,
            estat: inc.estat || 'Oberta',
            tipus: 'incidencia'
          }));

        const existingIds = new Set(mappedIncidencies.map(i => i.id));
        const extraTasks = (tasks || []).filter(t => !existingIds.has(t.id));
        this.availableTasks = [...mappedIncidencies, ...extraTasks];

        this.route.queryParams.subscribe((params) => {
          const requestedId = params['taskId'] || params['tascaId'];
          if (requestedId) {
            this.mode = 'pressupost';
            this.formData.tascaId = requestedId;
            // Si la incidència o tasca no està a la llista, la recuperem pel seu id provant primer Tasca i després Incidència
            if (!this.availableTasks.some(t => t.id === requestedId)) {
              this.tascaService.getById(requestedId).subscribe({
                next: (t) => {
                  if (t && !this.availableTasks.some(x => x.id === t.id)) {
                    this.availableTasks.unshift(t);
                  }
                  this.formData.tascaId = requestedId;
                },
                error: () => {
                  // Fallback a consultar com a incidència directa
                  this.incidenciaService.getById(requestedId).subscribe({
                    next: (inc) => {
                      if (inc && !this.availableTasks.some(x => x.id === inc.id)) {
                        this.availableTasks.unshift({
                          id: inc.id,
                          titol: inc.titol,
                          descripcio: inc.descripcio || '',
                          categoria: inc.categoria || 'Altres Serveis',
                          client: inc.clientNom || (inc as any).client || '',
                          clientId: inc.clientId,
                          budget: inc.budget,
                          estat: inc.estat || 'Oberta',
                          tipus: 'incidencia'
                        });
                      }
                      this.formData.tascaId = requestedId;
                    },
                    error: () => {
                      // Si no es troba per cap de les dues vies, afegim un element temporal perquè el desplegable no quede buit
                      this.availableTasks.unshift({
                        id: requestedId,
                        titol: 'Incidència ' + requestedId,
                        descripcio: '',
                        categoria: 'Altres Serveis',
                        client: '',
                        budget: 'A convenir',
                        estat: 'Oberta',
                        tipus: 'incidencia'
                      });
                      this.formData.tascaId = requestedId;
                    }
                  });
                }
              });
            }
          } else if (this.availableTasks.length > 0 && !this.formData.tascaId) {
            this.formData.tascaId = this.availableTasks[0].id;
          }
        });
      },
      error: () => {
        this.errorMessage = 'ERRORS.INCIDENTS_LOAD_ERROR';
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
      this.errorMessage = 'ERRORS.PACK_FIELDS_REQUIRED';
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
          this.router.navigate([this.getNavUrl('/tasques-ofertes')], { queryParams: { tipus: 'ofertes' } });
        }, 1200);
      },
      error: () => {
        this.submitting = false;
        this.errorMessage = 'ERRORS.OFFER_PUBLISH_ERROR';
      }
    });
  }

  /**
   * Envia un pressupost a una incidència oberta d'un client.
   */
  onSubmitPressupost(): void {
    if (!this.formData.tascaId || !this.formData.price || !this.formData.note) {
      this.errorMessage = 'ERRORS.BUDGET_FIELDS_REQUIRED';
      return;
    }

    this.submitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    const user = this.authService.getCurrentUser();
    const payload: CrearPressupostRequest = {
      incidenciaId: this.formData.tascaId,
      professionalId: user ? user.id : undefined,
      professionalNom: user ? user.nom : (this.formData.professional || 'Professional AVISA'),
      preu: this.formData.price.startsWith('€') ? this.formData.price : ('€' + this.formData.price.replace('€', '').trim()),
      descripcio: this.formData.note
    };

    this.pressupostService.create(payload).subscribe({
      next: () => {
        this.submitting = false;
        this.successMessage = 'Pressupost enviat al client correctament! És estrictament privat i no es publicarà com a oferta. Quan el client l\'accepti, es convertirà en una Tasca en curs.';
        setTimeout(() => {
          this.router.navigate([this.getNavUrl('/tasques-ofertes')], { queryParams: { tipus: 'incidencies' } });
        }, 1200);
      },
      error: () => {
        this.submitting = false;
        this.errorMessage = 'ERRORS.BUDGET_REGISTER_ERROR';
      }
    });
  }
}

