import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from './core/services/auth.service';
import { AvisService } from './services/avis.service';

/**
 * Component principal arrel de l'aplicació JJAUX.
 * Controla la barra de navegació superior dinàmica segons el rol de l'usuari (client, professional o admin),
 * el comptador d'avisos pendents i la sortida de sessió.
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  /** Nombre de notificacions pendents de llegir per a l'usuari actual */
  avisosPendents = 0;

  constructor(
    public readonly authService: AuthService,
    private readonly avisService: AvisService,
    private readonly router: Router
  ) {}

  /**
   * Inicialització: carrega el recompte d'avisos pendents si l'usuari està connectat.
   */
  ngOnInit(): void {
    this.actualitzarAvisos();
  }

  /**
   * Comprova si l'usuari actual té permisos de client (rol client, ambdós o admin).
   */
  isClient(): boolean {
    return this.authService.isClient();
  }

  /**
   * Comprova si l'usuari actual té permisos de professional (rol professional, ambdós o admin).
   */
  isProfessional(): boolean {
    return this.authService.isProfessional();
  }

  /**
   * Comprova si l'usuari té el rol d'administrador global.
   */
  isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  /**
   * Consulta a l'API el nombre d'avisos pendents per mostrar la xifra al badge de la campana.
   */
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

  /**
   * Tanca la sessió de l'usuari i redirigeix a la pàgina de login.
   */
  logout(): void {
    this.authService.logout();
    this.avisosPendents = 0;
    this.router.navigate(['/login'], { queryParams: { message: 'Sessió tancada correctament.' } });
  }
}
