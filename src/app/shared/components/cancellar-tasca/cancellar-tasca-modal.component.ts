import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Tasca } from '../../../models/tasca.model';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';
import { TascaService } from '../../../services/tasca.service';

/**
 * Modal per sol·licitar la cancel·lació d'una tasca en curs. El motiu és obligatori.
 * La tasca queda en revisió fins que un administrador la resol.
 */
@Component({
  selector: 'app-cancellar-tasca-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  template: `
    <div class="modal-backdrop-cancel" (click)="tancar()">
      <div class="modal-cancel" role="dialog" aria-modal="true" aria-labelledby="cancel-title" (click)="$event.stopPropagation()">
        <h2 id="cancel-title">{{ 'TREBALL.CANCEL_TITLE' | translate }}</h2>
        <p class="cancel-task">{{ tasca?.titol }}</p>
        <p class="cancel-info">{{ 'TREBALL.CANCEL_INFO' | translate }}</p>

        <label for="cancel-motiu">{{ 'TREBALL.CANCEL_MOTIU_LABEL' | translate }}</label>
        <textarea
          id="cancel-motiu"
          rows="4"
          maxlength="1000"
          [(ngModel)]="motiu"
          [placeholder]="'TREBALL.CANCEL_MOTIU_PLACEHOLDER' | translate"
        ></textarea>

        <p class="cancel-error" role="alert" *ngIf="error">{{ errorServidor || ('TREBALL.CANCEL_ERROR' | translate) }}</p>

        <div class="cancel-actions">
          <button type="button" class="btn-cancel-secondary" (click)="tancar()" [disabled]="enviant">
            {{ 'COMMON.TANCAR' | translate }}
          </button>
          <button type="button" class="btn-cancel-primary" (click)="enviar()" [disabled]="enviant || !motiu.trim()">
            {{ enviant ? ('COMMON.CARREGANT' | translate) : ('TREBALL.CANCEL_SEND' | translate) }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-backdrop-cancel {
      position: fixed; inset: 0; z-index: 9999; padding: 1rem; box-sizing: border-box;
      display: flex; align-items: center; justify-content: center;
      background: rgba(9, 9, 12, 0.78); backdrop-filter: blur(4px);
    }
    .modal-cancel {
      background: #ffffff; color: #09090c; width: min(520px, 100%); max-height: 90vh; overflow-y: auto;
      border-radius: 16px; padding: 1.5rem; border: 1px solid #e5e0d7; display: flex; flex-direction: column; gap: 0.6rem;
    }
    .modal-cancel h2 { margin: 0; font-size: 1.25rem; }
    .cancel-task { margin: 0; font-weight: 800; }
    .cancel-info { margin: 0; font-size: 0.85rem; color: #57534e; }
    label { font-weight: 700; font-size: 0.85rem; }
    textarea { width: 100%; box-sizing: border-box; padding: 0.7rem; border-radius: 10px; border: 1px solid #d6d3d1; font: inherit; resize: vertical; }
    .cancel-error { margin: 0; color: #b91c1c; font-weight: 700; font-size: 0.85rem; }
    .cancel-actions { display: flex; gap: 0.6rem; justify-content: flex-end; flex-wrap: wrap; margin-top: 0.4rem; }
    .btn-cancel-primary, .btn-cancel-secondary { padding: 0.65rem 1.1rem; border-radius: 10px; font-weight: 800; cursor: pointer; border: 1px solid transparent; min-height: 44px; }
    .btn-cancel-primary { background: #ff1744; color: #ffffff; }
    .btn-cancel-secondary { background: #ffffff; color: #09090c; border-color: #d6d3d1; }
    .btn-cancel-primary:disabled, .btn-cancel-secondary:disabled { opacity: 0.55; cursor: not-allowed; }
  `]
})
export class CancellarTascaModalComponent {
  @Input() tasca: Tasca | null = null;
  @Output() tancat = new EventEmitter<void>();
  @Output() enviat = new EventEmitter<Tasca>();

  motiu = '';
  enviant = false;
  error = false;
  errorServidor = '';

  constructor(private readonly tascaService: TascaService) {}

  tancar(): void {
    if (!this.enviant) this.tancat.emit();
  }

  enviar(): void {
    if (!this.tasca || !this.motiu.trim() || this.enviant) return;
    this.enviant = true;
    this.error = false;
    this.errorServidor = '';
    this.tascaService.sollicitarCancellacio(this.tasca.id, this.motiu.trim()).subscribe({
      next: (tasca) => {
        this.enviant = false;
        this.enviat.emit(tasca);
      },
      error: (e) => {
        this.enviant = false;
        this.error = true;
        this.errorServidor = e?.error?.error || '';
      }
    });
  }
}
