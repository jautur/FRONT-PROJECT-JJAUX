import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

/**
 * Component de Termes i Condicions i Política de Privacitat d'AVISA.
 * Pot funcionar com a:
 * 1. Modal emergent (sobreposat al formulari de registre sense perdre dades introduïdes).
 * 2. Vista autònoma de pàgina completa a la ruta /termes o /privacitat.
 * 
 * Estructura del document legal:
 * - Secció 1: Naturalesa del servei (Rol d'intermediació tecnològica i independència).
 * - Secció 2: Compromisos i obligacions dels Clients (pagaments integrats, tracte digne, etc.).
 * - Secció 3: Compromisos i obligacions dels Professionals (execució diligent, no abandonament, etc.).
 * - Secció 4: Gestió econòmica, comissions i dipòsit de garantia (Escrow / Pagament segur).
 * - Secció 5: Resolució de conflictes i incidències (període de revisió i mediació AVISA).
 * - Secció 6: Sancions i cancel·lació de comptes (frau, infraccions reiterades).
 * - Política de Privacitat: Responsable, finalitats i exercici de drets RGPD.
 */
import { TranslatePipe } from '../../../core/pipes/translate.pipe';

@Component({
  selector: 'app-termes-modal',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslatePipe],
  templateUrl: './termes-modal.component.html',
  styleUrl: './termes-modal.component.css'
})
export class TermesModalComponent implements OnInit {
  /** Determina si s'executa com a modal o com a vista de pàgina completa */
  @Input() isModal = true;

  /** Pestanya activa per defecte: 'termes' o 'privacitat' */
  @Input() activeTab: 'termes' | 'privacitat' = 'termes';

  /** Event emès quan l'usuari tanca el modal */
  @Output() close = new EventEmitter<void>();

  /** Event emès quan l'usuari accepta el document legal visualitzat */
  @Output() accept = new EventEmitter<'termes' | 'privacitat'>();

  constructor(
    private readonly route: ActivatedRoute,
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

  ngOnInit(): void {
    // Si s'accedeix com a ruta directa /privacitat o queryParam ?tab=privacitat
    this.route.queryParams.subscribe((params) => {
      if (params['tab'] === 'privacitat') {
        this.activeTab = 'privacitat';
      }
    });
  }

  onBackdropClick(event: MouseEvent): void {
    if (this.isModal) {
      this.close.emit();
    }
  }

  onAcceptClick(): void {
    this.accept.emit(this.activeTab);
    this.close.emit();
  }
}

