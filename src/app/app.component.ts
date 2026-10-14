import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet, NavigationEnd } from '@angular/router';
import { AuthService } from './core/services/auth.service';
import { AvisService } from './services/avis.service';

/**
 * Component principal arrel de l'aplicació JJAUX.
 * Controla:
 * 1. El títol 'JJAUX' centrat a la part superior.
 * 2. L'estat inicial transparent sobre imatge de fons.
 * 3. En fer scroll, canvi del fons del títol a color llis.
 * 4. Obertura automàtica del menú a l'esquerra amb els apartats necessaris.
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  /** Nombre d'avisos pendents */
  avisosPendents = 0;

  /** Indica si la pàgina ha fet scroll avall */
  isScrolled = false;

  /** Estat del menú lateral esquerre */
  menuObert = false;

  /** Indica si estem a la pàgina principal d'inici */
  isHomePage = true;

  constructor(
    public readonly authService: AuthService,
    private readonly avisService: AvisService,
    private readonly router: Router
  ) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.isHomePage = event.urlAfterRedirects === '/' || event.urlAfterRedirects === '';
        if (!this.isHomePage) {
          // A les pàgines secundàries el fons sempre és llis per llegibilitat
          this.isScrolled = true;
          this.menuObert = false;
        } else {
          this.checkScroll();
        }
      }
    });
  }

  ngOnInit(): void {
    this.actualitzarAvisos();
    this.checkScroll();
  }

  /**
   * Escolta l'esdeveniment de scroll de la finestra.
   */
  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    this.checkScroll();
  }

  /**
   * Comprova la posició de scroll per activar el fons llis i obrir el menú esquerre.
   */
  private checkScroll(): void {
    if (!this.isHomePage) {
      this.isScrolled = true;
      return;
    }

    const scrollY = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    if (scrollY > 70) {
      this.isScrolled = true;
      this.menuObert = true;
    } else {
      this.isScrolled = false;
      this.menuObert = false;
    }
  }

  /**
   * Obre o tanca manualment el menú lateral esquerre.
   */
  toggleMenu(): void {
    this.menuObert = !this.menuObert;
  }

  /**
   * Tanca el menú lateral esquerre.
   */
  tancarMenu(): void {
    this.menuObert = false;
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
    if (user && user.id) {
      this.avisService.getByUsuari(user.id).subscribe({
        next: (avisos) => {
          this.avisosPendents = avisos.filter(a => !a.llegit).length;
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
