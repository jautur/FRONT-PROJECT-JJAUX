import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PwaService } from '../../../core/services/pwa.service';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';

/**
 * Component Guia d'Instal·lació PWA ("Añadir a pantalla de inicio").
 *
 * Funcionalitats:
 * - Detecta el suport d'instal·lació nativa (Chromium / Android) i dispara el prompt 'beforeinstallprompt'.
 * - Detecta si l'usuari navega amb Safari a iOS i ofereix instruccions visuals pas a pas (botó Compartir -> Afegir a pantalla d'inici).
 * - S'oculta automàticament si l'aplicació ja s'executa en mode Standalone.
 * - Respecta la decisió de l'usuari emmagatzemant l'estat descartat a localStorage per no ser intrusiu.
 */
@Component({
  selector: 'app-pwa-install-prompt',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  template: `
    <aside
      *ngIf="pwaService.showPrompt() && !pwaService.isStandalone()"
      class="pwa-prompt-overlay"
      role="dialog"
      aria-labelledby="pwa-title"
      aria-modal="false"
    >
      <div class="pwa-card">
        <!-- Botó de tancar / descartar -->
        <button
          type="button"
          class="btn-close-prompt"
          (click)="dismiss()"
          [attr.aria-label]="'COMMON.TANCAR' | translate"
          [title]="'COMMON.TANCAR' | translate"
        >
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        <!-- Capçalera amb icona de la marca AVISA -->
        <div class="pwa-header">
          <div class="pwa-app-icon" aria-hidden="true">
            <span class="brand-letters">AV</span>
          </div>
          <div class="pwa-meta">
            <h3 id="pwa-title" class="pwa-title">{{ 'PWA.INSTALL_PROMPT_TITLE' | translate }}</h3>
            <span class="pwa-badge">App Oficial</span>
          </div>
        </div>

        <p class="pwa-desc">
          {{ 'PWA.INSTALL_PROMPT_DESC' | translate }}
        </p>

        <!-- CAS 1: Android / Chrome / Navegadors compatibles amb prompt natiu -->
        <div *ngIf="pwaService.canInstall()" class="pwa-actions">
          <button type="button" class="btn-install-pwa" (click)="install()">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            <span>{{ 'PWA.INSTALL_BTN' | translate }}</span>
          </button>
          <button type="button" class="btn-dismiss-pwa" (click)="dismiss()">
            {{ 'PWA.LATER_BTN' | translate }}
          </button>
        </div>

        <!-- CAS 2: iOS Safari - Guia d'accions manuals d'Apple -->
        <div *ngIf="pwaService.isIosSafari() && !pwaService.canInstall()" class="ios-guide">
          <ol class="ios-steps">
            <li class="ios-step">
              <span class="step-number">1</span>
              <span class="step-icon" aria-hidden="true">
                <!-- Icona de compartir Safari (quadrat amb fletxa cap amunt) -->
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
                  <polyline points="16 6 12 2 8 6"></polyline>
                  <line x1="12" y1="2" x2="12" y2="15"></line>
                </svg>
              </span>
              <span class="step-text">{{ 'PWA.IOS_STEP_1' | translate }}</span>
            </li>
            <li class="ios-step">
              <span class="step-number">2</span>
              <span class="step-icon" aria-hidden="true">
                <!-- Icona d'afegir a pantalla d'inici -->
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="12" y1="8" x2="12" y2="16"></line>
                  <line x1="8" y1="12" x2="16" y2="12"></line>
                </svg>
              </span>
              <span class="step-text">{{ 'PWA.IOS_STEP_2' | translate }}</span>
            </li>
            <li class="ios-step">
              <span class="step-number">3</span>
              <span class="step-icon" aria-hidden="true">
                <!-- Icona d'acció OK / Afegir -->
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </span>
              <span class="step-text">{{ 'PWA.IOS_STEP_3' | translate }}</span>
            </li>
          </ol>
          <button type="button" class="btn-ios-done" (click)="dismiss()">
            {{ 'PWA.IOS_CLOSE' | translate }}
          </button>
        </div>
      </div>
    </aside>
  `,
  styleUrls: ['./pwa-install-prompt.component.css']
})
export class PwaInstallPromptComponent {
  readonly pwaService = inject(PwaService);

  /**
   * Dispara la instal·lació nativa al navegador.
   */
  async install(): Promise<void> {
    await this.pwaService.promptInstall();
  }

  /**
   * Tanca el banner d'instal·lació.
   */
  dismiss(): void {
    this.pwaService.dismissPrompt();
  }
}
