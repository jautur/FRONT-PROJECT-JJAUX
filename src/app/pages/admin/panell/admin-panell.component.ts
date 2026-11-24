import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TascaService } from '../../../services/tasca.service';
import { OfertaService } from '../../../services/oferta.service';
import { IncidenciaService } from '../../../services/incidencia.service';
import { UsuariService } from '../../../services/usuari.service';
import { AvisService } from '../../../services/avis.service';
import { BlacklistService } from '../../../services/blacklist.service';
import { PressupostService } from '../../../services/pressupost.service';
import { ResenyaService } from '../../../services/resenya.service';
import { Tasca } from '../../../models/tasca.model';
import { Oferta } from '../../../models/oferta.model';
import { Incidencia } from '../../../models/incidencia.model';
import { Usuari } from '../../../models/usuari.model';
import { BlacklistTelefon } from '../../../models/blacklist.model';
import { Pressupost } from '../../../models/pressupost.model';
import { Resenya } from '../../../models/resenya.model';
import { Avis } from '../../../models/avis.model';
import { AuthService } from '../../../core/services/auth.service';
import { ConfirmService } from '../../../core/services/confirm.service';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';
import { AdminCancellacionsComponent } from '../cancellacions/admin-cancellacions.component';

/**
 * Pestanya activa al panell d'administració.
 */
type AdminTab = 'tasques' | 'ofertes' | 'incidencies' | 'pressupostos' | 'usuaris' | 'blacklist' | 'resenyes' | 'avisos' | 'cancellacions';

/**
 * Component del Panell d'Administració Global (/admin/panell).
 * Accessible exclusivament per a usuaris amb rol d'administrador (`admin`, com `admin@admin`).
 * Proporciona:
 * 1. Resum i mètriques globals del sistema (usuaris, tasques, ofertes, avisos).
 * 2. Llistat complet i auditable de totes les tasques de la plataforma amb cerca i filtres.
 * 3. Llistat complet de totes les ofertes i propostes econòmiques presentades.
 * 4. Gestió d'usuaris registrats i visualització de rols.
 * 5. Accions administratives de moderació (finalitzar tasques, acceptar/rebutjar ofertes, eliminar elements).
 */
@Component({
  selector: 'app-admin-panell',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TranslatePipe, AdminCancellacionsComponent],
  templateUrl: './admin-panell.component.html',
  styleUrl: './admin-panell.component.css'
})
export class AdminPanellComponent implements OnInit {
  /** Llista de totes les tasques de la plataforma */
  tasques: Tasca[] = [];
  /** Llista de totes les ofertes i pressupostos presentats */
  ofertes: Oferta[] = [];
  /** Llista de totes les incidències registrades */
  incidencies: Incidencia[] = [];
  /** Llista de tots els usuaris donats d'alta */
  usuaris: Usuari[] = [];
  /** Llista de tots els pressupostos privats per a incidències */
  pressupostos: Pressupost[] = [];
  /** Llista de totes les ressenyes registrades */
  resenyes: Resenya[] = [];
  /** Llista de tots els avisos i notificacions */
  avisos: Avis[] = [];
  /** Total de notificacions i avisos */
  totalAvisos = 0;
  /** Llista de tots els telèfons a la llista negra */
  blacklist: BlacklistTelefon[] = [];

  /** Pestanya actual seleccionada */
  tabActiva: AdminTab = 'tasques';

  /** Criteris de cerca i filtres */
  searchTasca = '';
  filtreEstatTasca = 'tots';

  searchOferta = '';

  searchIncidencia = '';

  searchPressupost = '';

  searchResenya = '';

  searchAvis = '';
  nouAvis = { destinatariId: '', missatge: '', enllac: '' };
  enviantAvis = false;

  searchUsuari = '';
  filtreRolUsuari = 'tots';

  searchBlacklist = '';
  nouTelefonBlacklist = '';
  nouMotiuBlacklist = '';
  afegintBlacklist = false;

  /** Estat de càrrega */
  loading = true;
  /** Missatges informatius */
  successMsg = '';
  errorMsg = '';

  /** Estat del modal d'assignació de nova contrasenya (l'administrador no necessita la contrasenya antiga) */
  modalPasswordObert = false;
  usuariSeleccionat: Usuari | null = null;
  novaContrasenya = '';
  confirmarContrasenya = '';
  mostrarPassword = false;
  savingPassword = false;
  errorModalPassword = '';

  constructor(
    private readonly tascaService: TascaService,
    private readonly ofertaService: OfertaService,
    private readonly pressupostService: PressupostService,
    private readonly incidenciaService: IncidenciaService,
    private readonly usuariService: UsuariService,
    private readonly avisService: AvisService,
    private readonly resenyaService: ResenyaService,
    private readonly blacklistService: BlacklistService,
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
   * Cicle de vida inicial del component: obté totes les dades del backend.
   */
  ngOnInit(): void {
    this.carregarDades();
  }

  /**
   * Carrega en paral·lel totes les tasques, ofertes, incidències, usuaris i avisos de PostgreSQL.
   */
  carregarDades(): void {
    this.loading = true;
    this.errorMsg = '';

    this.tascaService.getAll().subscribe({
      next: (t) => this.tasques = t,
      error: () => this.errorMsg = 'Error en carregar les tasques.'
    });

    this.ofertaService.getAll().subscribe({
      next: (o) => this.ofertes = o,
      error: () => this.errorMsg = 'Error en carregar les ofertes.'
    });

    this.incidenciaService.getAll().subscribe({
      next: (i) => this.incidencies = i,
      error: () => this.errorMsg = 'Error en carregar les incidències.'
    });

    this.pressupostService.getAll().subscribe({
      next: (p) => this.pressupostos = p,
      error: () => {}
    });

    this.resenyaService.getAll().subscribe({
      next: (r) => this.resenyes = r,
      error: () => {}
    });

    this.usuariService.getAll().subscribe({
      next: (u) => {
        this.usuaris = u;
        this.loading = false;
      },
      error: () => {
        this.errorMsg = 'Error en carregar els usuaris.';
        this.loading = false;
      }
    });

    this.avisService.getAll().subscribe({
      next: (a) => {
        this.avisos = a;
        this.totalAvisos = a.length;
      },
      error: () => {
        this.avisos = [];
        this.totalAvisos = 0;
      }
    });

    this.blacklistService.getAll().subscribe({
      next: (bl) => this.blacklist = bl,
      error: () => this.blacklist = []
    });
  }

  /**
   * Canvia la pestanya de supervisió activa.
   * @param tab Nova pestanya seleccionada
   */
  canviarTab(tab: AdminTab): void {
    this.tabActiva = tab;
  }

  /**
   * Filtra les tasques segons el text de cerca i l'estat seleccionat.
   */
  get tasquesFiltrades(): Tasca[] {
    return this.tasques.filter(t => {
      const clientName = t.clientNom || t.client || '';
      const matchSearch =
        !this.searchTasca ||
        t.titol?.toLowerCase().includes(this.searchTasca.toLowerCase()) ||
        clientName.toLowerCase().includes(this.searchTasca.toLowerCase()) ||
        t.descripcio?.toLowerCase().includes(this.searchTasca.toLowerCase()) ||
        t.categoria?.toLowerCase().includes(this.searchTasca.toLowerCase());

      const matchEstat =
        this.filtreEstatTasca === 'tots' ||
        t.estat?.toLowerCase().includes(this.filtreEstatTasca);

      return matchSearch && matchEstat;
    });
  }

  /**
   * Filtra les ofertes segons el text de cerca i l'estat seleccionat.
   */
  get ofertesFiltrades(): Oferta[] {
    return this.ofertes.filter(o => {
      const proName = o.professionalNom || o.professional || '';
      return (
        !this.searchOferta ||
        proName.toLowerCase().includes(this.searchOferta.toLowerCase()) ||
        o.tascaId?.toLowerCase().includes(this.searchOferta.toLowerCase()) ||
        o.note?.toLowerCase().includes(this.searchOferta.toLowerCase()) ||
        o.price?.toLowerCase().includes(this.searchOferta.toLowerCase())
      );
    });
  }

  /**
   * Filtra les incidències segons el text de cerca (sense filtre d'estat ja que les incidències no tenen estat).
   */
  get incidenciesFiltrades(): Incidencia[] {
    return this.incidencies.filter(i => {
      const clientName = i.clientNom || i.client || '';
      return (
        !this.searchIncidencia ||
        i.titol?.toLowerCase().includes(this.searchIncidencia.toLowerCase()) ||
        clientName.toLowerCase().includes(this.searchIncidencia.toLowerCase()) ||
        i.descripcio?.toLowerCase().includes(this.searchIncidencia.toLowerCase()) ||
        i.categoria?.toLowerCase().includes(this.searchIncidencia.toLowerCase())
      );
    });
  }

  /**
   * Filtra els usuaris segons el text de cerca i el rol seleccionat.
   */
  get usuarisFiltrats(): Usuari[] {
    return this.usuaris.filter(u => {
      const matchSearch =
        !this.searchUsuari ||
        u.nom?.toLowerCase().includes(this.searchUsuari.toLowerCase()) ||
        u.email?.toLowerCase().includes(this.searchUsuari.toLowerCase()) ||
        u.telefon?.toLowerCase().includes(this.searchUsuari.toLowerCase());

      const matchRol =
        this.filtreRolUsuari === 'tots' ||
        u.rol === this.filtreRolUsuari;

      return matchSearch && matchRol;
    });
  }

  /**
   * Acció d'administrador: finalitza una tasca canviant el seu estat a 'Finalitzada'.
   * @param id Identificador de la tasca
   */
  async finalitzarTasca(id: string): Promise<void> {
    const confirmacio = await this.confirmService.confirm({
      title: 'Finalitzar Tasca (Admin)',
      message: `Com a Administrador, segur que vols marcar la tasca ${id} com a finalitzada?`,
      confirmText: 'Finalitzar Tasca',
      cancelText: 'Cancel·lar',
      icon: 'question'
    });
    if (!confirmacio) return;

    this.tascaService.complete(id).subscribe({
      next: () => {
        this.successMsg = `Tasca ${id} finalitzada amb èxit!`;
        const t = this.tasques.find(x => x.id === id);
        if (t) t.estat = 'Finalitzada';
        setTimeout(() => this.successMsg = '', 3500);
      },
      error: () => this.errorMsg = 'Error en finalitzar la tasca.'
    });
  }



  /**
   * Acció d'administrador: elimina/borra una oferta concreta.
   * Les ofertes no tenen estat: s'accepten o es borren.
   * @param offerId Identificador de l'oferta
   */
  async eliminarOferta(offerId: string): Promise<void> {
    const confirmacio = await this.confirmService.confirm({
      title: 'CONFIRM_MODAL.DELETE_OFFER_TITLE',
      message: 'CONFIRM_MODAL.DELETE_OFFER_MSG',
      confirmText: 'CONFIRM_MODAL.DEFAULT_CONFIRM',
      cancelText: 'CONFIRM_MODAL.DEFAULT_CANCEL',
      isDanger: true,
      icon: 'danger'
    });
    if (!confirmacio) return;

    this.ofertaService.delete(offerId).subscribe({
      next: () => {
        this.ofertes = this.ofertes.filter(x => x.id !== offerId);
        this.successMsg = `Oferta ${offerId} borrada correctament.`;
        setTimeout(() => this.successMsg = '', 3500);
      },
      error: () => this.errorMsg = 'Error en borrar l’oferta.'
    });
  }

  /**
   * Acció d'administrador: elimina definitivament una incidència del sistema.
   * Les incidències no tenen estat: o es mantenen actives o es borren / passen a tasca.
   * @param id Identificador de la incidència
   */
  async eliminarIncidencia(id: string): Promise<void> {
    const confirmacio = await this.confirmService.confirm({
      title: 'CONFIRM_MODAL.DELETE_TASK_TITLE',
      message: 'CONFIRM_MODAL.DELETE_TASK_MSG',
      confirmText: 'CONFIRM_MODAL.DEFAULT_CONFIRM',
      cancelText: 'CONFIRM_MODAL.DEFAULT_CANCEL',
      isDanger: true,
      icon: 'danger'
    });
    if (!confirmacio) return;

    this.incidenciaService.delete(id).subscribe({
      next: () => {
        this.incidencies = this.incidencies.filter(x => x.id !== id);
        this.successMsg = `Incidència ${id} eliminada correctament.`;
        setTimeout(() => this.successMsg = '', 3500);
      },
      error: () => this.errorMsg = 'Error en eliminar la incidència.'
    });
  }

  /**
   * Filtra els pressupostos segons el terme de cerca de l'administrador.
   */
  get pressupostosFiltrats(): Pressupost[] {
    if (!this.searchPressupost.trim()) return this.pressupostos;
    const q = this.searchPressupost.toLowerCase();
    return this.pressupostos.filter(p =>
      p.id?.toLowerCase().includes(q) ||
      p.incidenciaId?.toLowerCase().includes(q) ||
      p.incidenciaTitol?.toLowerCase().includes(q) ||
      p.professionalNom?.toLowerCase().includes(q) ||
      p.descripcio?.toLowerCase().includes(q) ||
      p.preu?.toLowerCase().includes(q)
    );
  }

  /**
   * Acció d'administrador: elimina definitivament un pressupost privat del sistema.
   * @param id Identificador del pressupost
   */
  async eliminarPressupost(id: string): Promise<void> {
    const confirmacio = await this.confirmService.confirm({
      title: 'CONFIRM_MODAL.DELETE_OFFER_TITLE',
      message: `Com a Administrador, segur que vols eliminar el pressupost ${id}? Aquesta acció és irreversible.`,
      confirmText: 'CONFIRM_MODAL.DEFAULT_CONFIRM',
      cancelText: 'CONFIRM_MODAL.DEFAULT_CANCEL',
      isDanger: true,
      icon: 'danger'
    });
    if (!confirmacio) return;

    this.pressupostService.reject(id).subscribe({
      next: () => {
        this.pressupostos = this.pressupostos.filter(x => x.id !== id);
        this.successMsg = `Pressupost ${id} eliminat correctament.`;
        setTimeout(() => this.successMsg = '', 3500);
      },
      error: () => this.errorMsg = 'Error en eliminar el pressupost.'
    });
  }

  /**
   * Filtra les ressenyes segons el text de cerca de l'administrador.
   */
  get resenyesFiltrades(): Resenya[] {
    if (!this.searchResenya.trim()) return this.resenyes;
    const q = this.searchResenya.toLowerCase();
    return this.resenyes.filter(r => {
      const client = r.clientNom || r.clientId || '';
      const treballador = r.treballadorNom || r.treballadorId || '';
      return (
        r.id?.toLowerCase().includes(q) ||
        client.toLowerCase().includes(q) ||
        treballador.toLowerCase().includes(q) ||
        r.descripcio?.toLowerCase().includes(q) ||
        r.tascaId?.toLowerCase().includes(q)
      );
    });
  }

  /**
   * Calcula la puntuació mitjana de totes les valoracions de la plataforma.
   */
  mitjanaRessenyes(): string {
    if (!this.resenyes || this.resenyes.length === 0) return '0.0';
    const sum = this.resenyes.reduce((acc, curr) => acc + (curr.puntuacio || 0), 0);
    return (sum / this.resenyes.length).toFixed(1);
  }

  /**
   * Filtra les notificacions i avisos segons el text de cerca.
   */
  get avisosFiltrats(): Avis[] {
    if (!this.searchAvis.trim()) return this.avisos;
    const q = this.searchAvis.toLowerCase();
    return this.avisos.filter(a =>
      a.id?.toLowerCase().includes(q) ||
      a.destinatariId?.toLowerCase().includes(q) ||
      a.missatge?.toLowerCase().includes(q) ||
      a.enllac?.toLowerCase().includes(q)
    );
  }

  /**
   * Prepara el formulari per enviar un avís personalitzat a un usuari des de la taula d'usuaris.
   * @param u Usuari seleccionat
   */
  prepararAvisUsuari(u: Usuari): void {
    this.tabActiva = 'avisos';
    this.nouAvis.destinatariId = u.id;
    this.nouAvis.missatge = `Notificació de l'Administració per a ${u.nom}: `;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /**
   * Envia una nova notificació del sistema a un usuari des del formulari administratiu.
   */
  enviarNouAvis(): void {
    if (!this.nouAvis.destinatariId || !this.nouAvis.missatge.trim()) return;

    this.enviantAvis = true;
    this.avisService.create({
      destinatariId: this.nouAvis.destinatariId,
      missatge: this.nouAvis.missatge.trim(),
      enllac: this.nouAvis.enllac.trim() || undefined,
      llegit: false,
      data: new Date().toISOString()
    }).subscribe({
      next: (creat) => {
        this.enviantAvis = false;
        this.avisos = [creat, ...this.avisos];
        this.totalAvisos = this.avisos.length;
        this.nouAvis = { destinatariId: '', missatge: '', enllac: '' };
        this.successMsg = 'Notificació enviada correctament!';
        setTimeout(() => this.successMsg = '', 4000);
      },
      error: () => {
        this.enviantAvis = false;
        this.errorMsg = "Error en enviar l'avís.";
        setTimeout(() => this.errorMsg = '', 4000);
      }
    });
  }

  /**
   * Elimina un avís del sistema com a administrador.
   * @param id Identificador de l'avís
   */
  async eliminarAvis(id: string): Promise<void> {
    const confirmacio = await this.confirmService.confirm({
      title: 'CONFIRM_MODAL.DELETE_TASK_TITLE',
      message: `Vols eliminar definitivament aquesta notificació (${id})?`,
      confirmText: 'CONFIRM_MODAL.DEFAULT_CONFIRM',
      cancelText: 'CONFIRM_MODAL.DEFAULT_CANCEL',
      isDanger: true,
      icon: 'danger'
    });
    if (!confirmacio) return;

    this.avisService.delete(id).subscribe({
      next: () => {
        this.avisos = this.avisos.filter(x => x.id !== id);
        this.totalAvisos = this.avisos.length;
        this.successMsg = 'Notificació eliminada correctament.';
        setTimeout(() => this.successMsg = '', 3500);
      },
      error: () => this.errorMsg = "Error en eliminar la notificació."
    });
  }

  /**
   * Filtra ràpidament tasques per estat des del recomptador de dalt.
   */
  filtrarPerEstatTasca(estat: string, event?: Event): void {
    if (event) event.stopPropagation();
    this.tabActiva = 'tasques';
    this.filtreEstatTasca = estat;
  }

  /**
   * Filtra ràpidament usuaris per rol des del recomptador de dalt.
   */
  filtrarPerRolUsuari(rol: string, event?: Event): void {
    if (event) event.stopPropagation();
    this.tabActiva = 'usuaris';
    this.filtreRolUsuari = rol;
  }

  /** Recompte d'usuaris amb rol client */
  countClients(): number {
    return this.usuaris.filter(u => u.rol === 'CLIENT').length;
  }

  /** Recompte d'usuaris amb rol professional */
  countProfessionals(): number {
    return this.usuaris.filter(u => u.rol === 'PROFESSIONAL').length;
  }

  /** Recompte de tasques finalitzades */
  countTasquesFinalitzades(): number {
    return this.tasques.filter(t => t.estat?.toLowerCase().includes('finalitzad')).length;
  }

  /** Recompte de tasques en estat obert */
  countTasquesObertes(): number {
    return this.tasques.filter(t => t.estat?.toLowerCase().includes('obert')).length;
  }

  /** Recompte de tasques en curs */
  countTasquesEnCurs(): number {
    return this.tasques.filter(t => t.estat?.toLowerCase().includes('curs')).length;
  }

  /** Recompte d'ofertes acceptades */
  countOfertesAcceptades(): number {
    return this.ofertes.filter(o => o.estat?.toLowerCase().includes('accept')).length;
  }

  /** Retorna classe CSS segons l'estat de la tasca */
  getEstatTascaClass(estat: string): string {
    const e = estat?.toLowerCase() || '';
    if (e.includes('obert')) return 'badge-oberta';
    if (e.includes('curs')) return 'badge-en-curs';
    if (e.includes('finalitzad')) return 'badge-finalitzada';
    return '';
  }

  /** Retorna classe CSS segons l'estat de l'oferta */
  getEstatOfertaClass(estat: string): string {
    const e = estat?.toLowerCase() || '';
    if (e.includes('pend')) return 'badge-pendent';
    if (e.includes('accept')) return 'badge-acceptada';
    if (e.includes('rebutj')) return 'badge-rebutjada';
    return '';
  }

  /**
   * Obre el formulari modal perquè l'administrador assigne una nova contrasenya.
   * Privilegi d'administrador: no cal conèixer ni veure la contrasenya antiga.
   * @param u Usuari seleccionat
   */
  obrirModalPassword(u: Usuari): void {
    this.usuariSeleccionat = u;
    this.novaContrasenya = '';
    this.confirmarContrasenya = '';
    this.mostrarPassword = false;
    this.errorModalPassword = '';
    this.modalPasswordObert = true;
  }

  /**
   * Tanca el formulari modal de contrasenya.
   */
  tancarModalPassword(): void {
    this.modalPasswordObert = false;
    this.usuariSeleccionat = null;
    this.novaContrasenya = '';
    this.confirmarContrasenya = '';
    this.errorModalPassword = '';
  }

  /**
   * Envia la nova contrasenya al backend per a actualitzar la base de dades directament.
   */
  guardarNovaPassword(): void {
    if (!this.usuariSeleccionat) return;
    this.errorModalPassword = '';

    if (!this.novaContrasenya || this.novaContrasenya.trim().length < 6) {
      this.errorModalPassword = 'La nova contrasenya ha de tenir com a mínim 6 caràcters.';
      return;
    }

    if (this.novaContrasenya !== this.confirmarContrasenya) {
      this.errorModalPassword = 'Les dues contrasenyes introduïdes no coincideixen.';
      return;
    }

    this.savingPassword = true;
    const userId = this.usuariSeleccionat.id;
    const userNom = this.usuariSeleccionat.nom;

    this.authService.canviarContrasenya(userId, this.novaContrasenya.trim()).subscribe({
      next: () => {
        this.savingPassword = false;
        this.tancarModalPassword();
        this.successMsg = `S'ha assignat la nova contrasenya a ${userNom} correctament!`;
        setTimeout(() => this.successMsg = '', 4500);
      },
      error: (err) => {
        this.savingPassword = false;
        this.errorModalPassword = typeof err?.error === 'string' ? err.error : 'Error en actualitzar la contrasenya.';
      }
    });
  }

  /**
   * Acció d'administrador: elimina definitivament un usuari del sistema.
   * Protegeix el compte d'administrador principal contra eliminació accidental.
   * @param u Usuari seleccionat per a ser donat de baixa
   */
  async eliminarUsuari(u: Usuari): Promise<void> {
    if (u.rol === 'ADMIN') {
      this.confirmService.alert("No es pot eliminar el compte d'administrador principal del sistema.", "Acció no permesa");
      return;
    }

    const confirmMsg = `ATENCIÓ: Vols eliminar definitivament l'usuari "${u.nom}" (${u.email})?\n\n` +
      `Es cancel·larà el seu accés i s'esborraran els seus avisos associats.\n` +
      `Aquesta acció no es pot desfer. Vols continuar?`;

    const confirmacio = await this.confirmService.confirm({
      title: 'CONFIRM_MODAL.DELETE_TASK_TITLE',
      message: confirmMsg,
      confirmText: 'CONFIRM_MODAL.DEFAULT_CONFIRM',
      cancelText: 'CONFIRM_MODAL.DEFAULT_CANCEL',
      isDanger: true,
      icon: 'danger'
    });
    if (!confirmacio) return;

    this.usuariService.delete(u.id).subscribe({
      next: () => {
        this.usuaris = this.usuaris.filter(x => x.id !== u.id);
        this.successMsg = `L'usuari "${u.nom}" (${u.email}) ha estat eliminat correctament.`;
        setTimeout(() => this.successMsg = '', 4500);
      },
      error: () => {
        this.errorMsg = `Error en eliminar l'usuari "${u.nom}". Comprova els permisos del servidor.`;
        setTimeout(() => this.errorMsg = '', 4500);
      }
    });
  }

  // ==========================================
  // MÈTODES DE GESTIÓ DE LA LLISTA NEGRA (BLACKLIST)
  // ==========================================

  /**
   * Filtra els telèfons de la llista negra segons el text de cerca introduït.
   */
  get blacklistFiltrada(): BlacklistTelefon[] {
    if (!this.searchBlacklist.trim()) return this.blacklist;
    const q = this.searchBlacklist.toLowerCase();
    return this.blacklist.filter(b =>
      b.telefon?.toLowerCase().includes(q) ||
      b.motiu?.toLowerCase().includes(q) ||
      b.bloquejatPer?.toLowerCase().includes(q) ||
      b.id?.toLowerCase().includes(q)
    );
  }

  /**
   * Comprova ràpidament si un número de telèfon està bloquejat a la llista negra.
   */
  isTelefonBloquejat(telefon: string | undefined): boolean {
    if (!telefon) return false;
    const clean = telefon.trim();
    const digits = clean.replace(/[^0-9]/g, '');
    const normDigits = digits.startsWith('0034')
      ? digits.slice(4)
      : (digits.startsWith('34') && digits.length >= 11 ? digits.slice(2) : digits);

    return this.blacklist.some(b => {
      if (!b.telefon) return false;
      const bClean = b.telefon.trim();
      if (bClean.toLowerCase() === clean.toLowerCase()) return true;
      const bDigits = bClean.replace(/[^0-9]/g, '');
      const bNorm = bDigits.startsWith('0034')
        ? bDigits.slice(4)
        : (bDigits.startsWith('34') && bDigits.length >= 11 ? bDigits.slice(2) : bDigits);
      return normDigits.length > 0 && bNorm === normDigits;
    });
  }

  /**
   * Afegeix un nou telèfon a la llista negra mitjançant el formulari administratiu.
   */
  afegirABlacklist(): void {
    const tel = this.nouTelefonBlacklist.trim();
    if (!tel) return;

    this.afegintBlacklist = true;
    this.blacklistService.add(tel, this.nouMotiuBlacklist.trim()).subscribe({
      next: (nou) => {
        this.afegintBlacklist = false;
        this.nouTelefonBlacklist = '';
        this.nouMotiuBlacklist = '';
        this.blacklist = [nou, ...this.blacklist];
        this.successMsg = `El telèfon ${nou.telefon} s'ha afegit a la llista negra correctament.`;
        setTimeout(() => this.successMsg = '', 4500);
      },
      error: (err) => {
        this.afegintBlacklist = false;
        this.errorMsg = err?.error?.message || 'Error en afegir el telèfon a la llista negra.';
        setTimeout(() => this.errorMsg = '', 4500);
      }
    });
  }

  /**
   * Elimina un registre de telèfon de la llista negra amb confirmació prèvia.
   */
  async eliminarDeBlacklist(bl: BlacklistTelefon): Promise<void> {
    const conf = await this.confirmService.confirm({
      title: 'ADMIN.BLACKLIST_BTN_UNBLOCK',
      message: `Vols desbloquejar el número de telèfon "${bl.telefon}" de la llista negra? L'usuari podrà tornar a utilitzar-lo a la plataforma.`,
      confirmText: 'ADMIN.BLACKLIST_BTN_UNBLOCK',
      cancelText: 'CONFIRM_MODAL.DEFAULT_CANCEL',
      isDanger: false,
      icon: 'question'
    });
    if (!conf) return;

    this.blacklistService.remove(bl.id).subscribe({
      next: () => {
        this.blacklist = this.blacklist.filter(b => b.id !== bl.id && b.telefon !== bl.telefon);
        this.successMsg = `El telèfon ${bl.telefon} ha estat desbloquejat amb èxit.`;
        setTimeout(() => this.successMsg = '', 4500);
      },
      error: (err) => {
        this.errorMsg = err?.error?.message || 'Error en desbloquejar el telèfon.';
        setTimeout(() => this.errorMsg = '', 4500);
      }
    });
  }

  /**
   * Acció ràpida per bloquejar el telèfon d'un usuari des del llistat d'usuaris.
   */
  async bloquejarTelefonUsuari(u: Usuari): Promise<void> {
    if (!u.telefon) return;
    const conf = await this.confirmService.confirm({
      title: 'ADMIN.BTN_BLOCK_PHONE',
      message: `Vols afegir el número de telèfon "${u.telefon}" de l'usuari "${u.nom}" a la llista negra?`,
      confirmText: 'ADMIN.BLACKLIST_ADD_BTN',
      cancelText: 'CONFIRM_MODAL.DEFAULT_CANCEL',
      isDanger: true,
      icon: 'danger'
    });
    if (!conf) return;

    this.blacklistService.add(u.telefon, `Compte d'usuari: ${u.nom} (${u.email})`).subscribe({
      next: (nou) => {
        this.blacklist = [nou, ...this.blacklist];
        this.successMsg = `El telèfon de ${u.nom} (${nou.telefon}) ha estat bloquejat a la llista negra.`;
        setTimeout(() => this.successMsg = '', 4500);
      },
      error: (err) => {
        this.errorMsg = err?.error?.message || 'Error en bloquejar el telèfon.';
        setTimeout(() => this.errorMsg = '', 4500);
      }
    });
  }

  /**
   * Desbloqueja un telèfon directament a partir del número.
   */
  async desbloquejarPerTelefon(telefon: string): Promise<void> {
    const item = this.blacklist.find(b => b.telefon === telefon);
    const idOrPhone = item ? item.id : telefon;

    const conf = await this.confirmService.confirm({
      title: 'ADMIN.BTN_UNBLOCK_PHONE',
      message: `Vols desbloquejar el número de telèfon "${telefon}" de la llista negra?`,
      confirmText: 'ADMIN.BLACKLIST_BTN_UNBLOCK',
      cancelText: 'CONFIRM_MODAL.DEFAULT_CANCEL',
      isDanger: false,
      icon: 'question'
    });
    if (!conf) return;

    this.blacklistService.remove(idOrPhone).subscribe({
      next: () => {
        this.blacklist = this.blacklist.filter(b => b.telefon !== telefon && b.id !== idOrPhone);
        this.successMsg = `El telèfon ${telefon} s'ha desbloquejat correctament.`;
        setTimeout(() => this.successMsg = '', 4500);
      },
      error: (err) => {
        this.errorMsg = err?.error?.message || 'Error en desbloquejar el telèfon.';
        setTimeout(() => this.errorMsg = '', 4500);
      }
    });
  }
}
