import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { TascaService } from '../../../services/tasca.service';
import { IncidenciaService } from '../../../services/incidencia.service';
import { InteresService } from '../../../services/interes.service';
import { PressupostService } from '../../../services/pressupost.service';
import { ResenyaService } from '../../../services/resenya.service';
import { AuthService } from '../../../core/services/auth.service';
import { ConfirmService } from '../../../core/services/confirm.service';
import { Tasca } from '../../../models/tasca.model';
import { Interes } from '../../../models/interes.model';
import { ContacteTascaComponent } from '../../../shared/components/contacte-tasca/contacte-tasca.component';
import { CancellarTascaModalComponent } from '../../../shared/components/cancellar-tasca/cancellar-tasca-modal.component';

/**
 * Tipus per al filtre d'estat de les tasques del client.
 */
type FiltreEstatTasca = 'totes' | 'sollicitada' | 'oberta' | 'en_curs' | 'finalitzada' | 'cancellada';

/**
 * Component del Panell de Gestió de Tasques del Client (/client/les-meves-tasques).
 * Permet a un client:
 * - Visualitzar totes les tasques que ha publicat a la plataforma.
 * - Filtrar segons l'estat (obertes, en curs, finalitzades).
 * - Consultar quantes ofertes de professionals ha rebut cada tasca.
 * - Accedir a la revisió d'ofertes o donar per finalitzat el servei amb valoració.
 * - Eliminar tasques publicades.
 */
import { TranslatePipe } from '../../../core/pipes/translate.pipe';

@Component({
  selector: 'app-les-meves-tasques',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TranslatePipe, ContacteTascaComponent, CancellarTascaModalComponent],
  templateUrl: './les-meves-tasques.component.html',
  styleUrl: './les-meves-tasques.component.css'
})
export class LesMevesTasquesComponent implements OnInit {
  /** Llista de tasques publicades per l'usuari */
  tasques: Tasca[] = [];
  /** Filtre actiu de l'estat */
  filtreActiu: FiltreEstatTasca = 'totes';
  /** Mapa de recompte d'ofertes rebudes per cada tasca [tascaId -> número d'ofertes] */
  ofertesCount: Record<string, number> = {};
  /** Indicador de procés en curs */
  loading = true;
  /** Missatge d'error */
  errorMsg = '';
  /** Missatge d'èxit */
  successMsg = '';
  /** Estat del modal de finalització i avaluació */
  modalFinalitzarObert = false;
  tascaPerFinalitzar: Tasca | null = null;
  professionalPerFinalitzar = '';
  puntuacioSeleccionada = 5;
  ressenyaDescripcio = '';
  enviantRessenya = false;
  /** Tasca per a la qual s'està sol·licitant la cancel·lació */
  tascaPerCancellar: Tasca | null = null;

  constructor(
    private readonly incidenciaService: IncidenciaService,
    private readonly tascaService: TascaService,
    private readonly interesService: InteresService,
    private readonly pressupostService: PressupostService,
    private readonly resenyaService: ResenyaService,
    private readonly authService: AuthService,
    private readonly confirmService: ConfirmService,
    private readonly router: Router
  ) {}

  get isAppPage(): boolean {
    const url = this.router.url || '';
    return url.startsWith('/app');
  }

  goBack(): void {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      window.history.back();
    } else {
      this.router.navigate([this.getNavUrl('/inici')]);
    }
  }

  getNavUrl(path: string): string {
    if (this.isAppPage) {
      if (path === '/' || path === '/inici' || path === '/app') return '/app';
      if (path.startsWith('/app/')) return path;
      return path.startsWith('/') ? `/app${path}` : `/app/${path}`;
    }
    return path;
  }

  /**
   * Cicle de vida inicial del component: carrega les tasques del client connectat.
   */
  ngOnInit(): void {
    this.carregarTasques();
  }

  /** Una incidència pròpia, encara sense professional assignat */
  esIncidencia(t: Tasca): boolean {
    return t.tipus === 'incidencia';
  }

  /** Una sol·licitud d'oferta pendent que el professional encara ha d'acceptar */
  esSollicitud(t: Tasca): boolean {
    return t.tipus === 'sollicitud';
  }

  /** Treball acordat entre client i professional */
  isTascaConvergida(t: Tasca): boolean {
    return t.tipus === 'tasca';
  }

  /** El contacte només és visible quan el professional ja ha acceptat el treball */
  teContacte(t: Tasca): boolean {
    return !!t.professionalId && ['En curs', 'En revisió', 'Finalitzada'].includes(t.estat || '');
  }

  /**
   * Retorna les tasques o incidències filtrades segons la pestanya seleccionada.
   */
  get tasquesFiltrades(): Tasca[] {
    switch (this.filtreActiu) {
      case 'sollicitada': return this.tasques.filter(t => this.esSollicitud(t));
      case 'oberta': return this.tasques.filter(t => this.esIncidencia(t) && t.estat === 'Oberta');
      case 'en_curs': return this.tasques.filter(t => t.estat === 'En curs' || t.estat === 'En revisió');
      case 'finalitzada': return this.tasques.filter(t => t.estat === 'Finalitzada');
      case 'cancellada': return this.tasques.filter(t => t.estat === 'Cancel·lada');
      default: return this.tasques;
    }
  }

  countSollicituds(): number {
    return this.tasques.filter(t => this.esSollicitud(t)).length;
  }

  countIncidencies(): number {
    return this.tasques.filter(t => this.esIncidencia(t) && t.estat === 'Oberta').length;
  }

  countEnCurs(): number {
    return this.tasques.filter(t => t.estat === 'En curs' || t.estat === 'En revisió').length;
  }

  countFinalitzades(): number {
    return this.tasques.filter(t => t.estat === 'Finalitzada').length;
  }

  countCancellades(): number {
    return this.tasques.filter(t => t.estat === 'Cancel·lada').length;
  }

  /**
   * Calcula el nombre de tasques d'un determinat estat.
   * @param estatFragment Text parcial de l'estat a comparar
   * @returns Nombre de tasques que compleixen el criteri
   */
  countByEstat(estatFragment: string): number {
    return this.tasques.filter(t => t.estat?.toLowerCase().includes(estatFragment.toLowerCase())).length;
  }

  /**
   * Carrega les tasques, les incidències i les sol·licituds pendents del client actual.
   * Es consulta per identificador: dos usuaris poden compartir nom.
   */
  carregarTasques(): void {
    this.loading = true;
    this.errorMsg = '';
    const user = this.authService.getCurrentUser();

    if (!user) {
      this.router.navigate([this.getNavUrl('/login')]);
      return;
    }

    forkJoin({
      tasques: this.tascaService.getByClient(user.id).pipe(catchError(() => of([] as Tasca[]))),
      incidencies: this.incidenciaService.getByClient(user.id).pipe(catchError(() => of([]))),
      interessos: this.interesService.getByClient(user.id).pipe(catchError(() => of([] as Interes[])))
    }).subscribe({
      next: ({ tasques, incidencies, interessos }) => {
        // Només incidències obertes: si ja han passat a ser tasca, es retiren
        const tasquesPublicacioIds = new Set(tasques.map(t => (t as any).publicacioId || t.id));
        const incidenciesMapped: Tasca[] = incidencies
          .filter((inc) => (!inc.estat || inc.estat.toLowerCase() === 'oberta') && !tasquesPublicacioIds.has(inc.id))
          .map((inc) => ({
            id: inc.id,
            titol: inc.titol,
            descripcio: inc.descripcio,
            categoria: inc.categoria,
            clientId: inc.clientId,
            client: inc.clientNom || inc.client || user.nom,
            clientNom: inc.clientNom || inc.client || user.nom,
            professional: undefined,
            professionalNom: undefined,
            budget: inc.budget,
            estat: inc.estat || '',
            tipus: 'incidencia',
            createdAt: inc.createdAt
          }));

        // Només les sol·licituds que el professional encara no ha acceptat: les acceptades ja són tasques
        const sollicituds: Tasca[] = interessos
          .filter((i) => !i.tascaId)
          .map((i) => ({
            id: i.id,
            titol: i.publicacioTitol || '',
            descripcio: '',
            clientId: i.clientId,
            client: i.clientNom,
            clientNom: i.clientNom,
            professionalId: i.professionalId,
            professional: i.professionalNom,
            professionalNom: i.professionalNom,
            publicacioId: i.publicacioId,
            estat: 'Sol·licitada',
            tipus: 'sollicitud',
            createdAt: i.dataCreacio
          }));

        this.tasques = [...sollicituds, ...tasques, ...incidenciesMapped];
        this.loading = false;
        this.carregarRecompteOfertes();
      },
      error: () => {
        this.errorMsg = 'Error en carregar les teves tasques i incidències.';
        this.loading = false;
      }
    });
  }

  /**
   * Consulta el nombre de pressupostos vigents de cada incidència oberta.
   */
  private carregarRecompteOfertes(): void {
    this.tasques.filter(t => this.esIncidencia(t)).forEach(t => {
      this.pressupostService.getByIncidencia(t.id).subscribe({
        next: (pressupostos) => {
          this.ofertesCount[t.id] = pressupostos.length;
        },
        error: () => {
          this.ofertesCount[t.id] = 0;
        }
      });
    });
  }

  /**
   * Modifica el filtre d'estat actiu.
   * @param nouFiltre Filtre a aplicar
   */
  canviarFiltre(nouFiltre: FiltreEstatTasca): void {
    this.filtreActiu = nouFiltre;
  }

  /**
   * Retorna la classe CSS adequada segons l'estat de la tasca.
   * @param estat Estat actual de la tasca
   * @returns Nom de la classe CSS
   */
  getEstatClass(estat: string): string {
    switch (estat) {
      case 'Sol·licitada': return 'estat-sollicitada';
      case 'Oberta': return 'estat-oberta';
      case 'En curs': return 'estat-en-curs';
      case 'En revisió': return 'estat-revisio';
      case 'Finalitzada': return 'estat-finalitzada';
      case 'Cancel·lada': case 'Tancada': return 'estat-cancellada';
      default: return '';
    }
  }

  /**
   * Obre el modal per avaluar el professional i finalitzar la tasca.
   */
  obrirModalFinalitzar(t: Tasca): void {
    this.tascaPerFinalitzar = t;
    this.puntuacioSeleccionada = t.valoracio || 5;
    this.ressenyaDescripcio = t.comentari || '';
    this.professionalPerFinalitzar = t.professionalNom || t.professional || '';
    this.modalFinalitzarObert = true;
  }

  tancarModalFinalitzar(): void {
    this.modalFinalitzarObert = false;
    this.tascaPerFinalitzar = null;
    this.professionalPerFinalitzar = '';
    this.enviantRessenya = false;
  }

  getRatingLabel(p: number): string {
    switch (p) {
      case 1: return '1.0 — Molt deficient';
      case 2: return '2.0 — Regular';
      case 3: return '3.0 — Correcte';
      case 4: return '4.0 — Molt bo';
      case 5: return '5.0 — Excel·lent!';
      default: return `${p}.0`;
    }
  }

  /**
   * Desa la valoració del client. Si la tasca encara és en curs, la finalitza i la valora d'una vegada.
   */
  confirmarFinalitzacioAmbRessenya(): void {
    if (!this.tascaPerFinalitzar) return;
    const t = this.tascaPerFinalitzar;
    this.enviantRessenya = true;
    const textDesc = this.ressenyaDescripcio.trim() || 'Feina completada amb èxit i total satisfacció.';
    const dades = { valoracio: this.puntuacioSeleccionada, comentari: textDesc };
    const peticio$ = t.estat === 'En curs' ? this.tascaService.complete(t.id, dades) : this.tascaService.avaluar(t.id, dades);

    peticio$.subscribe({
      next: () => {
        this.enviantRessenya = false;
        this.tancarModalFinalitzar();
        this.successMsg = 'Valoració enregistrada amb èxit!';
        this.carregarTasques();
        setTimeout(() => this.successMsg = '', 4000);
      },
      error: (e) => {
        this.enviantRessenya = false;
        this.errorMsg = e?.error?.error || 'Error en desar la valoració.';
      }
    });
  }

  /**
   * Finalitza la tasca sense emetre cap valoració.
   */
  finalitzarSenseRessenya(): void {
    if (!this.tascaPerFinalitzar) return;
    const id = this.tascaPerFinalitzar.id;
    this.enviantRessenya = true;

    this.tascaService.complete(id).subscribe({
      next: () => {
        this.enviantRessenya = false;
        this.tancarModalFinalitzar();
        this.successMsg = 'Tasca finalitzada correctament!';
        this.carregarTasques();
        setTimeout(() => this.successMsg = '', 3000);
      },
      error: (e) => {
        this.enviantRessenya = false;
        this.errorMsg = e?.error?.error || 'Error en finalitzar la tasca.';
      }
    });
  }

  alCancellacioSollicitada(tasca: Tasca): void {
    this.tascaPerCancellar = null;
    this.successMsg = 'TREBALL.CANCEL_SENT_OK';
    this.carregarTasques();
    setTimeout(() => this.successMsg = '', 4000);
  }

  /** Tanca la incidència: els pressupostos pendents es rebutgen i els professionals reben un avís */
  async tancarIncidencia(t: Tasca): Promise<void> {
    const confirmacio = await this.confirmService.confirm({
      title: 'TREBALL.CLOSE_INCIDENT_TITLE',
      message: 'TREBALL.CLOSE_INCIDENT_MSG',
      confirmText: 'TREBALL.CLOSE_INCIDENT_BTN',
      cancelText: 'COMMON.CANCEL_LAR',
      isDanger: true,
      icon: 'warning'
    });
    if (!confirmacio) return;
    this.incidenciaService.close(t.id).subscribe({
      next: () => {
        this.successMsg = 'TREBALL.CLOSE_INCIDENT_OK';
        this.carregarTasques();
        setTimeout(() => this.successMsg = '', 4000);
      },
      error: (e) => (this.errorMsg = e?.error?.error || 'Error en tancar la incidència.')
    });
  }

  /** El client retira la seua sol·licitud sense passar per l'administrador */
  async retirarSollicitud(t: Tasca): Promise<void> {
    const confirmacio = await this.confirmService.confirm({
      title: 'TREBALL.SOL_WITHDRAW_TITLE',
      message: 'TREBALL.SOL_WITHDRAW_MSG',
      confirmText: 'TREBALL.SOL_WITHDRAW',
      cancelText: 'COMMON.CANCEL_LAR',
      isDanger: true,
      icon: 'warning'
    });
    if (!confirmacio) return;
    this.interesService.withdraw(t.id).subscribe({
      next: () => {
        this.successMsg = 'TREBALL.SOL_WITHDRAW_OK';
        this.carregarTasques();
        setTimeout(() => this.successMsg = '', 4000);
      },
      error: (e) => (this.errorMsg = e?.error?.error || 'Error en retirar la sol·licitud.')
    });
  }

  /** Només s'esborra una incidència; si ja té pressupostos, el back ho rebutja amb un missatge */
  async eliminarIncidencia(t: Tasca): Promise<void> {
    const confirmacio = await this.confirmService.confirm({
      title: 'CONFIRM_MODAL.DELETE_TASK_TITLE',
      message: 'CONFIRM_MODAL.DELETE_TASK_MSG',
      confirmText: 'COMMON.BORRAR',
      cancelText: 'COMMON.CANCEL_LAR',
      isDanger: true,
      icon: 'danger'
    });
    if (!confirmacio) return;

    this.incidenciaService.delete(t.id).subscribe({
      next: () => {
        this.tasques = this.tasques.filter(item => item.id !== t.id);
        this.successMsg = 'Element eliminat amb èxit.';
        setTimeout(() => this.successMsg = '', 3000);
      },
      error: (e) => {
        this.errorMsg = e?.error?.error || 'Error en eliminar l’element.';
      }
    });
  }
}
