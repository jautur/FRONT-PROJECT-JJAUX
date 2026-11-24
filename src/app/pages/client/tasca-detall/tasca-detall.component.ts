import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TascaService } from '../../../services/tasca.service';
import { IncidenciaService } from '../../../services/incidencia.service';
import { PressupostService } from '../../../services/pressupost.service';
import { ResenyaService } from '../../../services/resenya.service';
import { AuthService } from '../../../core/services/auth.service';
import { ConfirmService } from '../../../core/services/confirm.service';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';
import { Tasca } from '../../../models/tasca.model';
import { Oferta } from '../../../models/oferta.model';
import { Pressupost } from '../../../models/pressupost.model';
import { ContacteTascaComponent } from '../../../shared/components/contacte-tasca/contacte-tasca.component';
import { CancellarTascaModalComponent } from '../../../shared/components/cancellar-tasca/cancellar-tasca-modal.component';

/**
 * Component de Detall de Tasca i Gestió d'Ofertes (/tasca-detall/:id).
 * Permet visualitzar la informació d'una tasca concreta i totes les ofertes
 * presentades pels professionals.
 * Si l'usuari és el client propietari, pot acceptar o rebutjar propostes,
 * o marcar el projecte com a finalitzat amb valoració.
 */
@Component({
  selector: 'app-tasca-detall',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TranslatePipe, ContacteTascaComponent, CancellarTascaModalComponent],
  templateUrl: './tasca-detall.component.html',
  styleUrl: './tasca-detall.component.css'
})
export class TascaDetallComponent implements OnInit {
  /** Tasca seleccionada */
  tasca: Tasca | null = null;

  /** Ofertes rebudes per a la tasca */
  ofertes: Oferta[] = [];

  /** Estat de càrrega */
  loading = true;

  /** Missatge informatiu / avís */
  noticeMessage = '';

  /** Estat del modal de finalització i avaluació */
  modalFinalitzarObert = false;
  puntuacioSeleccionada = 5;
  ressenyaDescripcio = '';
  enviantRessenya = false;

  /** Modal de sol·licitud de cancel·lació */
  mostrarCancellacio = false;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly tascaService: TascaService,
    private readonly incidenciaService: IncidenciaService,
    private readonly pressupostService: PressupostService,
    private readonly resenyaService: ResenyaService,
    private readonly authService: AuthService,
    private readonly confirmService: ConfirmService
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

  get assignedProfessional(): string {
    return (this.tasca?.professionalNom || this.tasca?.professional || '');
  }

  /** Treball acordat entre client i professional; el tipus el decideix el back, no el prefix de l'identificador */
  get isTascaConvergida(): boolean {
    return this.tasca?.tipus === 'tasca';
  }

  get isIncidencia(): boolean {
    return this.tasca?.tipus === 'incidencia';
  }

  get isAdminUser(): boolean {
    return this.authService.isAdmin();
  }

  /** Identificador de l'altra part, només quan la tasca ja està acceptada i l'usuari n'és una de les parts */
  get contacteUsuariId(): string {
    const user = this.authService.getCurrentUser();
    const t = this.tasca;
    if (!user || !t || !this.isTascaConvergida) return '';
    if (!['En curs', 'En revisió', 'Finalitzada'].includes(t.estat || '')) return '';
    if (user.id === t.clientId) return t.professionalId || '';
    if (user.id === t.professionalId) return t.clientId || '';
    return '';
  }

  get contacteTitol(): string {
    return this.authService.getCurrentUser()?.id === this.tasca?.clientId ? 'TREBALL.CONTACTE_PROFESSIONAL' : 'TREBALL.CONTACTE_CLIENT';
  }

  /** El client o el professional poden sol·licitar la cancel·lació d'una tasca en curs */
  get potCancellar(): boolean {
    return this.isTascaConvergida && this.tasca?.estat === 'En curs' && (this.isClientOwner || this.isAssignedProfessional);
  }

  get potTancarIncidencia(): boolean {
    return this.isIncidencia && this.tasca?.estat === 'Oberta' && this.isClientOwner;
  }

  tancarModalFinalitzar(): void {
    this.modalFinalitzarObert = false;
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
   * Inicialització: obté el paràmetre :id de la ruta i carrega la tasca i ofertes.
   */
  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.loadTask(id);
      } else {
        this.loading = false;
      }
    });
  }

  /**
   * Carrega la informació de la tasca i les seves ofertes des de PostgreSQL.
   */
  private loadTask(id: string): void {
    this.tascaService.getById(id).subscribe({
      next: (task) => {
        this.tasca = task;
        this.loading = false;
        this.loadOffers(id);
      },
      error: () => {
        this.loading = false;
        this.tasca = null;
      }
    });
  }

  /**
   * Carrega els pressupostos d'una incidència.
   * PRIVADESA: només els veuen el client titular, el professional emissor (el seu) i l'administrador.
   */
  private loadOffers(taskId: string): void {
    if (!this.isIncidencia) {
      this.ofertes = [];
      return;
    }
    this.pressupostService.getByIncidencia(taskId).subscribe({
      next: (pressupostos) => {
        this.ofertes = (pressupostos || []).map(p => ({
          id: p.id,
          tascaId: p.incidenciaId,
          professional: p.professionalNom,
          professionalId: p.professionalId,
          price: p.preu,
          note: (p.descripcio || '') + (p.duracioEstimada ? ` (Termini estimat: ${p.duracioEstimada})` : ''),
          estat: p.estat || 'Pendent'
        }));
      },
      error: () => {
        this.ofertes = [];
      }
    });
  }

  /**
   * Comprova si l'usuari connectat és el client propietari de la tasca.
   */
  get isClientOwner(): boolean {
    const user = this.authService.getCurrentUser();
    return !!user && !!this.tasca && user.rol === 'CLIENT' && user.id === this.tasca.clientId;
  }

  /**
   * Comprova si l'usuari connectat és el professional assignat a aquesta tasca.
   */
  get isAssignedProfessional(): boolean {
    const user = this.authService.getCurrentUser();
    return !!user && !!this.tasca?.professionalId && user.id === this.tasca.professionalId;
  }

  /**
   * Comprova si l'usuari connectat és l'autor d'una proposta concreta.
   */
  isOfferOwner(offer: Oferta): boolean {
    const user = this.authService.getCurrentUser();
    return !!user && !!offer.professionalId && user.id === offer.professionalId;
  }

  /**
   * Comprova si l'usuari connectat és un professional (només el rol PROFESSIONAL pot presentar pressupostos).
   */
  get isProfessional(): boolean {
    return this.authService.hasRole('PROFESSIONAL');
  }

  /**
   * Accepta un pressupost o oferta seleccionada pel client.
   * Transaccionalment crea la tasca en curs i elimina la incidència de les publicacions.
   */
  async onAcceptOffer(offerId: string): Promise<void> {
    const confirmacio = await this.confirmService.confirm({
      title: 'CONFIRM_MODAL.ACCEPT_BUDGET_TITLE',
      message: 'CONFIRM_MODAL.ACCEPT_BUDGET_MSG',
      confirmText: 'CONFIRM_MODAL.DEFAULT_CONFIRM',
      cancelText: 'CONFIRM_MODAL.DEFAULT_CANCEL',
      icon: 'success'
    });
    if (!confirmacio) return;

    this.pressupostService.accept(offerId).subscribe({
      next: (tascaCreada) => {
        this.noticeMessage = 'TREBALL.BUDGET_ACCEPTED_OK';
        this.ofertes = [];
        if (tascaCreada && tascaCreada.id) {
          setTimeout(() => {
            this.router.navigate([this.getNavUrl('/tasca-detall'), tascaCreada.id]);
          }, 1200);
        } else if (this.tasca) {
          this.loadTask(this.tasca.id);
        }
      },
      error: (e) => {
        this.noticeMessage = e?.error?.error || 'TREBALL.BUDGET_ACCEPT_ERROR';
      }
    });
  }

  /**
   * Rebutja un pressupost pendent. El professional rep un avís.
   */
  async onDeleteOffer(offerId: string): Promise<void> {
    const confirmacio = await this.confirmService.confirm({
      title: 'TREBALL.BUDGET_REJECT_TITLE',
      message: 'TREBALL.BUDGET_REJECT_MSG',
      confirmText: 'CONFIRM_MODAL.DEFAULT_CONFIRM',
      cancelText: 'CONFIRM_MODAL.DEFAULT_CANCEL',
      isDanger: true,
      icon: 'danger'
    });
    if (!confirmacio) return;

    this.pressupostService.reject(offerId).subscribe({
      next: () => {
        this.noticeMessage = 'TREBALL.BUDGET_REJECTED_OK';
        this.ofertes = this.ofertes.filter(o => o.id !== offerId);
      },
      error: (e) => {
        this.noticeMessage = e?.error?.error || 'TREBALL.BUDGET_REJECT_ERROR';
      }
    });
  }

  /** Tanca la incidència oberta: els pressupostos pendents es rebutgen i els professionals reben un avís */
  async onCloseIncidencia(): Promise<void> {
    if (!this.tasca) return;
    const confirmacio = await this.confirmService.confirm({
      title: 'TREBALL.CLOSE_INCIDENT_TITLE',
      message: 'TREBALL.CLOSE_INCIDENT_MSG',
      confirmText: 'TREBALL.CLOSE_INCIDENT_BTN',
      cancelText: 'COMMON.CANCEL_LAR',
      isDanger: true,
      icon: 'warning'
    });
    if (!confirmacio) return;
    this.incidenciaService.close(this.tasca.id).subscribe({
      next: () => {
        this.noticeMessage = 'TREBALL.CLOSE_INCIDENT_OK';
        this.loadTask(this.tasca!.id);
      },
      error: (e) => {
        this.noticeMessage = e?.error?.error || 'TREBALL.CLOSE_INCIDENT_ERROR';
      }
    });
  }

  alCancellacioSollicitada(updated: Tasca): void {
    this.mostrarCancellacio = false;
    this.tasca = updated;
    this.noticeMessage = 'TREBALL.CANCEL_SENT_OK';
  }

  /**
   * Àlies per compatibilitat: rebutjar esdevé borrar/descartar.
   */
  onRejectOffer(offerId: string): void {
    this.onDeleteOffer(offerId);
  }

  /**
   * El professional assignat finalitza la tasca un cop completada la feina.
   */
  async onCompleteTaskByPro(): Promise<void> {
    if (!this.tasca) return;
    const confirmacio = await this.confirmService.confirm({
      title: 'CONFIRM_MODAL.FINALIZE_TASK_TITLE',
      message: 'CONFIRM_MODAL.FINALIZE_TASK_MSG',
      confirmText: 'CONFIRM_MODAL.DEFAULT_CONFIRM',
      cancelText: 'CONFIRM_MODAL.DEFAULT_CANCEL',
      icon: 'success'
    });
    if (!confirmacio) return;

    this.tascaService.complete(this.tasca.id).subscribe({
      next: (updated) => {
        this.tasca = updated;
        this.noticeMessage = 'Enhorabona! Has donat per finalitzada la tasca. S’ha registrat la finalització i notificat al client!';
      },
      error: (e) => {
        this.noticeMessage = e?.error?.error || 'Error en finalitzar la tasca. Si us plau, torna-ho a provar.';
      }
    });
  }

  /**
   * Obre el modal per avaluar la tasca un cop el professional l'ha donat per finalitzada.
   */
  onCompleteTask(): void {
    if (!this.tasca) return;
    this.puntuacioSeleccionada = this.tasca.valoracio || 5;
    this.ressenyaDescripcio = this.tasca.comentari || '';
    this.modalFinalitzarObert = true;
  }

  /**
   * Confirma l'avaluació i envia la valoració (només es permet una única vegada un cop acabada la tasca).
   */
  confirmarFinalitzacioAmbRessenya(): void {
    if (!this.tasca) return;
    const t = this.tasca;
    this.enviantRessenya = true;
    const textDesc = this.ressenyaDescripcio.trim() || 'Feina completada amb èxit i total satisfacció.';

    const dades = { valoracio: this.puntuacioSeleccionada, comentari: textDesc };
    // Si la tasca encara és en curs, el client la finalitza i la valora d'una vegada
    const peticio$ = t.estat === 'En curs' ? this.tascaService.complete(t.id, dades) : this.tascaService.avaluar(t.id, dades);
    peticio$.subscribe({
      next: (updated) => {
        this.tasca = updated;
        this.enviantRessenya = false;
        this.tancarModalFinalitzar();
        this.noticeMessage = 'La teva valoració s\'ha registrat i publicat correctament!';
      },
      error: (e) => {
        this.enviantRessenya = false;
        this.noticeMessage = e?.error?.error || 'Error en registrar la valoració.';
      }
    });
  }

  /**
   * Finalitza la tasca sense emetre cap valoració.
   */
  finalitzarSenseRessenya(): void {
    if (!this.tasca) return;
    this.enviantRessenya = true;
    this.tascaService.complete(this.tasca.id).subscribe({
      next: (updated) => {
        this.tasca = updated;
        this.enviantRessenya = false;
        this.tancarModalFinalitzar();
        this.noticeMessage = 'Felicitats! La tasca ha estat marcada com a Finalitzada.';
      },
      error: (e) => {
        this.enviantRessenya = false;
        this.noticeMessage = e?.error?.error || 'Error en finalitzar la tasca.';
      }
    });
  }

  /**
   * Genera la classe CSS per al color de l'estat.
   */
  getStatusClass(status: string): string {
    return 'status-' + (status || '').toLowerCase().normalize('NFD').replace(/[^a-z0-9]+/g, '-');
  }
}

