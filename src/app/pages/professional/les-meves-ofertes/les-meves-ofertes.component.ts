import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { OfertaService } from '../../../services/oferta.service';
import { TascaService } from '../../../services/tasca.service';
import { InteresService } from '../../../services/interes.service';
import { AuthService } from '../../../core/services/auth.service';
import { ConfirmService } from '../../../core/services/confirm.service';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';
import { Oferta } from '../../../models/oferta.model';
import { Tasca } from '../../../models/tasca.model';
import { Interes } from '../../../models/interes.model';
import { ContacteTascaComponent } from '../../../shared/components/contacte-tasca/contacte-tasca.component';
import { CancellarTascaModalComponent } from '../../../shared/components/cancellar-tasca/cancellar-tasca-modal.component';

/**
 * Component del Panell de Gestió d'Ofertes del Professional (/professional/les-meves-ofertes).
 * Permet a un professional:
 * - Consultar les tasques que té assignades en curs i finalitzar-les directament.
 * - Consultar tots els pressupostos i ofertes que ha presentat.
 * - Borrar ofertes que ja no li interessen mantenir actives.
 * - Navegar directament als detalls de la tasca per consultar requisits o actualitzacions.
 */
@Component({
  selector: 'app-les-meves-ofertes',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslatePipe, ContacteTascaComponent, CancellarTascaModalComponent],
  templateUrl: './les-meves-ofertes.component.html',
  styleUrl: './les-meves-ofertes.component.css'
})
export class LesMevesOfertesComponent implements OnInit {
  /** Sol·licituds de clients que encara esperen la resposta del professional */
  sollicituds: Interes[] = [];
  /** Tasca per a la qual s'està sol·licitant la cancel·lació */
  tascaPerCancellar: Tasca | null = null;
  /** Llista d'ofertes enviades pel professional */
  ofertes: Oferta[] = [];
  /** Llista de tasques on el professional ha estat assignat i convergeix amb el client */
  tasquesAssignades: Tasca[] = [];
  /** Mapa per accedir ràpidament a les dades de la tasca [tascaId -> Tasca] */
  tasquesMap: Record<string, Tasca> = {};
  /** Estat de càrrega */
  loading = true;
  /** Missatge d'èxit */
  successMsg = '';
  /** Missatge d'error */
  errorMsg = '';

  constructor(
    private readonly ofertaService: OfertaService,
    private readonly tascaService: TascaService,
    private readonly interesService: InteresService,
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
   * Inicialització del component: carrega les ofertes del professional connectat.
   */
  ngOnInit(): void {
    this.carregarOfertes();
  }

  /**
   * Carrega les ofertes enviades pel professional connectat i obté la informació de les tasques.
   */
  carregarOfertes(): void {
    this.loading = true;
    this.errorMsg = '';
    const user = this.authService.getCurrentUser();

    if (!user) {
      this.router.navigate([this.getNavUrl('/login')]);
      return;
    }

    // Carrega les tasques on aquest professional ha estat assignat, per identificador
    this.tascaService.getByProfessional(user.id).subscribe({
      next: (tasks) => {
        this.tasquesAssignades = tasks ?? [];
      },
      error: () => {
        this.errorMsg = 'Error en carregar les teves tasques.';
      }
    });

    // Sol·licituds pendents: les acceptades ja apareixen com a tasques
    this.interesService.getByProfessional(user.id).subscribe({
      next: (interessos) => {
        this.sollicituds = (interessos ?? []).filter((i) => !i.tascaId);
      },
      error: () => {
        this.errorMsg = 'Error en carregar les sol·licituds rebudes.';
      }
    });

    // Carrega totes les tasques per a poder mostrar títol i dades del client a les ofertes
    this.tascaService.getAll().subscribe({
      next: (tasques) => {
        tasques.forEach(t => {
          this.tasquesMap[t.id] = t;
        });

        // Carrega les ofertes del professional
        this.ofertaService.getByProfessional(user.nom).subscribe({
          next: (data) => {
            this.ofertes = data;
            this.loading = false;
          },
          error: () => {
            this.errorMsg = 'Error en carregar les teves ofertes.';
            this.loading = false;
          }
        });
      },
      error: () => {
        this.errorMsg = 'Error en carregar la llista de tasques associades.';
        this.loading = false;
      }
    });
  }

  /**
   * Permet al professional assignat donar per finalitzada una tasca en curs.
   * El backend notificarà al client perquè pugui valorar la feina.
   */
  async finalitzarTascaComAProfessional(t: Tasca): Promise<void> {
    const confirmacio = await this.confirmService.confirm({
      title: 'CONFIRM_MODAL.FINALIZE_TASK_TITLE',
      message: 'CONFIRM_MODAL.FINALIZE_TASK_MSG',
      confirmText: 'CONFIRM_MODAL.DEFAULT_CONFIRM',
      cancelText: 'CONFIRM_MODAL.DEFAULT_CANCEL',
      icon: 'success'
    });
    if (!confirmacio) return;

    this.tascaService.complete(t.id).subscribe({
      next: () => {
        t.estat = 'Finalitzada';
        this.successMsg = `Has marcat la tasca "${t.titol}" com a finalitzada correctament.`;
        setTimeout(() => this.successMsg = '', 4500);
      },
      error: (err) => {
        this.confirmService.alert(err?.error?.error || 'No s\'ha pogut marcar la tasca com a finalitzada.', 'Error');
      }
    });
  }

  /** El professional accepta la sol·licitud: la tasca comença i el client rep un avís */
  acceptarSollicitud(s: Interes): void {
    this.interesService.accept(s.id).subscribe({
      next: () => {
        this.successMsg = 'TREBALL.SOL_ACCEPTED_OK';
        this.carregarOfertes();
        setTimeout(() => this.successMsg = '', 4500);
      },
      error: (e) => (this.errorMsg = e?.error?.error || 'TREBALL.SOL_ERROR')
    });
  }

  async rebutjarSollicitud(s: Interes): Promise<void> {
    const confirmacio = await this.confirmService.confirm({
      title: 'TREBALL.SOL_REJECT_TITLE',
      message: 'TREBALL.SOL_REJECT_MSG',
      confirmText: 'TREBALL.SOL_REJECT',
      cancelText: 'COMMON.CANCEL_LAR',
      isDanger: true,
      icon: 'warning'
    });
    if (!confirmacio) return;
    this.interesService.reject(s.id).subscribe({
      next: () => {
        this.successMsg = 'TREBALL.SOL_REJECTED_OK';
        this.carregarOfertes();
        setTimeout(() => this.successMsg = '', 4500);
      },
      error: (e) => (this.errorMsg = e?.error?.error || 'TREBALL.SOL_ERROR')
    });
  }

  alCancellacioSollicitada(): void {
    this.tascaPerCancellar = null;
    this.successMsg = 'TREBALL.CANCEL_SENT_OK';
    this.carregarOfertes();
    setTimeout(() => this.successMsg = '', 4500);
  }

  /**
   * Elimina/borra una oferta del professional.
   * Les ofertes no tenen estat: sols s'accepten o es borren.
   */
  async eliminarOferta(id: string): Promise<void> {
    const confirmacio = await this.confirmService.confirm({
      title: 'TREBALL.RETIRE_OFFER_TITLE',
      message: 'TREBALL.RETIRE_OFFER_MSG',
      confirmText: 'CONFIRM_MODAL.DEFAULT_CONFIRM',
      cancelText: 'CONFIRM_MODAL.DEFAULT_CANCEL',
      isDanger: true,
      icon: 'danger'
    });
    if (!confirmacio) return;

    this.ofertaService.delete(id).subscribe({
      next: () => {
        this.ofertes = this.ofertes.filter(o => o.id !== id);
        this.successMsg = 'Oferta borrada amb èxit.';
        setTimeout(() => this.successMsg = '', 3500);
      },
      error: (err) => {
        this.confirmService.alert(err?.error?.error || 'No s\'ha pogut borrar l\'oferta.', 'Error');
      }
    });
  }

  getTaskEstatClass(estat: string): string {
    const e = estat?.toLowerCase() || '';
    if (e.includes('revisi')) return 'estat-pendent';
    if (e.includes('curs')) return 'estat-en-curs';
    if (e.includes('finalitzad')) return 'estat-finalitzada';
    return 'estat-pendent';
  }
}
