import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { TranslationService } from '../../../core/services/translation.service';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';
import { GuiaProfessional, GUIES_PRO_VA, GUIES_PRO_ES, GUIES_PRO_EN } from '../../../services/guies-pro-data';

/**
 * Pàgina dedicada a la Comunitat de Professionals d'AVISA (/comunitat-professionals).
 * Funciona com un hub editorial i d'atracció (blog del professional) explicant amb detall
 * els motius pels quals els autònoms i empreses locals haurien d'adherir-se a la plataforma.
 */
@Component({
  selector: 'app-comunitat-professionals',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslatePipe],
  templateUrl: './comunitat-professionals.component.html',
  styleUrl: './comunitat-professionals.component.css'
})
export class ComunitatProfessionalsComponent implements OnInit {
  guiaOberta: string = 'guia-1';

  get guiesProfessionals(): GuiaProfessional[] {
    const lang = this.translationService.getLanguage();
    if (lang === 'ES') return GUIES_PRO_ES;
    if (lang === 'EN') return GUIES_PRO_EN;
    return GUIES_PRO_VA;
  }

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly translationService: TranslationService
  ) {}

  ngOnInit(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  toggleGuia(id: string): void {
    this.guiaOberta = this.guiaOberta === id ? '' : id;
  }

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

  anarRegistrePro(): void {
    if (this.authService.isLoggedIn()) {
      if (this.authService.isProfessional()) {
        this.router.navigate([this.getNavUrl('/tasques-ofertes')], { queryParams: { tipus: 'tasques' } });
      } else {
        this.router.navigate([this.getNavUrl('/perfil')]);
      }
      return;
    }
    this.router.navigate([this.getNavUrl('/registre')], { queryParams: { rol: 'PROFESSIONAL' } });
  }
}
