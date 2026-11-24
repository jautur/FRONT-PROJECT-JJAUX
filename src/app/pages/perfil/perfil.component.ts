import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { FORMATS_IMATGE, MAX_BYTES_IMATGE, TipusImatge, Usuari } from '../../models/usuari.model';
import { UsuariService } from '../../services/usuari.service';
import { AuthService } from '../../core/services/auth.service';
import { Tasca } from '../../models/tasca.model';
import { TascaService } from '../../services/tasca.service';
import { Oferta } from '../../models/oferta.model';
import { OfertaService } from '../../services/oferta.service';
import { IncidenciaService } from '../../services/incidencia.service';
import { TranslationService } from '../../core/services/translation.service';
import { ConfirmService } from '../../core/services/confirm.service';
import { PressupostService } from '../../services/pressupost.service';
import { TranslatePipe } from '../../core/pipes/translate.pipe';
import { ResenyaService } from '../../services/resenya.service';
import { Resenya } from '../../models/resenya.model';

/**
 * Component de Perfil d'Usuari (/perfil).
 * Permet a l'usuari autenticat:
 * 1. Consultar la seva informació actual (nom, correu, rol, telèfon, biografia).
 * 2. Navegar per les seves dades personals, tasques, pressupostos/ofertes i ressenyes.
 * 3. Editar i desar canvis a la base de dades PostgreSQL mitjançant UsuariService.
 * 4. Canviar la seva contrasenya d'accés de forma segura.
 * 5. Visualitzar l'historial complet de feines i valoracions de clients.
 */
@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TranslatePipe],
  templateUrl: './perfil.component.html',
  styleUrl: './perfil.component.css'
})
export class PerfilComponent implements OnInit {
  /** Dades de l'usuari actual */
  usuari: Usuari | null = null;

  /** Camps del formulari d'edició del perfil */
  formData: { nom: string; telefon: string; bio: string; percentil: number } = {
    nom: '',
    telefon: '',
    bio: '',
    percentil: 3
  };

  /** Camps del formulari de canvi de contrasenya */
  passwordData = {
    newPassword: '',
    confirmPassword: ''
  };

  /** Estats de càrrega per a les peticions */
  saving = false;
  changingPassword = false;

  /** Missatges informatius per a l'usuari */
  successMessage = '';
  errorMessage = '';

  /** Indica si s'està visualitzant el propi perfil (editable) o el d'un altre usuari (públic) */
  isOwnProfile = true;

  /** Pestanya activa del perfil: 'dades' | 'tasques' | 'pressupostos' | 'ressenyes' */
  activeTab: 'dades' | 'tasques' | 'pressupostos' | 'ressenyes' = 'dades';

  /** Filtre actiu per a les tasques de l'usuari */
  filtreTasques: 'totes' | 'oberta' | 'en_curs' | 'finalitzada' = 'totes';

  /** Llistat complet de tasques i peticions vinculades a l'usuari */
  tasquesUsuari: Tasca[] = [];

  /** Llistat complet de pressupostos i ofertes vinculades a l'usuari */
  ofertesUsuari: Oferta[] = [];

  /** Indicador de càrrega de dades de pestanyes */
  loadingTabData = false;

  /** Llistat de tasques finalitzades associades a l'usuari (les quals actuen com a valoracions públiques) */
  tasquesFinalitzades: Tasca[] = [];

  /** Nombre total de valoracions rebudes */
  totalValoracions = 0;

  /** Puntuació mitjana de les valoracions (1 a 5) */
  mitjanaPuntuacio: string | null = null;

  constructor(
    private readonly authService: AuthService,
    private readonly usuariService: UsuariService,
    private readonly tascaService: TascaService,
    private readonly ofertaService: OfertaService,
    private readonly pressupostService: PressupostService,
    private readonly incidenciaService: IncidenciaService,
    private readonly resenyaService: ResenyaService,
    private readonly confirmService: ConfirmService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    public readonly translationService: TranslationService
  ) {}

  get isAppPage(): boolean {
    const url = this.router.url || '';
    return url.startsWith('/app');
  }

  goBack(): void {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      window.history.back();
    } else {
      this.router.navigate([this.getNavUrl('/tasques-ofertes')]);
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
   * Tanca la sessió actual de l'usuari i redirigeix al formulari d'inici de sessió.
   */
  tancarSessio(): void {
    this.authService.logout();
    this.router.navigate(['/login'], { queryParams: { message: 'Sessió tancada correctament.' } });
  }

  /**
   * Comprova si l'usuari connectat és administrador.
   */
  get isAdmin(): boolean {
    const cur = this.authService.getCurrentUser();
    return cur?.rol === 'ADMIN';
  }

  /**
   * Calcula el valor de comissió normalitzat per a la simulació en pantalla.
   */
  getCommissionSimulation(): number {
    const p = Number(this.formData.percentil);
    if (isNaN(p) || p < 0) return 0;
    if (p > 100) return 100;
    return Math.round(p * 10) / 10;
  }

  get canViewTasquesTab(): boolean {
    // Si s'accedeix al perfil d'un altre usuari, NO es mostra MAI l'apartat tasques.
    // Només el propi usuari connectat té accés a la pestanya de les seues tasques personals.
    return this.isOwnProfile;
  }

  /**
   * Cicle de vida OnInit:
   * Comprova l'autenticació, sincronitza pestanya activa de la URL i carrega les dades actuals des de PostgreSQL.
   */
  ngOnInit(): void {
    this.route.queryParamMap.subscribe((qp) => {
      const tab = qp.get('tab');
      if (tab && ['dades', 'tasques', 'pressupostos', 'ressenyes'].includes(tab)) {
        if (tab === 'tasques' && !this.canViewTasquesTab) {
          this.activeTab = (this.usuari?.rol === 'PROFESSIONAL') ? 'pressupostos' : 'dades';
        } else {
          this.activeTab = tab as any;
        }
      }
    });

    this.route.paramMap.subscribe((params) => {
      const targetId = params.get('id');
      const currentUser = this.authService.getCurrentUser();

      if (targetId) {
        const isSelf = !!currentUser && (
          currentUser.id === targetId ||
          (!!currentUser.nom && currentUser.nom.toLowerCase() === targetId.toLowerCase())
        );
        this.isOwnProfile = isSelf;

        if (!this.isOwnProfile && (!this.activeTab || this.activeTab === 'tasques')) {
          this.activeTab = 'dades';
        }

        if (this.isOwnProfile && currentUser) {
          this.usuari = currentUser;
          this.formData.nom = currentUser.nom || '';
          this.formData.telefon = currentUser.telefon || '';
          this.formData.bio = currentUser.bio || '';
          this.formData.percentil = currentUser.percentil ?? 3;
        }

        this.carregarPerfilUsuari(targetId);
      } else {
        if (!currentUser) {
          this.router.navigate(['/login']);
          return;
        }
        this.isOwnProfile = true;
        this.usuari = currentUser;
        this.formData.nom = currentUser.nom || '';
        this.formData.telefon = currentUser.telefon || '';
        this.formData.bio = currentUser.bio || '';
        this.formData.percentil = currentUser.percentil ?? 3;
        this.carregarPerfilUsuari(currentUser.id);
      }
    });
  }

  private carregarPerfilUsuari(userId: string): void {
    // Sense sessió només es pot veure el perfil públic d'un professional
    const perfil$ = this.authService.isLoggedIn() ? this.usuariService.getById(userId) : this.usuariService.getProfessional(userId);
    perfil$.subscribe({
      next: (freshUser) => {
        if (freshUser) {
          this.usuari = freshUser;
          if (this.isOwnProfile) {
            this.formData.nom = freshUser.nom || '';
            this.formData.telefon = freshUser.telefon || '';
            this.formData.bio = freshUser.bio || '';
            this.formData.percentil = freshUser.percentil ?? 3;
            this.authService.setCurrentUser(freshUser);
          } else {
            if (freshUser.rol === 'PROFESSIONAL') {
              if (!this.activeTab || this.activeTab === 'tasques') {
                this.activeTab = 'pressupostos';
              }
            } else {
              if (this.activeTab === 'tasques') {
                this.activeTab = 'dades';
              }
            }
          }
          this.carregarDadesCompletasPerfil(freshUser);
        }
      },
      error: () => {
        if (this.isOwnProfile && this.usuari) {
          this.carregarDadesCompletasPerfil(this.usuari);
        }
      }
    });
  }

  /**
   * Carrega de manera integral les tasques, incidències obertes, ofertes i valoracions de l'usuari.
   */
  private carregarDadesCompletasPerfil(user: Usuari): void {
    this.loadingTabData = true;
    const userNom = user.nom || '';
    const userId = user.id || '';

    forkJoin({
      // GET /api/tasks només dona les tasques pròpies, i demana sessió
      allTasks: (this.isOwnProfile ? this.tascaService.getAll() : of([] as Tasca[])).pipe(catchError(() => of([] as Tasca[]))),
      ressenyes: (this.isOwnProfile ? of([] as Resenya[])
        : user.rol === 'PROFESSIONAL' ? this.resenyaService.getByTreballador(userId) : this.resenyaService.getByClient(userId)
      ).pipe(catchError(() => of([] as Resenya[]))),
      clientIncidencies: (userId ? this.incidenciaService.getByClient(userId) : of([])).pipe(catchError(() => of([]))),
      allOffers: this.ofertaService.getAll().pipe(catchError(() => of([])))
    }).subscribe({
      next: ({ allTasks, clientIncidencies, allOffers, ressenyes }) => {
        this.loadingTabData = false;

        // 1. Tasques de l'usuari (on és client o professional assignat)
        const userTasks = (allTasks ?? []).filter(t => t.clientId === userId || t.professionalId === userId);

        // Mapejar incidències obertes que no tinguin encara tasca acordada
        const existingTaskIds = new Set(userTasks.map(t => t.id));
        const mappedIncidencies: Tasca[] = (clientIncidencies ?? [])
          .filter(inc => !existingTaskIds.has(inc.id))
          .map(inc => ({
            id: inc.id,
            titol: inc.titol,
            descripcio: inc.descripcio,
            categoria: inc.categoria,
            clientId: inc.clientId,
            client: inc.clientNom || inc.client || userNom,
            clientNom: inc.clientNom || inc.client || userNom,
            budget: inc.budget,
            estat: inc.estat || 'Oberta',
            tipus: 'incidencia',
            createdAt: inc.createdAt
          }));

        const combinedTasks = [...userTasks, ...mappedIncidencies];
        this.tasquesUsuari = this.isOwnProfile ? combinedTasks : [];

        // 2. Tasques finalitzades amb valoració. D'un altre usuari, les seues ressenyes públiques
        this.tasquesFinalitzades = this.isOwnProfile
          ? combinedTasks.filter(t => t.estat === 'Finalitzada' || (t.valoracio != null && t.valoracio > 0))
          : ressenyes.map(r => ({
              id: r.tascaId || r.id,
              titol: '',
              clientId: r.clientId,
              client: r.clientNom,
              clientNom: r.clientNom,
              estat: 'Finalitzada',
              valoracio: r.puntuacio,
              comentari: r.descripcio
            } as Tasca));
        const rated = this.tasquesFinalitzades.filter(t => t.valoracio != null && t.valoracio > 0);
        this.totalValoracions = rated.length;
        if (rated.length > 0) {
          const sum = rated.reduce((acc, curr) => acc + (curr.valoracio || 0), 0);
          this.mitjanaPuntuacio = (sum / rated.length).toFixed(1);
        } else {
          this.mitjanaPuntuacio = null;
        }

        // 3. Ofertes públiques associades a l'usuari (els pressupostos privats no es barregen amb ofertes)
        this.ofertesUsuari = (allOffers ?? []).filter(o => o.professionalId === userId);
      },
      error: () => {
        this.loadingTabData = false;
        this.tasquesUsuari = [];
        this.ofertesUsuari = [];
        this.tasquesFinalitzades = [];
        this.totalValoracions = 0;
        this.mitjanaPuntuacio = null;
      }
    });
  }

  /**
   * Canvia la pestanya activa del perfil i actualitza el paràmetre de consulta de la URL.
   */
  setTab(tab: 'dades' | 'tasques' | 'pressupostos' | 'ressenyes'): void {
    if (tab === 'tasques' && !this.canViewTasquesTab) {
      tab = (this.usuari?.rol === 'PROFESSIONAL') ? 'pressupostos' : 'dades';
    }
    this.activeTab = tab;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tab },
      queryParamsHandling: 'merge'
    });
  }

  /**
   * Defineix el filtre d'estat de les tasques.
   */
  setFiltreTasques(f: 'totes' | 'oberta' | 'en_curs' | 'finalitzada'): void {
    this.filtreTasques = f;
  }

  /**
   * Retorna les tasques filtrades segons la pestanya de filtre seleccionada.
   */
  get tasquesFiltrades(): Tasca[] {
    if (this.filtreTasques === 'oberta') {
      return this.tasquesUsuari.filter(t => (t.estat || '').toLowerCase().includes('obert') || t.tipus === 'incidencia');
    }
    if (this.filtreTasques === 'en_curs') {
      return this.tasquesUsuari.filter(t => t.estat === 'En curs' || t.estat === 'En revisió');
    }
    if (this.filtreTasques === 'finalitzada') {
      return this.tasquesUsuari.filter(t => (t.estat || '').toLowerCase().includes('finalitzad'));
    }
    return this.tasquesUsuari;
  }

  countTasquesObertes(): number {
    return this.tasquesUsuari.filter(t => (t.estat || '').toLowerCase().includes('obert') || t.tipus === 'incidencia').length;
  }

  countTasquesEnCurs(): number {
    return this.tasquesUsuari.filter(t => t.estat === 'En curs' || t.estat === 'En revisió').length;
  }

  countTasquesFinalitzades(): number {
    return this.tasquesUsuari.filter(t => (t.estat || '').toLowerCase().includes('finalitzad')).length;
  }

  /**
   * Retorna la classe CSS identificativa de l'estat d'una tasca.
   */
  getTaskEstatClass(estat?: string): string {
    const s = (estat || '').toLowerCase();
    if (s.includes('obert')) return 'estat-oberta';
    if (s.includes('curs')) return 'estat-en-curs';
    if (s.includes('finalitzad')) return 'estat-finalitzada';
    return 'estat-default';
  }

  /**
   * Obté la inicial de l'usuari per dibuixar l'avatar.
   */
  get userInitial(): string {
    return this.usuari?.nom ? this.usuari.nom.charAt(0).toUpperCase() : 'U';
  }

  get usuariFotoPerfil(): string | null {
    if (!this.usuari) return null;
    return this.usuari?.fotoUrl || null;
  }

  /** Imatge que s'està pujant ara mateix (desactiva els botons fins que acabe) */
  pujantImatge: TipusImatge | null = null;

  /** Menú Canviar / Treure obert (el del llapis de la foto o el del logotip) */
  menuImatge: TipusImatge | null = null;

  toggleMenuImatge(tipus: TipusImatge): void {
    this.menuImatge = this.menuImatge === tipus ? null : tipus;
  }

  tancarMenuImatge(): void {
    this.menuImatge = null;
  }

  /** Un clic fora del menú o Escape el tanquen */
  @HostListener('document:click')
  @HostListener('document:keydown.escape')
  onFora(): void {
    this.menuImatge = null;
  }

  /**
   * Puja la foto o el logotip triat. Es comproven format i mida per avisar de seguida,
   * però qui decideix és el servidor (reconeix el format pel contingut).
   */
  onTriarImatge(event: Event, tipus: TipusImatge): void {
    const input = event.target as HTMLInputElement;
    const fitxer = input.files?.[0];
    input.value = '';
    this.menuImatge = null;
    if (!fitxer || !this.usuari || this.pujantImatge) return;

    this.clearAlerts();
    if (fitxer.type && !FORMATS_IMATGE.includes(fitxer.type)) {
      this.errorMessage = 'ERRORS.IMG_FORMAT';
      return;
    }
    if (fitxer.size > MAX_BYTES_IMATGE) {
      this.errorMessage = 'ERRORS.IMG_TOO_BIG';
      return;
    }

    this.pujantImatge = tipus;
    this.usuariService.pujarImatge(this.usuari.id, tipus, fitxer).subscribe({
      next: (resposta) => {
        this.pujantImatge = null;
        this.actualitzarImatge(tipus, resposta.url);
        this.successMessage = this.translationService.t('PERFIL.IMG_SAVED');
      },
      error: (err) => {
        this.pujantImatge = null;
        this.errorMessage = this.missatgeErrorImatge(err);
      }
    });
  }

  /** Lleva la foto o el logotip (el mateix usuari, o un administrador per moderar). */
  async onTreureImatge(tipus: TipusImatge): Promise<void> {
    this.menuImatge = null;
    if (!this.usuari || this.pujantImatge) return;
    if (!(await this.confirmService.confirm('PERFIL.IMG_REMOVE_CONFIRM'))) return;

    this.clearAlerts();
    this.pujantImatge = tipus;
    this.usuariService.esborrarImatge(this.usuari.id, tipus).subscribe({
      next: () => {
        this.pujantImatge = null;
        this.actualitzarImatge(tipus, null);
        this.successMessage = this.translationService.t('PERFIL.IMG_REMOVED');
      },
      error: (err) => {
        this.pujantImatge = null;
        this.errorMessage = this.missatgeErrorImatge(err);
      }
    });
  }

  private actualitzarImatge(tipus: TipusImatge, url: string | null): void {
    if (!this.usuari) return;
    const camp = tipus === 'foto' ? 'fotoUrl' : 'logoUrl';
    this.usuari = { ...this.usuari, [camp]: url ?? undefined };
    if (this.isOwnProfile) {
      this.authService.setCurrentUser(this.usuari);
    }
  }

  private missatgeErrorImatge(err: any): string {
    if (err?.status === 413) return 'ERRORS.IMG_TOO_BIG';
    if (err?.status === 400) return 'ERRORS.IMG_FORMAT';
    return err?.error?.error || err?.error?.message || 'ERRORS.IMG_UPLOAD_ERROR';
  }

  /**
   * Guarda els canvis del formulari de perfil al backend PostgreSQL.
   */
  onSaveProfile(): void {
    if (!this.usuari) return;

    if (this.usuari.rol === 'PROFESSIONAL' && (!this.formData.telefon || !this.formData.telefon.trim())) {
      this.errorMessage = 'ERRORS.PRO_PHONE_REQUIRED';
      return;
    }

    const p = Number(this.formData.percentil);
    if (isNaN(p) || p < 0 || p > 100) {
      this.errorMessage = 'ERRORS.PERCENTILE_RANGE';
      return;
    }

    const currentPercentil = this.usuari.percentil ?? 3;
    if (!this.isAdmin && p < currentPercentil) {
      this.errorMessage = `Com a usuari només pots augmentar el teu percentil (mínim actual: ${currentPercentil}%). Per reduir-lo, cal intervenció d'un administrador.`;
      return;
    }

    this.saving = true;
    this.clearAlerts();

    const updatedData: Partial<Usuari> = {
      nom: this.formData.nom,
      telefon: this.formData.telefon,
      bio: this.formData.bio,
      percentil: Math.round(p)
    };

    this.usuariService.updateProfile(this.usuari.id, updatedData).subscribe({
      next: (savedUser) => {
        this.saving = false;
        this.usuari = savedUser;
        this.formData.percentil = savedUser.percentil ?? 3;
        this.authService.setCurrentUser(savedUser);
        this.successMessage = 'Les dades del teu perfil s’han desat correctament a la base de dades.';
      },
      error: (err) => {
        this.saving = false;
        const msg = err?.error?.message || err?.error?.error;
        this.errorMessage = msg || 'ERRORS.PROFILE_SAVE_ERROR';
      }
    });
  }

  /**
   * Canvia la contrasenya de l'usuari a la base de dades.
   */
  onChangePassword(): void {
    if (!this.usuari) return;

    this.clearAlerts();

    if (this.passwordData.newPassword.length < 6) {
      this.errorMessage = 'ERRORS.PASS_MIN_LENGTH';
      return;
    }

    if (this.passwordData.newPassword !== this.passwordData.confirmPassword) {
      this.errorMessage = 'ERRORS.PASS_MISMATCH';
      return;
    }

    this.changingPassword = true;

    this.usuariService.changePassword(this.usuari.id, this.passwordData.newPassword).subscribe({
      next: () => {
        this.changingPassword = false;
        this.successMessage = 'La contrasenya s’ha canviat satisfactòriament.';
        this.passwordData.newPassword = '';
        this.passwordData.confirmPassword = '';
      },
      error: () => {
        this.changingPassword = false;
        this.errorMessage = 'ERRORS.PASS_UPDATE_ERROR';
      }
    });
  }

  /** Estat de la petició de sol·licitud de verificació */
  sollicitantVerificacio = false;
  processantVerificacioAdmin = false;

  getVerifStatusClass(): string {
    if (this.usuari?.verificat) return 'status-verified';
    if (this.usuari?.sollicitudVerificacio) return 'status-pending';
    return 'status-unverified';
  }

  getVerifStatusLabel(): string {
    if (this.usuari?.verificat) return this.translationService.t('PERFIL.STATUS_OFFICIALLY_VERIFIED');
    if (this.usuari?.sollicitudVerificacio) return this.translationService.t('PERFIL.STATUS_CALL_PENDING');
    return this.translationService.t('PERFIL.STATUS_NOT_VERIFIED');
  }

  getVerifDescription(): string {
    if (this.usuari?.verificat) {
      return this.translationService.t('PERFIL.VERIF_OFFICIAL_DESC');
    }
    if (this.usuari?.sollicitudVerificacio) {
      return this.translationService.t('PERFIL.VERIF_PENDING_DESC');
    }
    return this.translationService.t('PERFIL.GUARANTEE_DESC');
  }

  getPublicVerifDescription(): string {
    if (this.usuari?.verificat) {
      return this.translationService.t('PERFIL.VERIF_OFFICIAL_DESC');
    }
    return this.translationService.t('PERFIL.GUARANTEE_DESC');
  }

  onSollicitarVerificacio(): void {
    if (!this.usuari) return;
    if (!this.usuari.telefon || !this.usuari.telefon.trim()) {
      this.errorMessage = 'ERRORS.VERIFY_PHONE_REQUIRED';
      return;
    }
    this.sollicitantVerificacio = true;
    this.clearAlerts();
    this.usuariService.sollicitarVerificacio(this.usuari.id).subscribe({
      next: (updatedUser) => {
        this.sollicitantVerificacio = false;
        this.usuari = updatedUser;
        if (this.isOwnProfile) {
          this.authService.setCurrentUser(updatedUser);
        }
        this.successMessage = 'Sol·licitud de verificació enviada correctament! L\'administrador es posarà en contacte amb tu via trucada telefònica.';
      },
      error: (err) => {
        this.sollicitantVerificacio = false;
        const msg = err?.error?.message || 'Error en sol·licitar la verificació.';
        this.errorMessage = msg;
      }
    });
  }

  onVerificarProfessional(estat: boolean): void {
    if (!this.usuari) return;
    this.processantVerificacioAdmin = true;
    this.clearAlerts();
    this.usuariService.verificarProfessional(this.usuari.id, estat).subscribe({
      next: (updatedUser) => {
        this.processantVerificacioAdmin = false;
        this.usuari = updatedUser;
        if (this.isOwnProfile) {
          this.authService.setCurrentUser(updatedUser);
        }
        this.successMessage = estat
          ? 'El professional ha estat verificat oficialment després de la comprovació telefònica.'
          : 'L\'estat de verificació ha estat actualitzat.';
      },
      error: (err) => {
        this.processantVerificacioAdmin = false;
        const msg = err?.error?.message || 'Error en verificar el professional.';
        this.errorMessage = msg;
      }
    });
  }

  /**
   * Neteja els missatges d'alerta previs.
   */
  private clearAlerts(): void {
    this.successMessage = '';
    this.errorMessage = '';
  }

  /**
   * Obre directament WhatsApp amb un missatge preconfigurat dirigit al professional.
   */
  contactarPerfilWhatsapp(): void {
    if (!this.usuari?.telefon) return;
    const cleanPhone = this.usuari.telefon.replace(/\D/g, '');
    const phoneWithCountry = cleanPhone.length === 9 ? '34' + cleanPhone : cleanPhone;
    const clientUser = this.authService.getCurrentUser();
    const clientNom = clientUser ? clientUser.nom : 'un client interessat';
    const msg = `Hola ${this.usuari.nom}, t'he trobat a AVISA. Sóc ${clientNom}. M'agradaria consultar-te sobre els teus serveis professionals.`;
    const url = `https://wa.me/${phoneWithCountry}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  /**
   * Obre el gestor de correu del client amb un assumpte i cos dirigits al professional.
   */
  contactarPerfilEmail(): void {
    if (!this.usuari?.email) return;
    const clientUser = this.authService.getCurrentUser();
    const clientNom = clientUser ? clientUser.nom : 'Client interessat';
    const subject = `Contacte a través d'AVISA: Serveis professionals`;
    const body = `Hola ${this.usuari.nom},\n\nM'he posat en contacte amb tu després de veure el teu perfil professional a AVISA.\n\nM'agradaria demanar-te informació i disponibilitat per a una feina.\n\nSalutacions cordials,\n${clientNom}`;
    window.location.href = `mailto:${this.usuari.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }



}

