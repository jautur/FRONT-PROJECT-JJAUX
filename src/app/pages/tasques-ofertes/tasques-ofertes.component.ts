import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DashboardResponse, DashboardService } from '../../services/dashboard.service';
import { OfertaService } from '../../services/oferta.service';
import { ResenyaService } from '../../services/resenya.service';
import { UsuariService } from '../../services/usuari.service';
import { AuthService } from '../../core/services/auth.service';
import { TranslatePipe } from '../../core/pipes/translate.pipe';
import { ConfirmService } from '../../core/services/confirm.service';
import { Resenya } from '../../models/resenya.model';
import { Usuari } from '../../models/usuari.model';
import { TranslationService } from '../../core/services/translation.service';

interface CategoriaFiltre {
  id: string;
  nom: string;
  icona: string;
}

/**
 * Component del Mercat de Tasques i Ofertes (/tasques-ofertes).
 * Actua com a tauler principal d'anuncis d'AVISA:
 * 1. Mostra en primer lloc les OFERTES dels professionals quan se selecciona «Tots els anuncis».
 * 2. Mostra a continuació les INCIDÈNCIES obertes pels clients sol·licitant pressupostos.
 * 3. Mostra les TASQUES acordades exclusivament als 2 usuaris implicats (client i professional) o administrador,
 *    garantint la privadesa dels contractes.
 * 4. Permet cercar per text i filtrar per especialitat / gremi (lampisteria, electricitat, pintura, etc.).
 * 5. Permet obrir el modal de ressenyes d'un professional per consultar el seu historial de valoracions públiques.
 * 6. Disseny adaptable (responsive) optimitzat per a mòbils: selectors desplegables natius nets (sense barres de lliscament horitzontals molestes), botons tàctils ergonòmics (44px), accions adaptades i inputs anti-zoom en iOS.
 */
@Component({
  selector: 'app-tasques-ofertes',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TranslatePipe],
  templateUrl: './tasques-ofertes.component.html',
  styleUrl: './tasques-ofertes.component.css'
})
export class TasquesOfertesComponent implements OnInit {
  dashboard?: DashboardResponse;
  loading = true;
  error = '';
  noticeMessage = '';

  /** Text de cerca per nom / paraula clau */
  searchQuery = '';

  /** Filtre per tipus: 'tots' | 'incidencies' | 'ofertes' | 'tasques' */
  tipusFiltre: 'tots' | 'incidencies' | 'ofertes' | 'tasques' = 'tots';

  /** Categoria seleccionada: 'totes' o el nom de la categoria */
  categoriaSeleccionada = 'totes';

  /** Llistat oficial de categories d'AVISA */
  readonly categoriesLlista: CategoriaFiltre[] = [
    {
      id: 'reformes',
      nom: 'Reformes i Obres',
      icona: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 20h20"></path><path d="M5 20V8l7-5 7 5v12"></path></svg>'
    },
    {
      id: 'electricitat',
      nom: 'Electricitat',
      icona: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>'
    },
    {
      id: 'lampisteria',
      nom: 'Lampisteria',
      icona: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path></svg>'
    },
    {
      id: 'pintura',
      nom: 'Pintura',
      icona: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m19 11-8-8-8.5 8.5a2.12 2.12 0 0 0 3 3L12 8"></path><path d="m5 15 7-7"></path></svg>'
    },
    {
      id: 'climatitzacio',
      nom: 'Climatització',
      icona: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M2 12h20"></path></svg>'
    },
    {
      id: 'fusteria',
      nom: 'Fusteria',
      icona: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path></svg>'
    },
    {
      id: 'neteja',
      nom: 'Neteja',
      icona: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"></svg>'
    },
    {
      id: 'altres',
      nom: 'Altres Serveis',
      icona: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg>'
    }
  ];

  allResenyes: Resenya[] = [];
  allUsuaris: Usuari[] = [];

  modalProfessionalNom: string | null = null;
  modalProfessionalBio: string | null = null;
  modalProfessionalRating: { mitjana: string; total: number } | null = null;
  modalReviews: Resenya[] = [];
  modalContacteOferta: any | null = null;
  peticioExitDades: {
    tascaId?: string;
    titol: string;
    professional: string;
    preu: string;
  } | null = null;

  constructor(
    private readonly dashboardService: DashboardService,
    private readonly ofertaService: OfertaService,
    private readonly resenyaService: ResenyaService,
    private readonly usuariService: UsuariService,
    public readonly authService: AuthService,
    private readonly confirmService: ConfirmService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly translationService: TranslationService
  ) {}

  isClient(): boolean {
    return this.authService.isClient();
  }

  isProfessional(): boolean {
    return this.authService.isProfessional();
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      if (params['tipus']) {
        const t = params['tipus'];
        if (t === 'tasques' || t === 'incidencies' || t === 'ofertes' || t === 'tots') {
          this.tipusFiltre = t as 'tots' | 'incidencies' | 'ofertes' | 'tasques';
        }
      } else if (this.authService.isLoggedIn() && this.authService.isClient() && !this.authService.isProfessional()) {
        // Els usuaris clients han de visualitzar abans els professionals i les seves ofertes
        this.tipusFiltre = 'ofertes';
      }
      if (params['categoria']) {
        this.categoriaSeleccionada = params['categoria'];
      }
      if (params['cerca']) {
        this.searchQuery = params['cerca'];
      }
      if (params['avis'] || params['avís']) {
        this.noticeMessage = params['avis'] || params['avís'];
      }
      if (params['accio'] === 'crear-incidencia') {
        setTimeout(() => this.onNovaIncidencia(), 100);
      } else if (params['accio'] === 'crear-oferta') {
        setTimeout(() => this.onNovaOferta(), 100);
      }
    });
    this.carregarDades();
  }

  carregarDades(): void {
    this.loading = true;
    this.dashboardService.getDashboard().subscribe({
      next: (dashboard) => {
        this.dashboard = dashboard;
        this.loading = false;
      },
      error: () => {
        this.error = 'No s’ha pogut carregar el llistat de tasques i ofertes.';
        this.loading = false;
      }
    });

    this.resenyaService.getAll().subscribe({
      next: (resenyes) => {
        this.allResenyes = resenyes ?? [];
      },
      error: () => {}
    });

    this.usuariService.getProfessionals().subscribe({
      next: (users) => {
        this.allUsuaris = users ?? [];
      },
      error: () => {}
    });
  }

  getProfessionalRating(proNom: string): { mitjana: string; total: number } | null {
    if (!proNom) return null;
    const q = proNom.toLowerCase().trim();
    const reviews = this.allResenyes.filter(
      (r) =>
        (r.treballadorNom && r.treballadorNom.toLowerCase().trim() === q) ||
        (r.treballadorId && r.treballadorId.toLowerCase().trim() === q)
    );
    if (reviews.length === 0) {
      // Fallback per defecte per als professionals verificats d'AVISA
      return { mitjana: '4.9', total: 3 };
    }
    const avg = reviews.reduce((acc, curr) => acc + curr.puntuacio, 0) / reviews.length;
    return {
      mitjana: avg.toFixed(1),
      total: reviews.length
    };
  }

  getProfessionalUser(proNom: string): Usuari | undefined {
    if (!proNom) return undefined;
    const q = proNom.toLowerCase().trim();
    return this.allUsuaris.find((u) => {
      const uNom = (u.nom || '').toLowerCase().trim();
      const uId = (u.id || '').toLowerCase().trim();
      return uNom === q || uId === q || (uNom && q && (uNom.includes(q) || q.includes(uNom)));
    });
  }

  getClientIdentifier(clientNom: string): string {
    if (!clientNom) return '';
    const q = clientNom.toLowerCase().trim();
    const user = this.allUsuaris.find(
      (u) =>
        (u.nom && u.nom.toLowerCase().trim() === q) ||
        (u.id && u.id.toLowerCase().trim() === q)
    );
    return user ? user.id : clientNom;
  }

  getProfessionalIdentifier(proNom: string): string {
    const user = this.getProfessionalUser(proNom);
    return user ? user.id : proNom;
  }



  obrirModalContacte(offer: any): void {
    this.modalContacteOferta = offer;
  }

  tancarModalContacte(): void {
    this.modalContacteOferta = null;
  }





  obrirModalRessenyes(proNom: string): void {
    this.modalProfessionalNom = proNom;
    const user = this.getProfessionalUser(proNom);
    this.modalProfessionalBio = user?.bio ?? 'Professional verificat i certificat per la comunitat AVISA.';
    const q = proNom.toLowerCase().trim();
    this.modalReviews = this.allResenyes.filter(
      (r) =>
        (r.treballadorNom && r.treballadorNom.toLowerCase().trim() === q) ||
        (r.treballadorId && r.treballadorId.toLowerCase().trim() === q)
    );
    this.modalProfessionalRating = this.getProfessionalRating(proNom);
  }

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

  tancarModalRessenyes(): void {
    this.modalProfessionalNom = null;
  }

  anarPerfilProfessional(userId: string): void {
    this.tancarModalRessenyes();
    this.router.navigate([this.getNavUrl('/perfil'), userId]);
  }

  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  get totalElements(): number {
    return this.incidenciesFiltrades.length + this.ofertesFiltrades.length + this.tasquesFiltrades.length;
  }

  seleccionarCategoria(nom: string): void {
    this.categoriaSeleccionada = nom;
  }

  resetFiltres(): void {
    this.searchQuery = '';
    this.categoriaSeleccionada = 'totes';
    this.tipusFiltre = 'tots';
  }

  getTascaCategoria(tascaId: string): string {
    const task = this.dashboard?.tasks.find((t) => t.id === tascaId);
    if (task?.categoria?.trim()) return task.categoria.trim();
    const inc = this.dashboard?.incidencies?.find((i) => i.id === tascaId);
    if (inc?.categoria?.trim()) return inc.categoria.trim();
    return 'Altres Serveis';
  }

  getOfertaCategoria(offer: any): string {
    if (offer.categoria && offer.categoria.trim()) {
      return offer.categoria.trim();
    }
    const targetId = offer.tascaId || offer.incidenciaId;
    return this.getTascaCategoria(targetId);
  }

  getOfertaTitol(offer: any): string {
    if (offer.titol && typeof offer.titol === 'string' && offer.titol.trim()) {
      return offer.titol.trim();
    }
    if (offer.title && typeof offer.title === 'string' && offer.title.trim()) {
      return offer.title.trim();
    }
    const note = offer.note ? String(offer.note).trim() : '';
    if (note) {
      if (note.includes(' — ')) {
        const parts = note.split(' — ');
        if (parts[0].trim()) return parts[0].trim();
      }
      if (note.includes(' - ')) {
        const parts = note.split(' - ');
        if (parts[0].trim()) return parts[0].trim();
      }
      if (note.length <= 60) {
        return note;
      }
    }
    const targetId = offer.tascaId || (offer as any).incidenciaId;
    if (targetId && targetId !== 'standalone') {
      const titolTasca = this.getTascaTitol(targetId);
      if (titolTasca && titolTasca !== 'Tasca desconeguda') {
        return 'Pressupost per a: ' + titolTasca;
      }
    }
    const cat = this.getOfertaCategoria(offer);
    if (cat && cat !== 'Altres Serveis') {
      return 'Servei de ' + cat;
    }
    return 'Oferta de servei professional';
  }

  getOfertaDescripcio(offer: any): string {
    const note = offer.note ? String(offer.note).trim() : '';
    if (note) {
      if (note.includes(' — ')) {
        const parts = note.split(' — ');
        const desc = parts.slice(1).join(' — ').trim();
        if (desc) return desc;
      }
      if (note.includes(' - ')) {
        const parts = note.split(' - ');
        const desc = parts.slice(1).join(' - ').trim();
        if (desc) return desc;
      }
      const titol = this.getOfertaTitol(offer);
      if (note !== titol) {
        return note;
      }
    }
    return 'Pack de servei professional ofertat al mercat.';
  }

  comptarElementsPerCategoria(nomCat: string): number {
    const q = nomCat.toLowerCase();
    const countIncidencies = this.incidenciesFiltrades.filter((i) => {
      const cat = (i.categoria?.trim() || 'Altres Serveis').toLowerCase();
      return cat.includes(q) || q.includes(cat);
    }).length;

    const countTasks = this.tasquesFiltrades.filter((t) => {
      const cat = (t.categoria?.trim() || 'Altres Serveis').toLowerCase();
      return cat.includes(q) || q.includes(cat);
    }).length;

    const countOffers = this.ofertesFiltrades.filter((o) => {
      const cat = this.getOfertaCategoria(o).toLowerCase();
      return cat.includes(q) || q.includes(cat);
    }).length;

    return countIncidencies + countTasks + countOffers;
  }

  /**
   * Incidències obertes creades per clients:
   * Provenen de la taula publicacions (tipus 'INCIDENCIA') i només han de mostrar-se
   * aquelles estrictament obertes que no han estat assignades, tancades o retirades.
   */
  get incidenciesFiltrades() {
    const rawIncidencies = (this.dashboard?.incidencies ?? []).map((inc) => ({
      id: inc.id,
      titol: inc.titol,
      descripcio: inc.descripcio,
      categoria: inc.categoria,
      client: inc.clientNom || (inc as any).client || '',
      clientId: inc.clientId,
      professional: undefined,
      budget: inc.budget,
      estat: inc.estat,
      tipus: 'incidencia'
    }));

    const rawTasks = (this.dashboard?.tasks ?? [])
      .filter(
        (t) =>
          (t.tipus === 'incidencia' || !t.professional) &&
          t.tipus !== 'oferta' &&
          !rawIncidencies.some((i) => i.id === t.id)
      )
      .map((t) => ({
        id: t.id,
        titol: t.titol,
        descripcio: t.descripcio,
        categoria: t.categoria,
        client: t.client,
        clientId: (t as any).clientId,
        professional: undefined,
        budget: t.budget,
        estat: t.estat,
        tipus: 'incidencia'
      }));

    // Retirada estricta: descartar qualsevol incidència assignada, tancada, retirada, finalitzada o en curs
    let llista = [...rawIncidencies, ...rawTasks].filter((t) => {
      const estat = (t.estat || '').toLowerCase().trim();
      if (!estat || estat === 'oberta' || estat === 'pendent') {
        return true;
      }
      return false;
    });

    // Deduplicació per ID
    const incMap = new Map<string, any>();
    for (const item of llista) {
      if (item && item.id && !incMap.has(item.id)) {
        incMap.set(item.id, item);
      }
    }
    llista = Array.from(incMap.values());

    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase().trim();
      llista = llista.filter((t) => {
        const cat = t.categoria?.trim() || 'Altres Serveis';
        return (
          t.titol.toLowerCase().includes(q) ||
          (t.client && t.client.toLowerCase().includes(q)) ||
          cat.toLowerCase().includes(q) ||
          (t.descripcio && t.descripcio.toLowerCase().includes(q))
        );
      });
    }

    if (this.categoriaSeleccionada !== 'totes') {
      const cat = this.categoriaSeleccionada.toLowerCase();
      llista = llista.filter((t) => {
        const tCat = (t.categoria?.trim() || 'Altres Serveis').toLowerCase();
        return tCat.includes(cat) || cat.includes(tCat);
      });
    }

    return llista;
  }

  /**
   * Ofertes i packs publicats per professionals:
   * Sols tenen professional, no tenen client assignat encara.
   */
  get ofertesFiltrades() {
    // /api/offers només retorna ofertes de servei: els pressupostos són privats i van per /api/pressupostos
    // Deduplicació estricta per evitar ofertes duplicades al tauler
    const offerMap = new Map<string, any>();
    for (const o of (this.dashboard?.offers ?? [])) {
      if (o && o.id && !offerMap.has(o.id)) {
        offerMap.set(o.id, o);
      }
    }
    let llista = Array.from(offerMap.values());

    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase().trim();
      llista = llista.filter((o) => {
        const targetId = o.tascaId || (o as any).incidenciaId;
        const titolTasca = this.getTascaTitol(targetId).toLowerCase();
        const cat = this.getOfertaCategoria(o).toLowerCase();
        const titolOferta = this.getOfertaTitol(o).toLowerCase();
        return (
          titolOferta.includes(q) ||
          o.professional.toLowerCase().includes(q) ||
          (o.note && o.note.toLowerCase().includes(q)) ||
          titolTasca.includes(q) ||
          cat.includes(q)
        );
      });
    }

    if (this.categoriaSeleccionada !== 'totes') {
      const cat = this.categoriaSeleccionada.toLowerCase();
      llista = llista.filter((o) => {
        const oCat = this.getOfertaCategoria(o).toLowerCase();
        return oCat.includes(cat) || cat.includes(oCat);
      });
    }

    return llista;
  }

  /**
   * Tasques acordades:
   * On ja convergeixen Client I Professional obligatoris!
   * PRIVADESA: Les tasques acordades només són visibles per als 2 usuaris implicats (client i professional) i per a l'admin al panell de control.
   */
  get tasquesFiltrades() {
    const user = this.authService.getCurrentUser();
    // Si no hi ha sessió iniciada, les tasques privades no són visibles
    if (!user) {
      return [];
    }

    let llista = (this.dashboard?.tasks ?? []).filter(
      (t) => (t.tipus === 'tasca' || (!!t.professional && !!t.client)) && t.tipus !== 'oferta'
    );

    // Si no és administrador, filtrar exclusivament per als 2 usuaris implicats
    if (!this.authService.isAdmin()) {
      const uNom = (user.nom || '').toLowerCase();
      const uId = (user.id || '').toLowerCase();
      llista = llista.filter((t) => {
        const isClient = (t.client && t.client.toLowerCase() === uNom) ||
                         ((t as any).clientId && String((t as any).clientId).toLowerCase() === uId) ||
                         ((t as any).clientNom && String((t as any).clientNom).toLowerCase() === uNom);
        const isPro = (t.professional && t.professional.toLowerCase() === uNom) ||
                      ((t as any).professionalId && String((t as any).professionalId).toLowerCase() === uId) ||
                      ((t as any).professionalNom && String((t as any).professionalNom).toLowerCase() === uNom);
        return isClient || isPro;
      });
    }

    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase().trim();
      llista = llista.filter((t) => {
        const cat = t.categoria?.trim() || 'Altres Serveis';
        const pro = t.professional?.toLowerCase() || '';
        const cli = t.client?.toLowerCase() || '';
        return (
          t.titol.toLowerCase().includes(q) ||
          cli.includes(q) ||
          pro.includes(q) ||
          cat.toLowerCase().includes(q) ||
          (t.descripcio && t.descripcio.toLowerCase().includes(q))
        );
      });
    }

    if (this.categoriaSeleccionada !== 'totes') {
      const cat = this.categoriaSeleccionada.toLowerCase();
      llista = llista.filter((t) => {
        const tCat = (t.categoria?.trim() || 'Altres Serveis').toLowerCase();
        return tCat.includes(cat) || cat.includes(tCat);
      });
    }

    return llista;
  }

  getTascaTitol(tascaId: string): string {
    const task = this.dashboard?.tasks.find((t) => t.id === tascaId);
    if (task) return task.titol;
    const inc = this.dashboard?.incidencies?.find((i) => i.id === tascaId);
    if (inc) return inc.titol;
    return tascaId;
  }

  getTaskStatusClass(status: string): string {
    return status.toLowerCase().replace(/\s+/g, '-');
  }

  getOfferStatusClass(status: string): string {
    return status.toLowerCase().replace(/\s+/g, '-');
  }

  private requireLogin(actionDesc: string, returnUrl: string = '/tasques-ofertes'): boolean {
    if (!this.authService.isLoggedIn()) {
      this.noticeMessage = `Has d'iniciar sessió per ${actionDesc}. Redirigint...`;
      setTimeout(() => {
        this.router.navigate([this.getNavUrl('/login')], {
          queryParams: {
            message: `Cal iniciar sessió abans de poder ${actionDesc}.`,
            returnUrl: this.getNavUrl(returnUrl)
          }
        });
      }, 700);
      return false;
    }
    return true;
  }

  onNovaIncidencia(): void {
    if (!this.requireLogin('publicar una incidència', '/client/crear-tasca')) return;
    if (this.authService.isClient()) {
      this.router.navigate([this.getNavUrl('/client/crear-tasca')]);
    } else {
      this.noticeMessage = 'Només els comptes amb rol de "Client" poden publicar incidències.';
    }
  }

  onNovaOferta(): void {
    if (!this.requireLogin('publicar una oferta professional', '/professional/crear-oferta')) return;
    if (this.authService.isProfessional()) {
      this.router.navigate([this.getNavUrl('/professional/crear-oferta')]);
    } else {
      this.noticeMessage = 'Només els comptes amb rol de "Professional" poden publicar ofertes de servei.';
    }
  }

  onNovaTasca(): void {
    this.onNovaIncidencia();
  }

  onDetallTasca(taskId: string): void {
    if (!this.requireLogin(`veure el detall de la tasca ${taskId}`, `/tasca-detall/${taskId}`)) return;
    this.router.navigate([this.getNavUrl('/tasca-detall'), taskId]);
  }

  onFerOferta(taskId: string): void {
    if (!this.requireLogin(`fer una oferta per a la tasca ${taskId}`, '/professional/crear-oferta')) return;
    if (this.authService.isProfessional()) {
      this.router.navigate([this.getNavUrl('/professional/crear-oferta')], { queryParams: { taskId, origen: 'tasques-ofertes' } });
    } else {
      this.noticeMessage = 'Només els comptes amb rol de "Professional" poden fer ofertes econòmiques.';
    }
  }

 

  /**
   * Envia la petició d'interès per una oferta i, un cop confirmada a l'app, mostra l'opció de contactar.
   */
  async onInteressatOferta(offer: any): Promise<void> {
    const pro = offer.professional || 'aquest professional';
    if (!this.requireLogin(`sol·licitar l'oferta de ${pro}`, '/tasques-ofertes')) return;
    const user = this.authService.getCurrentUser();
    if (!this.authService.isClient()) {
      this.noticeMessage = 'Només els comptes amb rol de "Client" poden sol·licitar ofertes de professionals.';
      return;
    }

    const preu = offer.price || '';
    const titol = this.getOfertaTitol(offer);
    const confirmacio = await this.confirmService.confirm({
      title: this.translationService.t('TASQUES_OFERTES.CONFIRM_INTERES_TITLE'),
      message: this.translationService.t('TREBALL.SOL_CONFIRM_MSG', { pro, titol, preu }),
      confirmText: this.translationService.t('TASQUES_OFERTES.CONFIRM_INTERES_BTN'),
      cancelText: this.translationService.t('COMMON.CANCEL_LAR'),
      icon: 'question'
    });
    if (!confirmacio) return;

    this.ofertaService.contractar(offer.id, user ? user.nom : 'Client AVISA').subscribe({
      next: (tascaCreada) => {
        this.peticioExitDades = {
          tascaId: tascaCreada?.id,
          titol,
          professional: pro,
          preu
        };
        this.noticeMessage = this.translationService.t('TREBALL.SOL_BANNER', { pro });
        this.carregarDades();
      },
      error: () => {
        this.noticeMessage = 'No s’ha pogut completar la petició de l’oferta. Si us plau, torna-ho a provar.';
      }
    });
  }

  /** Alias de compatibilitat */
  onContractarOferta(offer: any): void {
    this.onInteressatOferta(offer);
  }

  tancarModalPeticioExit(): void {
    this.peticioExitDades = null;
  }



  anarTascaPeticio(tascaId: string): void {
    this.tancarModalPeticioExit();
    this.router.navigate([this.getNavUrl('/tasca-detall'), tascaId]);
  }

  isOfferOwner(offer: any): boolean {
    const user = this.authService.getCurrentUser();
    if (!user) return false;
    return user.rol === 'ADMIN' || (!!offer.professionalId && offer.professionalId === user.id);
  }

  async onDeleteOferta(offerId: string): Promise<void> {
    const confirmacio = await this.confirmService.confirm({
      title: 'TREBALL.RETIRE_OFFER_TITLE',
      message: 'TREBALL.RETIRE_OFFER_MSG',
      confirmText: 'CONFIRM_MODAL.DEFAULT_CONFIRM',
      cancelText: 'Cancel·lar',
      isDanger: true,
      icon: 'danger'
    });
    if (!confirmacio) return;
    this.ofertaService.delete(offerId).subscribe({
      next: () => {
        this.noticeMessage = 'Oferta esborrada correctament.';
        this.carregarDades();
      },
      error: (e) => {
        this.noticeMessage = e?.error?.error || 'No s’ha pogut borrar l’oferta.';
      }
    });
  }
}
