import { CommonModule } from '@angular/common';
import { Component, ElementRef, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router, RouterLink, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { DashboardResponse, DashboardService } from '../../services/dashboard.service';
import { OfertaService } from '../../services/oferta.service';
import { ResenyaService } from '../../services/resenya.service';
import { AuthService } from '../../core/services/auth.service';
import { Resenya } from '../../models/resenya.model';
import { ArticleService } from '../../services/article.service';
import { Article } from '../../models/article.model';
import { ConfirmService } from '../../core/services/confirm.service';
import { PwaService } from '../../core/services/pwa.service';
import { UsuariService } from '../../services/usuari.service';
import { Usuari, urlImatgePetita } from '../../models/usuari.model';
import { TranslationService } from '../../core/services/translation.service';

import { TranslatePipe } from '../../core/pipes/translate.pipe';

/**
 * Component Principal de la Pàgina d'Inici d'AVISA (/).
 * Ofereix:
 * 1. Portada immersiva a pantalla completa amb imatge fixa de fons, títol 'AVISA' i eslògan.
 * 2. Tauler de categories amb accés ràpid per gremis.
 * 3. Mostra d'ofertes i tasques destacades amb estadístiques reals.
 * 4. Secció editorial / Blog amb articles tècnics i consells pràctics del sector local.
 * 5. Crida a l'acció tant per a clients particulars com per a professionals autònoms.
 */
@Component({
  selector: 'app-main',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslatePipe],
  templateUrl: './main.component.html',
  styleUrl: './main.component.css'
})
export class MainComponent implements OnInit, OnDestroy {
  dashboard?: DashboardResponse;
  loading = true;
  error = '';
  noticeMessage = '';
  private routerEventsSub?: Subscription;

  randomPreviewTasks: any[] = [];
  randomPreviewOffers: any[] = [];

  allResenyes: Resenya[] = [];
  ressenyesDestacades: Resenya[] = [];
  allUsuaris: Usuari[] = [];
  modalContacteOferta: any | null = null;
  peticioExitDades: {
    tascaId?: string;
    titol: string;
    professional: string;
    preu: string;
  } | null = null;

  @ViewChild('proCarouselTrack') proCarouselTrack?: ElementRef<HTMLDivElement>;

  /** Determina si la ruta actual correspon a la secció exclusiva de l'app mòbil (/app) */
  get isAppPage(): boolean {
    const url = this.router.url || '';
    return url.startsWith('/app');
  }

  /**
   * Retorna la ruta adaptada a l'entorn actiu (/app per a l'aplicació o ruta estàndard per a web)
   */
  getNavUrl(path: string): string {
    if (this.isAppPage) {
      if (path === '/' || path === '/inici' || path === '/app') return '/app';
      if (path.startsWith('/app/')) return path;
      return path.startsWith('/') ? `/app${path}` : `/app/${path}`;
    }
    return path;
  }

  /** Determina si s'ha de mostrar la portada inicial immersiva (fullscreen-cover) amb el lliscador */
  get showFullscreenCover(): boolean {
    const url = this.router.url || '';
    if (url.includes('landing=true')) return true;
    return false;
  }

  /** Llista de professionals oficialment verificats a la plataforma */
  get verifiedProfessionals(): Usuari[] {
    const pros = this.allUsuaris.filter(u => u.rol === 'PROFESSIONAL' && u.verificat);
    if (pros.length > 0) return pros;
    return this.allUsuaris.filter(u => u.rol === 'PROFESSIONAL');
  }

  /** Index del professional actiu mostrat en gran al carrusel Twitch */
  currentProIndex = 0;
  proCarouselInterval?: any;
  private proTransitionTimeout?: ReturnType<typeof setTimeout>;
  isProCarouselPaused = false;
  isProCarouselTransitioning = false;

  /** Retorna el professional actiu mostrat en gran al centre */
  get currentPro(): Usuari | null {
    const list = this.verifiedProfessionals;
    if (list.length === 0) return null;
    return list[((this.currentProIndex % list.length) + list.length) % list.length];
  }

  /** Retorna el professional anterior per a la previsualització lateral esquerra */
  get prevPro(): Usuari | null {
    const list = this.verifiedProfessionals;
    if (list.length <= 1) return null;
    const prevIdx = (this.currentProIndex - 1 + list.length) % list.length;
    return list[prevIdx];
  }

  /** Retorna el professional següent per a la previsualització lateral dreta */
  get nextPro(): Usuari | null {
    const list = this.verifiedProfessionals;
    if (list.length <= 1) return null;
    const nextIdx = (this.currentProIndex + 1) % list.length;
    return list[nextIdx];
  }

  /** Avança al següent professional (rotació Twitch) */
  goToNextPro(): void {
    const list = this.verifiedProfessionals;
    if (list.length <= 1) return;
    this.seleccionarProfessional((this.currentProIndex + 1) % list.length);
    this.restartProCarouselTimer();
  }

  /** Retrocedeix al professional anterior (rotació Twitch) */
  goToPrevPro(): void {
    const list = this.verifiedProfessionals;
    if (list.length <= 1) return;
    this.seleccionarProfessional((this.currentProIndex - 1 + list.length) % list.length);
    this.restartProCarouselTimer();
  }

  /** Salta directament a un professional determinat pels indicadors de posició */
  goToProIndex(idx: number): void {
    this.seleccionarProfessional(idx);
    this.restartProCarouselTimer();
  }

  /** Actualitza la targeta destacada i reinicia l'animació visual del carrusel. */
  private seleccionarProfessional(idx: number): void {
    this.isProCarouselTransitioning = false;
    if (this.proTransitionTimeout) clearTimeout(this.proTransitionTimeout);
    this.currentProIndex = idx;
    this.proTransitionTimeout = setTimeout(() => {
      this.isProCarouselTransitioning = true;
    });
  }

  /** Inicia el temporitzador de rotació automàtica cada 5 segons fora de la zona d'Angular */
  startProCarouselTimer(): void {
    this.stopProCarouselTimer();
    this.ngZone.runOutsideAngular(() => {
      this.proCarouselInterval = setInterval(() => {
        if (typeof document !== 'undefined' && document.hidden) {
          return;
        }
        if (!this.isProCarouselPaused && this.verifiedProfessionals.length > 1) {
          this.ngZone.run(() => {
            this.seleccionarProfessional((this.currentProIndex + 1) % this.verifiedProfessionals.length);
          });
        }
      }, 5000);
    });
  }

  /** Atura el temporitzador per evitar fugues de memòria */
  stopProCarouselTimer(): void {
    if (this.proCarouselInterval) {
      clearInterval(this.proCarouselInterval);
      this.proCarouselInterval = undefined;
    }
  }

  /** Reinicia el compte enrere quan l'usuari interactua manualment */
  restartProCarouselTimer(): void {
    this.startProCarouselTimer();
  }

  /** Posa en pausa la rotació quan el cursor entra sobre el carrusel */
  pauseProCarousel(): void {
    this.isProCarouselPaused = true;
  }

  /** Reprèn la rotació automàtica quan el cursor surt de la secció */
  resumeProCarousel(): void {
    this.isProCarouselPaused = false;
  }

  /** Obté el logotip o la foto de perfil, en la versió petita (128 px): els avatars de la portada són xicotets */
  getProFotoPerfil(pro: any): string | null {
    if (!pro) return null;
    return urlImatgePetita(pro.logoUrl || pro.fotoUrl);
  }

  /** Imatge de fons del banner principal del professional destacat */
  getProMainBackground(pro: any): string {
    const bg: string | null = null;
    if (bg) {
      return `url('${bg}')`;
    }
    return 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)';
  }

  /** Imatge de fons amb degradat fosc per a les previsualitzacions laterals */
  getProSideBackground(pro: any): string {
    const bg: string | null = null;
    if (bg) {
      return `linear-gradient(180deg, rgba(15, 23, 42, 0.45) 0%, rgba(15, 23, 42, 0.88) 100%), url('${bg}')`;
    }
    return 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)';
  }

  /** Retorna el fons degradat + fotografia assignada per a la targeta del professional recomanat */
  getProCardBackground(pro: any): string {
    const bg: string | null = null;
    if (!bg) return '';
    return `linear-gradient(180deg, rgba(15, 23, 42, 0.72) 0%, rgba(15, 23, 42, 0.90) 100%), url('${bg}')`;
  }

  /** Genera el logo representatiu de l'empresa / professional amb inicials i paleta corporativa */
  getCompanyLogo(pro: Usuari): { initial: string; bg: string; color: string } {
    const nom = (pro.nom || 'P').replace(/\(.*?\)/g, '').trim();
    const parts = nom.split(/\s+/).filter(Boolean);
    const initial = parts.length >= 2
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : nom.substring(0, 2).toUpperCase();

    const palettes = [
      { bg: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)', color: '#ffffff' },
      { bg: 'linear-gradient(135deg, #065f46 0%, #10b981 100%)', color: '#ffffff' },
      { bg: 'linear-gradient(135deg, #7c2d12 0%, #ea580c 100%)', color: '#ffffff' },
      { bg: 'linear-gradient(135deg, #4c1d95 0%, #8b5cf6 100%)', color: '#ffffff' },
      { bg: 'linear-gradient(135deg, #0f766e 0%, #14b8a6 100%)', color: '#ffffff' },
      { bg: 'linear-gradient(135deg, #831843 0%, #ec4899 100%)', color: '#ffffff' }
    ];

    let hash = 0;
    for (let i = 0; i < nom.length; i++) hash = nom.charCodeAt(i) + ((hash << 5) - hash);
    const p = palettes[Math.abs(hash) % palettes.length];

    return { initial, bg: p.bg, color: p.color };
  }

  /** Obté l'especialitat o gremi principal a partir del nom o biografia */
  getProSpeciality(pro: Usuari): string {
    const nom = pro.nom || '';
    const match = nom.match(/\((.*?)\)/);
    if (match && match[1]) {
      return match[1];
    }
    const bio = (pro.bio || '').toLowerCase();
    if (bio.includes('lampist') || bio.includes('canonad')) return 'Lampisteria';
    if (bio.includes('electr')) return 'Electricitat';
    if (bio.includes('pint')) return 'Pintura & Decoració';
    if (bio.includes('clima') || bio.includes('aerot')) return 'Climatització';
    if (bio.includes('fust')) return 'Fusteria';
    return 'Professional Verificat';
  }

  constructor(
    private readonly dashboardService: DashboardService,
    private readonly ofertaService: OfertaService,
    private readonly resenyaService: ResenyaService,
    private readonly usuariService: UsuariService,
    public readonly authService: AuthService,
    private readonly articleService: ArticleService,
    private readonly confirmService: ConfirmService,
    private readonly router: Router,
    public readonly pwaService: PwaService,
    private readonly translationService: TranslationService,
    private readonly ngZone: NgZone
  ) {
    this.routerEventsSub = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.generarPrevisualitzacionsAleatories();
      }
    });
  }

  ngOnDestroy(): void {
    if (this.routerEventsSub) {
      this.routerEventsSub.unsubscribe();
    }
    this.stopProCarouselTimer();
    if (this.proTransitionTimeout) clearTimeout(this.proTransitionTimeout);
  }

  ngOnInit(): void {
    this.loadDashboard();
    this.loadResenyes();
    this.loadUsuaris();
  }

  loadUsuaris(): void {
    this.usuariService.getProfessionals().subscribe({
      next: (users) => {
        this.allUsuaris = users ?? [];
        this.startProCarouselTimer();
      },
      error: () => {}
    });
  }

  loadDashboard(): void {
    this.dashboardService.getDashboard().subscribe({
      next: (dashboard) => {
        this.dashboard = dashboard;
        this.loading = false;
        this.generarPrevisualitzacionsAleatories();
      },
      error: () => {
        this.error = 'No s’ha pogut carregar el dashboard del backend.';
        this.loading = false;
      }
    });
  }

  loadResenyes(): void {
    this.resenyaService.getAll().subscribe({
      next: (res) => {
        this.allResenyes = res ?? [];
        this.ressenyesDestacades = this.barrejarArray([...this.allResenyes]).slice(0, 6);
      },
      error: () => {}
    });
  }

  getRatingInfo(pro: Usuari | string): { mitjana: string; total: number } | null {
    if (!pro) return null;
    const nom = typeof pro === 'string' ? pro : (pro.nom || '');
    const id = typeof pro === 'string' ? '' : (pro.id || '');
    const qNom = nom.toLowerCase().trim();
    const qId = id.toLowerCase().trim();

    const list = this.allResenyes.filter(
      (r) =>
        (r.treballadorNom && (r.treballadorNom.toLowerCase().trim() === qNom || (qId && r.treballadorNom.toLowerCase().trim() === qId))) ||
        (r.treballadorId && (r.treballadorId.toLowerCase().trim() === qId || (qNom && r.treballadorId.toLowerCase().trim() === qNom)))
    );
    if (list.length === 0) {
      if (typeof pro !== 'string' && pro.verificat) {
        return { mitjana: '5.0', total: 1 };
      }
      return null;
    }
    const avg = list.reduce((a, b) => a + b.puntuacio, 0) / list.length;
    return {
      mitjana: avg.toFixed(1),
      total: list.length
    };
  }

  /** Genera previsualitzacions aleatòries perquè no surtin sempre les mateixes 3 */
  generarPrevisualitzacionsAleatories(): void {
    const allTasks = [...this.tasks];
    this.randomPreviewTasks = this.barrejarArray(allTasks).slice(0, 1);

    const allOffers = [...this.offers];
    this.randomPreviewOffers = this.barrejarArray(allOffers).slice(0, 1);
  }

  private barrejarArray<T>(array: T[]): T[] {
    const copia = [...array];
    for (let i = copia.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copia[i], copia[j]] = [copia[j], copia[i]];
    }
    return copia;
  }

  get tasks() {
    const rawIncidencies = (this.dashboard?.incidencies ?? [])
      .filter((inc) => {
        const estat = (inc.estat || '').toLowerCase().trim();
        return !estat || estat === 'oberta' || estat === 'pendent';
      })
      .map((inc) => ({
        id: inc.id,
        title: inc.titol,
        client: inc.clientNom || (inc as any).client || '',
        category: inc.categoria?.trim() ? inc.categoria.trim() : 'Altres Serveis',
        budget: inc.budget,
        status: inc.estat || 'Oberta'
      }));

    const rawTasks = (this.dashboard?.tasks ?? [])
      .filter((task) => (task.tipus === 'incidencia' || !task.professional) && (task.estat || '').toLowerCase() === 'oberta' && task.tipus !== 'oferta' && !rawIncidencies.some(i => i.id === task.id))
      .map((task) => ({
        id: task.id,
        title: task.titol,
        client: task.client,
        category: task.categoria?.trim() ? task.categoria.trim() : 'Altres Serveis',
        budget: task.budget,
        status: task.estat
      }));

    const map = new Map<string, any>();
    for (const t of [...rawIncidencies, ...rawTasks]) {
      if (t && t.id && !map.has(t.id)) {
        map.set(t.id, t);
      }
    }
    return Array.from(map.values());
  }

  get offers() {
    const rawOffers = this.dashboard?.offers.map((offer) => {
      const associatedTask = this.dashboard?.tasks.find((task) => task.id === offer.tascaId);
      const rawCat = (offer as any).categoria || associatedTask?.categoria;
      const category = (rawCat && rawCat.trim()) ? rawCat.trim() : 'Altres Serveis';
      return {
        id: offer.id,
        professional: offer.professional,
        task: associatedTask?.titol ?? offer.tascaId,
        category,
        price: offer.price,
        note: offer.note,
        status: offer.estat
      };
    }) ?? [];

    const map = new Map<string, any>();
    for (const o of rawOffers) {
      if (o && o.id && !map.has(o.id)) {
        map.set(o.id, o);
      }
    }
    return Array.from(map.values());
  }

  /** Articles informatius del blog gestionats a través d'ArticleService */
  get articlesBlog(): Article[] {
    return this.articleService.getArticles();
  }

  /** Retorna la vista prèvia aleatòria de tasques (desactivada en favor del tauler net) */
  get previewTasks() {
    return [];
  }

  /** Retorna la vista prèvia d'ofertes (desactivada en favor del tauler net) */
  get previewOffers() {
    return [];
  }

  /** Retorna el nom de l'usuari connectat per a la salutació */
  getUserName(): string {
    const user = this.authService.getCurrentUser();
    if (!user) return 'usuari';
    if (user.nom && user.nom.trim()) {
      return user.nom.trim();
    }
    if (user.email) {
      return user.email.split('@')[0];
    }
    return 'usuari';
  }

  getTaskStatusClass(status: string): string {
    return status.toLowerCase().replace(/\s+/g, '-');
  }

  getOfferStatusClass(status: string): string {
    return status.toLowerCase();
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
    if (offer.task && offer.task !== 'standalone') {
      return 'Pressupost per a: ' + offer.task;
    }
    if (offer.category && offer.category !== 'Altres Serveis') {
      return 'Servei de ' + offer.category;
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
    if (!this.requireLogin('publicar una incidència', '/client/crear-tasca')) return;
    this.router.navigate([this.getNavUrl('/client/crear-tasca')]);
  }

  onNovaOferta(): void {
    if (!this.requireLogin('publicar una oferta professional', '/professional/crear-oferta')) return;
    this.router.navigate([this.getNavUrl('/professional/crear-oferta')]);
  }

  onNavegarTasquesOfertes(tipus: 'tots' | 'tasques' | 'ofertes' | 'incidencies' = 'tots'): void {
    if (tipus !== 'tots') {
      this.router.navigate([this.getNavUrl('/tasques-ofertes')], { queryParams: { tipus } });
    } else {
      this.router.navigate([this.getNavUrl('/tasques-ofertes')]);
    }
  }

  onVeureTotesTasques(): void {
    this.onNavegarTasquesOfertes('tasques');
  }

  onDetallTasca(taskId: string): void {
    if (!this.requireLogin(`veure el detall de la tasca ${taskId}`, `/tasca-detall/${taskId}`)) return;
    this.router.navigate([this.getNavUrl('/tasca-detall'), taskId]);
  }

  onFerOferta(taskId: string): void {
    this.router.navigate([this.getNavUrl('/tasques-ofertes')], { queryParams: { taskId } });
  }

  onVeureTotesOfertes(): void {
    this.onNavegarTasquesOfertes('ofertes');
  }

  /**
   * Envia la petició d'interès per una oferta des de la portada i, un cop confirmada a l'app, mostra l'opció de contactar.
   */
  async onInteressatOferta(offer: any): Promise<void> {
    const pro = offer.professional || 'aquest professional';
    if (!this.requireLogin(`sol·licitar el servei de ${pro}`, '/')) return;
    if (!this.authService.isClient()) {
      this.noticeMessage = 'Només els comptes amb rol de "Client" poden sol·licitar ofertes de serveis.';
      return;
    }

    const currentUserName = this.authService.getCurrentUser()?.nom || 'Client';
    const titol = this.getOfertaTitol(offer);
    const preu = offer.price || '';

    const confirmacio = await this.confirmService.confirm({
      title: this.translationService.t('TASQUES_OFERTES.CONFIRM_INTERES_TITLE'),
      message: this.translationService.t('TREBALL.SOL_CONFIRM_MSG', { pro, titol, preu }),
      confirmText: this.translationService.t('TASQUES_OFERTES.CONFIRM_INTERES_BTN'),
      cancelText: this.translationService.t('COMMON.CANCEL_LAR'),
      icon: 'question'
    });
    if (!confirmacio) return;

    this.ofertaService.contractar(offer.id, currentUserName).subscribe({
      next: (tasca) => {
        this.peticioExitDades = {
          tascaId: tasca?.id,
          titol,
          professional: pro,
          preu
        };
        this.noticeMessage = this.translationService.t('TREBALL.SOL_BANNER', { pro });
        this.loadDashboard();
      },
      error: () => {
        this.noticeMessage = `No s'ha pogut processar la petició de l'oferta.`;
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

  getProfessionalUser(proNom: string): Usuari | undefined {
    if (!proNom) return undefined;
    const q = proNom.toLowerCase().trim();
    return this.allUsuaris.find((u) => {
      const uNom = (u.nom || '').toLowerCase().trim();
      const uId = (u.id || '').toLowerCase().trim();
      return uNom === q || uId === q || (uNom && q && (uNom.includes(q) || q.includes(uNom)));
    });
  }

  getProfessionalIdentifier(proNom: string): string {
    const user = this.getProfessionalUser(proNom);
    return user ? user.id : proNom;
  }





  onPublicarOferta(): void {
    this.router.navigate([this.getNavUrl('/tasques-ofertes')], { queryParams: { tipus: 'ofertes', accio: 'crear-oferta' } });
  }

 

  /**
   * Fa lliscar la pantalla suaument cap a la secció de contingut
   */
  scrollToContent(): void {
    const scrollTarget = window.innerHeight - 44;
    window.scrollTo({
      top: scrollTarget,
      behavior: 'smooth'
    });
  }

  obrirArticle(article: any): void {
    if (article?.id) {
      this.router.navigate([this.getNavUrl('/article'), article.id]);
    }
  }

  onAnarRegistreClient(): void {
    this.router.navigate(['/registre'], { queryParams: { rol: 'CLIENT' } });
  }

  onAnarRegistreProfessional(): void {
    this.router.navigate(['/registre'], { queryParams: { rol: 'PROFESSIONAL' } });
  }

  /**
   * Tanca la sessió actual des del tauler d'inici i redirigeix al login
   */
  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/login'], { queryParams: { message: 'Sessió tancada correctament.' } });
  }
}

