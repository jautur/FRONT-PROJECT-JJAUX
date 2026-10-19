import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from './core/services/auth.service';
import { TranslationService } from './core/services/translation.service';
import { TranslatePipe } from './core/pipes/translate.pipe';
import { AvisService } from './services/avis.service';
import { ConfirmService } from './core/services/confirm.service';
import { PwaInstallPromptComponent } from './shared/components/pwa-install-prompt/pwa-install-prompt.component';

/**
 * Component principal arrel de l'aplicació AVISA.
 * Controla:
 * 1. El títol 'AVISA' centrat a la part superior.
 * 2. L'estat inicial transparent sobre imatge de fons.
 * 3. En fer scroll, canvi del fons del títol a color llis.
 * 4. Obertura i ocultació del menú a l'esquerra amb els apartats necessaris.
 * 5. Indicador i botó flotant d'avisos pendents a baix a la dreta.
 * 6. Guia interactiva d'instal·lació PWA ('Añadir a pantalla de inicio').
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, TranslatePipe, PwaInstallPromptComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  /** Nombre d'avisos pendents */
  avisosPendents = 0;

  /** Idioma actiu de la plataforma delegat en TranslationService */
  get currentLang(): 'EN' | 'VA' | 'ES' {
    return this.translationService.currentLang();
  }

  /** Indica si la pàgina actual és la de safata d'avisos */
  isAvisosPage = false;

  /** Indica si la pàgina ha fet scroll avall */
  isScrolled = false;

  /** Estat del menú lateral esquerre */
  menuObert = false;

  /** Registra si l'usuari ha ocultat voluntàriament el menú */
  menuOcultatPerUsuari = false;

  /** Estat anterior de scroll per obrir el menú només a la transició inicial */
  private wasScrolled = false;

  /** Indica si estem a la pàgina principal d'inici */
  isHomePage = true;

  /** Estat del desplegable de vista prèvia de perfil */
  perfilDropdownObert = false;

  /** Interval de refresc automàtic dels avisos en segon pla */
  private avisosInterval: any;

  /** Subscripció als canvis d'autenticació */
  private authSub?: Subscription;

  constructor(
    public readonly authService: AuthService,
    public readonly translationService: TranslationService,
    public readonly confirmService: ConfirmService,
    private readonly avisService: AvisService,
    private readonly router: Router
  ) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.perfilDropdownObert = false;
        const url = event.urlAfterRedirects || '';
        this.isHomePage = url === '/' || url === '' || url.startsWith('/?');
        this.isAvisosPage = url.startsWith('/avisos');
        this.actualitzarAvisos();
        if (!this.isHomePage) {
          // A les pàgines secundàries la barra superior està disponible directament
          this.isScrolled = true;
          this.wasScrolled = true;
          this.menuObert = false;
        } else {
          this.menuOcultatPerUsuari = false;
          this.checkScroll();
        }
      }
    });

    this.authSub = this.authService.currentUser$.subscribe(() => {
      this.actualitzarAvisos();
    });
  }

  ngOnInit(): void {
    this.actualitzarAvisos();
    this.checkScroll();

    // Comprovació periòdica dels avisos cada 15 segons
    this.avisosInterval = setInterval(() => {
      this.actualitzarAvisos();
    }, 15000);
  }

  ngOnDestroy(): void {
    if (this.avisosInterval) {
      clearInterval(this.avisosInterval);
    }
    if (this.authSub) {
      this.authSub.unsubscribe();
    }
  }

  /**
   * Refresca els avisos quan l'usuari torna a la finestra del navegador.
   */
  @HostListener('window:focus', [])
  onWindowFocus(): void {
    this.actualitzarAvisos();
  }

  /**
   * Escolta l'esdeveniment de scroll de la finestra.
   */
  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    this.checkScroll();
  }

  /**
   * Determina si la pantalla actual correspon a un dispositiu mòbil o tauleta.
   */
  isMobile(): boolean {
    return typeof window !== 'undefined' && window.innerWidth < 1100;
  }

  /**
   * Gestiona el canvi de mida de finestra per evitar que el menú quedi desplegat en mòbil.
   */
  @HostListener('window:resize', [])
  onWindowResize(): void {
    if (this.isMobile() && !this.menuOcultatPerUsuari && this.isHomePage) {
      this.menuObert = false;
    }
  }

  /**
   * Comprova la posició de scroll a la pàgina d'inici:
   * La barra superior (topbar) es manté amagada a dalt de tot de la portada (scrollY <= 70)
   * i apareix suaument amb tot el seu contingut pertinent quan l'usuari llisca cap avall (scrollY > 70).
   */
  private checkScroll(): void {
    if (!this.isHomePage) {
      this.isScrolled = true;
      return;
    }

    const scrollY = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    if (scrollY > 70) {
      this.isScrolled = true;
      this.wasScrolled = true;
    } else {
      this.isScrolled = false;
      this.menuObert = false;
      this.menuOcultatPerUsuari = false;
      this.wasScrolled = false;
    }
  }

  /**
   * Obre o tanca manualment el menú lateral esquerre.
   */
  toggleMenu(): void {
    this.menuObert = !this.menuObert;
    this.menuOcultatPerUsuari = !this.menuObert;
    if (this.menuObert) {
      this.perfilDropdownObert = false;
    }
  }

  /**
   * Tanca / oculta el menú lateral esquerre.
   */
  tancarMenu(): void {
    this.menuObert = false;
    this.menuOcultatPerUsuari = true;
  }

  /**
   * Canvia l'idioma seleccionat (EN, VA, ES) mitjançant el servei reactiu TranslationService.
   */
  setLanguage(lang: 'EN' | 'VA' | 'ES', event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.translationService.setLanguage(lang);
  }

  /**
   * Obre o tanca la vista prèvia desplegable de perfil.
   */
  togglePerfilDropdown(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.perfilDropdownObert = !this.perfilDropdownObert;
    if (this.perfilDropdownObert) {
      this.menuObert = false;
    }
  }

  /**
   * Tanca la vista prèvia de perfil.
   */
  tancarPerfilDropdown(): void {
    this.perfilDropdownObert = false;
  }

  /**
   * Tanca el menú de perfil si es fa clic fora d'ell.
   */
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.profile-dropdown-container')) {
      this.perfilDropdownObert = false;
    }
  }

  /**
   * Tanca el modal de perfil si es prem la tecla Escape.
   */
  @HostListener('document:keydown.escape', [])
  onEscapePress(): void {
    if (this.perfilDropdownObert) {
      this.perfilDropdownObert = false;
    }
  }

  isClient(): boolean {
    return this.authService.isClient();
  }

  isProfessional(): boolean {
    return this.authService.isProfessional();
  }

  isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  actualitzarAvisos(): void {
    const user = this.authService.getCurrentUser();
    if (user && (user.id || user.nom)) {
      const userKey = user.id || user.nom;
      this.avisService.getByUsuari(userKey).subscribe({
        next: (avisos) => {
          this.avisosPendents = (avisos ?? []).filter(a => !a.llegit).length;
        },
        error: () => {
          this.avisosPendents = 0;
        }
      });
    } else {
      this.avisosPendents = 0;
    }
  }

  logout(): void {
    this.authService.logout();
    this.avisosPendents = 0;
    this.router.navigate(['/login'], { queryParams: { message: 'Sessió tancada correctament.' } });
  }
}
