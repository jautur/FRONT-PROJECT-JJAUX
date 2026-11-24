import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AvisService } from '../../services/avis.service';
import { AuthService } from '../../core/services/auth.service';
import { TranslatePipe } from '../../core/pipes/translate.pipe';
import { Avis } from '../../models/avis.model';
import { EstatPush, PushService } from '../../core/services/push.service';

/**
 * Filtre actiu per al panell de notificacions.
 */
type FiltreAvisos = 'totes' | 'pendents' | 'llegides';

/**
 * Component del Panell de Notificacions i Avisos (/avisos).
 * Permet a l'usuari connectat:
 * - Visualitzar tots els seus avisos (pressupostos rebuts, acceptacions, etc.).
 * - Filtrar entre pendents i llegits.
 * - Marcar notificacions com a llegides individualment o en bloc.
 * - Eliminar notificacions que ja no necessita.
 */
@Component({
  selector: 'app-avisos',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslatePipe],
  templateUrl: './avisos.component.html',
  styleUrl: './avisos.component.css'
})
export class AvisosComponent implements OnInit {
  /** Llista de tots els avisos obtinguts de l'API */
  avisos: Avis[] = [];
  /** Filtre actiu seleccionat per l'usuari */
  filtreActiu: FiltreAvisos = 'totes';
  /** Estat de càrrega activa */
  loading = true;
  /** Missatge d'error si s'escau */
  errorMsg = '';
  /** Missatge d'èxit de l'última acció */
  successMsg = '';

  /** Estat de les notificacions push d'aquest dispositiu */
  estatPush: EstatPush = 'no-suportat';
  /** Mentre s'activa o es desactiva */
  pushOcupat = false;
  /** Clau (AVISOS_PAGE.*) del resultat de l'última acció de push, i si és un error */
  pushMsg = '';
  pushError = false;

  constructor(
    private readonly pushService: PushService,
    private readonly avisService: AvisService,
    private readonly authService: AuthService,
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

  /**
   * Navega a l'apartat corresponent a l'avís i el marca com a llegit si no ho estava.
   * @param a Notificació clicada
   */
  anarApartat(a: Avis): void {
    if (!a.llegit) {
      this.marcarLlegit(a.id);
    }
    const ruta = this.getDestinacioAvis(a);
    if (ruta) {
      this.router.navigateByUrl(this.getNavUrl(ruta));
    }
  }

  /**
   * Obté la ruta URL de destinació segons la informació de l'avís.
   * El botó sempre adreça a l'apartat personal: /professional/les-meves-ofertes o /client/les-meves-tasques.
   * @param a Notificació
   * @returns Ruta de navegació interna
   */
  getDestinacioAvis(a: Avis): string {
    const user = this.authService.getCurrentUser();
    const isProf = user?.rol === 'PROFESSIONAL';

    if (a.enllac && a.enllac.trim() !== '' && !a.enllac.includes('tasques-ofertes')) {
      return a.enllac;
    }

    const text = (a.missatge || '').toLowerCase();
    if (text.includes('perfil') || text.includes('comissió') || text.includes('percentil')) {
      return '/perfil';
    }

    // Apartat personal segons rol:
    return isProf ? '/professional/les-meves-ofertes' : '/client/les-meves-tasques';
  }

  /**
   * Obté el text indicatiu de la destinació de l'enllaç.
   * @param a Notificació
   * @returns Etiqueta de la destinació
   */
  getNomDestinacio(a: Avis): string {
    const ruta = this.getDestinacioAvis(a);
    if (ruta.includes('les-meves-tasques')) return 'Veure les meves incidències';
    if (ruta.includes('les-meves-ofertes')) return 'Veure les meves ofertes';
    if (ruta.includes('perfil')) return 'Anar al meu perfil';
    return 'Veure apartat personal';
  }

  /**
   * Obté la categoria visual per a l'avís.
   * @param a Notificació
   * @returns Categoria
   */
  getCategoriaAvis(a: Avis): string {
    const text = (a.missatge || '').toLowerCase();
    if (text.includes('pressupost')) return 'PRESSUPOST';
    if (text.includes('oferta') || text.includes('contractaci')) return 'OFERTA';
    if (text.includes('tasca') || text.includes('incidència') || text.includes('incidencia') || text.includes('treball')) return 'TASCA';
    if (text.includes('perfil') || text.includes('percentil') || text.includes('comissió') || text.includes('ressenya') || text.includes('resenya')) return 'PERFIL';
    return 'AVÍS';
  }

  /**
   * Retorna els colors de fons i text per a la categoria de l'avís.
   * @param a Notificació
   * @returns Objecte amb bg i color
   */
  getCategoryBadgeStyle(a: Avis): { bg: string; color: string } {
    const cat = this.getCategoriaAvis(a);
    switch (cat) {
      case 'PRESSUPOST':
        return { bg: '#fef3c7', color: '#b45309' };
      case 'OFERTA':
        return { bg: '#ecfdf5', color: '#047857' };
      case 'TASCA':
        return { bg: '#e0f2fe', color: '#0369a1' };
      case 'PERFIL':
        return { bg: '#ede9fe', color: '#6d28d9' };
      default:
        return { bg: '#f3f4f6', color: '#374151' };
    }
  }

  /**
   * Inicialització del component: carrega els avisos de l'usuari connectat.
   */
  ngOnInit(): void {
    this.carregarAvisos();
    void this.pushService.estat().then((estat) => (this.estatPush = estat));
  }

  /** Activa o desactiva les notificacions push d'aquest dispositiu. */
  async canviarPush(): Promise<void> {
    if (this.pushOcupat) return;
    this.pushOcupat = true;
    this.pushMsg = '';
    const volActivar = this.estatPush !== 'activat';
    this.estatPush = volActivar ? await this.pushService.activar() : await this.pushService.desactivar();
    this.pushOcupat = false;
    this.pushError = volActivar && this.estatPush !== 'activat';
    if (this.pushError) {
      this.pushMsg = this.estatPush === 'denegat' ? 'PUSH_DENIED' : this.estatPush === 'no-configurat' ? 'PUSH_NOT_CONFIGURED' : 'PUSH_ERROR';
    } else {
      this.pushMsg = volActivar ? 'PUSH_OK' : 'PUSH_OFF_OK';
    }
  }

  /**
   * Obté la quantitat d'avisos pendents de llegir.
   */
  get pendentsCount(): number {
    return this.avisos.filter(a => !a.llegit).length;
  }

  /**
   * Retorna la llista d'avisos segons el filtre actiu seleccionat.
   */
  get avisosFiltrats(): Avis[] {
    if (this.filtreActiu === 'pendents') {
      return this.avisos.filter(a => !a.llegit);
    }
    if (this.filtreActiu === 'llegides') {
      return this.avisos.filter(a => a.llegit);
    }
    return this.avisos;
  }

  /**
   * Carrega els avisos personals de l'usuari o tots si és un administrador.
   */
  carregarAvisos(): void {
    this.loading = true;
    this.errorMsg = '';
    const user = this.authService.getCurrentUser();

    if (user && user.id) {
      this.avisService.getByUsuari(user.id).subscribe({
        next: (data) => {
          this.avisos = data;
          this.loading = false;
        },
        error: (err) => {
          this.errorMsg = 'No s’han pogut carregar les notificacions.';
          this.loading = false;
        }
      });
    } else {
      this.avisService.getAll().subscribe({
        next: (data) => {
          this.avisos = data;
          this.loading = false;
        },
        error: (err) => {
          this.errorMsg = 'No s’han pogut carregar les notificacions.';
          this.loading = false;
        }
      });
    }
  }

  /**
   * Canvia el filtre actiu de visualització.
   * @param filtre Nou filtre a aplicar ('totes' | 'pendents' | 'llegides')
   */
  canviarFiltre(filtre: FiltreAvisos): void {
    this.filtreActiu = filtre;
  }

  /**
   * Marca una notificació com a llegida.
   * @param id Identificador de l'avís
   */
  marcarLlegit(id: string): void {
    this.avisService.markAsRead(id).subscribe({
      next: () => {
        const item = this.avisos.find(a => a.id === id);
        if (item) {
          item.llegit = true;
        }
      },
      error: () => {
        this.errorMsg = 'Error en marcar l’avís com a llegit.';
      }
    });
  }

  /**
   * Marca totes les notificacions pendents com a llegides.
   */
  marcarTotesLlegides(): void {
    const pendents = this.avisos.filter(a => !a.llegit);
    if (pendents.length === 0) return;

    let pendentsRestants = pendents.length;
    pendents.forEach(a => {
      this.avisService.markAsRead(a.id).subscribe({
        next: () => {
          a.llegit = true;
          pendentsRestants--;
          if (pendentsRestants === 0) {
            this.successMsg = 'Totes les notificacions s’han marcat com a llegides!';
            setTimeout(() => this.successMsg = '', 3000);
          }
        }
      });
    });
  }

  /**
   * Elimina un avís de la safata de notificacions.
   * @param id Identificador de l'avís a esborrar
   */
  eliminarAvis(id: string): void {
    this.avisService.delete(id).subscribe({
      next: () => {
        this.avisos = this.avisos.filter(a => a.id !== id);
        this.successMsg = 'Notificació eliminada correctament.';
        setTimeout(() => this.successMsg = '', 3000);
      },
      error: () => {
        this.errorMsg = 'Error en eliminar la notificació.';
      }
    });
  }

  /**
   * Formateja una data per mostrar-la de forma llegible.
   * @param date Data en format ISO o Date
   * @returns Cadena formatejada
   */
  formatData(date: string | Date): string {
    if (!date) return '';
    const d = new Date(date);
    return isNaN(d.getTime()) ? String(date) : d.toLocaleDateString('ca-ES', { day: '2-digit', month: 'short', year: 'numeric' });
  }
}
