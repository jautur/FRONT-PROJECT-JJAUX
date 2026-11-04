import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Usuari } from '../../../models/usuari.model';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';
import { UsuariService } from '../../../services/usuari.service';

/**
 * Dades de contacte de l'altra part d'una tasca acordada.
 * Només s'ha d'incloure quan la tasca ja està acceptada: abans, el contacte no es mostra.
 */
@Component({
  selector: 'app-contacte-tasca',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  template: `
    <div class="contacte-box" *ngIf="usuari">
      <span class="contacte-titol">{{ titol | translate }}</span>
      <strong class="contacte-nom">{{ usuari.nom }}</strong>
      <div class="contacte-enllacos">
        <a *ngIf="telefon" class="contacte-link wa" [href]="whatsappUrl" target="_blank" rel="noopener noreferrer">
          WhatsApp · {{ telefon }}
        </a>
        <a *ngIf="emailValid" class="contacte-link mail" [href]="'mailto:' + usuari.email">{{ usuari.email }}</a>
        <span *ngIf="!telefon && !emailValid" class="contacte-buit">{{ 'TREBALL.CONTACTE_SENSE_DADES' | translate }}</span>
      </div>
    </div>
  `,
  styles: [`
    .contacte-box {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
      padding: 0.75rem 0.9rem;
      border: 1px solid #bbf7d0;
      background: #f0fdf4;
      border-radius: 10px;
      font-size: 0.85rem;
    }
    .contacte-titol { font-size: 0.72rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.04em; color: #166534; }
    .contacte-nom { color: #09090c; }
    .contacte-enllacos { display: flex; flex-wrap: wrap; gap: 0.5rem; }
    .contacte-link {
      padding: 0.35rem 0.7rem;
      border-radius: 8px;
      font-weight: 700;
      text-decoration: none;
      border: 1px solid #86efac;
      color: #166534;
      background: #ffffff;
    }
    .contacte-link:hover { background: #166534; color: #ffffff; }
    .contacte-buit { color: #57534e; }
  `]
})
export class ContacteTascaComponent {
  @Input() titol = 'TREBALL.CONTACTE_PROFESSIONAL';

  usuari: Usuari | null = null;
  private idActual = '';

  constructor(private readonly usuariService: UsuariService) {}

  @Input() set usuariId(id: string | undefined | null) {
    if (!id || id === this.idActual) return;
    this.idActual = id;
    this.usuariService.getById(id).subscribe({
      next: (u) => (this.usuari = u),
      error: () => (this.usuari = null)
    });
  }

  get telefon(): string {
    return (this.usuari?.telefon || '').trim();
  }

  get emailValid(): boolean {
    return !!this.usuari?.email && this.usuari.email.includes('@');
  }

  get whatsappUrl(): string {
    const digits = this.telefon.replace(/\D/g, '');
    return `https://wa.me/${digits.length === 9 ? '34' + digits : digits}`;
  }
}
