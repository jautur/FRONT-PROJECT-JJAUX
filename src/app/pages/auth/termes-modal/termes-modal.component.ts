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
  template: `
    <div [class.modal-backdrop]="isModal" (click)="onBackdropClick($event)">
      <div class="legal-container" [class.is-modal-window]="isModal" (click)="$event.stopPropagation()">
        <!-- Capçalera amb pestanyes -->
        <header class="legal-header">
          <div class="header-titles">
            <span class="legal-eyebrow">{{ 'AUTH.TERMES_MODAL.EYEBROW' | translate }}</span>
            <h2>{{ activeTab === 'termes' ? ('AUTH.TERMES_MODAL.TERMES_TITLE' | translate) : ('AUTH.TERMES_MODAL.PRIVACY_TITLE' | translate) }}</h2>
          </div>
          <button *ngIf="isModal" type="button" class="btn-close" (click)="close.emit()" [attr.aria-label]="'AUTH.TERMES_MODAL.CLOSE' | translate">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </header>

        <!-- Selector de pestanyes: Termes vs Privacitat -->
        <nav class="legal-tabs" aria-label="Navegació legal">
          <button
            type="button"
            class="tab-btn"
            [class.active]="activeTab === 'termes'"
            (click)="activeTab = 'termes'">
            {{ 'AUTH.TERMES_MODAL.TAB_TERMES' | translate }}
          </button>
          <button
            type="button"
            class="tab-btn"
            [class.active]="activeTab === 'privacitat'"
            (click)="activeTab = 'privacitat'">
            {{ 'AUTH.TERMES_MODAL.TAB_PRIVACY' | translate }}
          </button>
        </nav>

        <!-- Contingut legal desplaçable (Scroll còmode per a mòbils) -->
        <main class="legal-body">
          <!-- PESTANYA 1: TERMES I CONDICIONS D'ÚS -->
          <article *ngIf="activeTab === 'termes'" class="legal-article">
            <div class="legal-doc-intro">
              <p class="doc-date">Darrera actualització: Octubre 2026</p>
              <p class="doc-summary">
                Benvingut/da a la plataforma <strong>AVISA</strong>. En registrar-vos com a Client o com a Professional,
                accepteu de manera vinculant els presents termes i condicions que regeixen l'ús de la plataforma.
              </p>
            </div>

            <!-- Secció 1 -->
            <section class="legal-section">
              <h3 class="section-title">
                <span class="section-num">1</span>
                Naturalesa del servei (Rol d'intermediació)
              </h3>
              <ul class="legal-points">
                <li>
                  <strong>Intermediació tecnològica:</strong> La Plataforma AVISA actua exclusivament com a punt de trobada
                  tecnològic entre professionals independents ("Professionals") i usuaris demandants de serveis ("Clients").
                </li>
                <li>
                  <strong>Independència de les parts:</strong> La relació contractual i laboral per a l'execució del treball
                  s'estableix directament i exclusiva entre el Client i el Professional. AVISA no és part del contracte de
                  prestació de serveis ni manté vincle laboral o de subordinació amb cap professional registrat.
                </li>
              </ul>
            </section>

            <!-- Secció 2 -->
            <section class="legal-section">
              <h3 class="section-title">
                <span class="section-num">2</span>
                Compromisos i obligacions dels Clients
              </h3>
              <p class="section-intro">En sol·licitar o contractar un servei, el Client accepta expressament:</p>
              <ul class="legal-points">
                <li>
                  <strong>Obligació de pagament:</strong> Pagar l'import total acordat per a la tasca mitjançant les
                  passarel·les de pagament habilitades a la Plataforma.
                </li>
                <li>
                  <strong>Prohibició de pagaments fora de la plataforma:</strong> Queda terminantment prohibit acordar o
                  efectuar pagaments en efectiu o per vies externes amb la finalitat d'eludir les comissions d'intermediació.
                  L'incompliment comportarà el bloqueig permanent del compte.
                </li>
                <li>
                  <strong>Tracte i respecte:</strong> Mantindre un tracte respectuós, professional i lliure de qualsevol
                  tipus de discriminació, assetjament o violència cap al professional.
                </li>
                <li>
                  <strong>Facilitat d'accés i veracitat:</strong> Proporcionar informació veraç sobre l'abast de la tasca
                  i garantir un accés segur i adequat a l'espai on s'haja de realitzar el treball.
                </li>
                <li>
                  <strong>Cancel·lacions injustificades:</strong> Les cancel·lacions d'última hora sense causa de força
                  major podran comportar penalitzacions econòmiques per a cobrir el desplaçament o temps reservat pel professional.
                </li>
              </ul>
            </section>

            <!-- Secció 3 -->
            <section class="legal-section">
              <h3 class="section-title">
                <span class="section-num">3</span>
                Compromisos i obligacions dels Professionals
              </h3>
              <p class="section-intro">En registrar-se i acceptar tasques, el Professional accepta expressament:</p>
              <ul class="legal-points">
                <li>
                  <strong>Execució i professionalitat:</strong> Realitzar la tasca acceptada amb diligència professional,
                  complint els terminis acordats i garantint la qualitat del treball.
                </li>
                <li>
                  <strong>Compromís de no abandonament:</strong> No cancel·lar ni abandonar serveis acceptats sense motiu
                  de força major degudament comunicat. Les cancel·lacions reiterades o deixar un client sense atenció implicaran
                  la baixa immediata de la plataforma.
                </li>
                <li>
                  <strong>Prohibició de falsejament:</strong> Es prohibeix expressament marcar com a completades tasques que
                  no s'hagen finalitzat, unflar hores no treballades o incloure conceptes ficticis per a obtindre un rendiment
                  econòmic indegut.
                </li>
                <li>
                  <strong>Legalitat i capacitació:</strong> El professional declara sota la seua responsabilitat comptar amb
                  les altes fiscals pertinents (autònom o empresa), llicències, permisos i assegurances que la llei exigisca
                  per a la seua activitat.
                </li>
              </ul>
            </section>

            <!-- Secció 4 -->
            <section class="legal-section">
              <h3 class="section-title">
                <span class="section-num">4</span>
                Gestió econòmica, comissions i dipòsit de garantia
              </h3>
              <ul class="legal-points">
                <li>
                  <strong>Comissió de la plataforma:</strong> Per cada tasca contractada i completada satisfactòriament,
                  AVISA deduïrà automàticament el percentatge de comissió establit sobre el cost total facturat abans de liquidar
                  la quantitat restant al professional.
                </li>
                <li>
                  <strong>Retenció temporal (Escrow / Pagament segur):</strong> En confirmar el servei, el Client diposita l'import
                  a través de la passarel·la integrada. Aquest import queda retingut cautelarment per la Plataforma i no s'allibera
                  al professional fins que el client confirma la correcta execució de la tasca o expira el termini establit per a obrir incidències.
                </li>
                <li>
                  <strong>Facturació:</strong> AVISA emetrà factura al professional per l'import de la comissió de gestió. El professional
                  és el responsable directe d'emetre la factura corresponent al client final pel servei realitzat.
                </li>
                <li>
                  <strong>Finançament de la plataforma i plans prèmium:</strong> La plataforma AVISA es finança principalment mitjançant
                  espais de publicitat i patrocini. Posteriorment, s'adheriran plans de subscripció i funcionalitats prèmium opcionals per a usuaris
                  i professionals que requereixin serveis addicionals o eines avançades de gestió. Durant el període inicial de llançament
                  (primer any), l'accés bàsic és 100% gratuït i exempt de quotes fixes obligatòries per a tots els professionals.
                </li>
              </ul>
            </section>

            <!-- Secció 5 -->
            <section class="legal-section">
              <h3 class="section-title">
                <span class="section-num">5</span>
                Resolució de conflictes i incidències
              </h3>
              <ul class="legal-points">
                <li>
                  <strong>Període de revisió:</strong> Una vegada el professional marca la tasca com a finalitzada, el Client disposa
                  d'un marge de temps per a verificar el treball o obrir una disputa des de l'app si considera que el servei no s'ha realitzat
                  o conté defectes greus.
                </li>
                <li>
                  <strong>Mediació:</strong> En cas de desacord, l'equip d'AVISA revisarà les proves aportades per ambdues parts
                  (xat, fotografies, registres horaris) i prendrà una decisió respecte a l'alliberament o reembossament dels fons retinguts.
                </li>
              </ul>
            </section>

            <!-- Secció 6 -->
            <section class="legal-section">
              <h3 class="section-title">
                <span class="section-num">6</span>
                Sancions i cancel·lació de comptes
              </h3>
              <p class="section-intro">
                AVISA es reserva el dret de suspendre cautelarment o cancel·lar de manera definitiva el compte de qualsevol
                usuari (Client o Professional) que:
              </p>
              <ul class="legal-points">
                <li>Falsege informació o intente cometre frau econòmic.</li>
                <li>Incumpleixi de forma reiterada les obligacions de respecte, puntualitat o pagament.</li>
                <li>Intente derivar clients o professionals fora de l'aplicació per a evitar la comissió de servei.</li>
              </ul>
            </section>
          </article>

          <!-- PESTANYA 2: POLÍTICA DE PRIVACITAT -->
          <article *ngIf="activeTab === 'privacitat'" class="legal-article">
            <div class="legal-doc-intro">
              <p class="doc-date">Darrera actualització: Octubre 2026</p>
              <p class="doc-summary">
                La privadesa i seguretat de les teves dades és una prioritat a AVISA.
                A continuació detallem com recollim, utilitzem i protegim la teva informació d'acord amb el Reglament General de Protecció de Dades (RGPD).
              </p>
            </div>

            <section class="legal-section">
              <h3 class="section-title">
                <span class="section-num">1</span>
                Responsable del Tractament
              </h3>
              <p>
                La plataforma <strong>AVISA Serveis Tecnològics S.L.</strong> és la responsable del tractament de les dades personals
                facilitades durant el registre i la utilització del servei.
              </p>
            </section>

            <section class="legal-section">
              <h3 class="section-title">
                <span class="section-num">2</span>
                Finalitat del Tractament
              </h3>
              <ul class="legal-points">
                <li><strong>Gestió del compte d'usuari:</strong> Registre, inici de sessió i autenticació segura mitjançant tokens JWT.</li>
                <li><strong>Intermediació de serveis:</strong> Facilitar el contacte directe entre clients i professionals per gestionar pressupostos i tasques.</li>
                <li><strong>Transaccions i pagaments:</strong> Gestió del dipòsit de garantia (Escrow) i facturació legal de les comissions de servei.</li>
                <li><strong>Prevenció del frau:</strong> Supervisió del compliment dels termes d'ús i seguretat dels contractes acordats.</li>
              </ul>
            </section>

            <section class="legal-section">
              <h3 class="section-title">
                <span class="section-num">3</span>
                Drets de l'Usuari (RGPD)
              </h3>
              <p>
                Tens dret a accedir a les teves dades, rectificar-les, sol·licitar la seva supressió (dret a l'oblit),
                limitar el seu tractament i oposar-te al mateix directament des del teu panell de perfil o contactant
                amb el delegat de protecció de dades a <em>privacitat&#64;avisa.cat</em>.
              </p>
            </section>
          </article>
        </main>

        <!-- Peu amb accions -->
        <footer class="legal-footer">
          <button *ngIf="isModal" type="button" class="btn-cancel" (click)="close.emit()">
            {{ 'COMMON.TANCAR' | translate }}
          </button>
          <button *ngIf="isModal" type="button" class="btn-accept" (click)="onAcceptClick()">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: -2px; margin-right: 4px;" aria-hidden="true">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            {{ 'AUTH.TERMES_MODAL.ACCEPT_DOC' | translate }}
          </button>
          <a *ngIf="!isModal" [routerLink]="getNavUrl('/registre')" class="btn-accept" style="text-decoration: none;">
            {{ 'AUTH.REGISTER.TITLE' | translate }}
          </a>
        </footer>
      </div>
    </div>
  `,
  styles: [
    `
      .modal-backdrop {
        position: fixed;
        inset: 0;
        background: rgba(9, 9, 12, 0.72);
        backdrop-filter: blur(4px);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 9999;
        padding: 1rem;
        box-sizing: border-box;
        animation: fadeInBackdrop 0.2s ease-out;
      }

      @keyframes fadeInBackdrop {
        from { opacity: 0; }
        to { opacity: 1; }
      }

      .legal-container {
        width: min(720px, 100%);
        background: var(--bg-card, #ffffff);
        border-radius: var(--radius-xl, 20px);
        box-shadow: 0 24px 60px rgba(0, 0, 0, 0.28);
        display: flex;
        flex-direction: column;
        max-height: 85vh;
        overflow: hidden;
        border: 1px solid var(--border-subtle, #e5e0d7);
        box-sizing: border-box;
      }

      .is-modal-window {
        animation: slideUpModal 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      }

      @keyframes slideUpModal {
        from {
          opacity: 0;
          transform: translateY(24px) scale(0.97);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }

      .legal-header {
        padding: 1.4rem 1.6rem 1rem;
        border-bottom: 1px solid var(--border-subtle, #eeeae0);
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        background: var(--bg-surface, #faf8f4);
      }

      .legal-eyebrow {
        font-size: 0.72rem;
        font-weight: 900;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        color: #ff1744;
        display: block;
        margin-bottom: 0.25rem;
      }

      .header-titles h2 {
        margin: 0;
        font-size: 1.35rem;
        font-weight: 900;
        color: #09090c;
        letter-spacing: -0.02em;
      }

      .btn-close {
        background: #eeeae0;
        border: none;
        width: 34px;
        height: 34px;
        border-radius: 50%;
        font-size: 1.1rem;
        color: #55534c;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.15s ease;
      }

      .btn-close:hover {
        background: #ff1744;
        color: #ffffff;
      }

      .legal-tabs {
        display: flex;
        border-bottom: 1px solid #eeeae0;
        background: #ffffff;
        padding: 0 1.25rem;
        gap: 0.5rem;
      }

      .tab-btn {
        background: transparent;
        border: none;
        border-bottom: 3px solid transparent;
        padding: 0.75rem 0.95rem;
        font-size: 0.88rem;
        font-weight: 800;
        color: #716e65;
        cursor: pointer;
        transition: all 0.15s ease;
      }

      .tab-btn:hover {
        color: #ff1744;
      }

      .tab-btn.active {
        color: #ff1744;
        border-bottom-color: #ff1744;
      }

      .legal-body {
        padding: 1.5rem 1.75rem;
        overflow-y: auto;
        -webkit-overflow-scrolling: touch;
        flex: 1;
        background: #ffffff;
        color: #2b2a26;
        line-height: 1.6;
        font-size: 0.92rem;
      }

      .legal-body::-webkit-scrollbar {
        width: 6px;
      }

      .legal-body::-webkit-scrollbar-thumb {
        background: #dcd7ce;
        border-radius: 4px;
      }

      .legal-doc-intro {
        background: #faf8f4;
        border: 1px solid #eeeae0;
        border-left: 4px solid #ff1744;
        border-radius: 10px;
        padding: 1rem 1.2rem;
        margin-bottom: 1.5rem;
      }

      .doc-date {
        margin: 0 0 0.35rem;
        font-size: 0.78rem;
        font-weight: 800;
        text-transform: uppercase;
        color: #8c897f;
      }

      .doc-summary {
        margin: 0;
        font-size: 0.9rem;
        color: #403e38;
      }

      .legal-section {
        margin-bottom: 1.6rem;
      }

      .section-title {
        display: flex;
        align-items: center;
        gap: 0.6rem;
        font-size: 1.05rem;
        font-weight: 900;
        color: #09090c;
        margin: 0 0 0.75rem;
      }

      .section-num {
        width: 26px;
        height: 26px;
        border-radius: 50%;
        background: #09090c;
        color: #ffffff;
        font-size: 0.78rem;
        font-weight: 900;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }

      .section-intro {
        margin: 0 0 0.65rem;
        font-weight: 700;
        color: #403e38;
      }

      .legal-points {
        margin: 0;
        padding-left: 1.2rem;
        display: flex;
        flex-direction: column;
        gap: 0.65rem;
      }

      .legal-points li {
        color: #403e38;
      }

      .legal-points strong {
        color: #09090c;
      }

      .legal-footer {
        padding: 1rem 1.6rem;
        border-top: 1px solid #eeeae0;
        background: #faf8f4;
        display: flex;
        justify-content: flex-end;
        align-items: center;
        gap: 0.75rem;
      }

      .btn-cancel {
        background: #eeeae0;
        color: #403e38;
        border: 1px solid #dcd7ce;
        padding: 0.65rem 1.25rem;
        border-radius: 9px;
        font-weight: 800;
        font-size: 0.88rem;
        cursor: pointer;
        transition: all 0.15s ease;
      }

      .btn-cancel:hover {
        background: #e2ddd2;
      }

      .btn-accept {
        background: #ff1744;
        color: #ffffff;
        border: none;
        padding: 0.65rem 1.35rem;
        border-radius: 9px;
        font-weight: 900;
        font-size: 0.88rem;
        cursor: pointer;
        box-shadow: 0 2px 10px rgba(255, 23, 68, 0.3);
        transition: all 0.15s ease;
      }

      .btn-accept:hover {
        background: #09090c;
        box-shadow: 0 4px 14px rgba(0, 0, 0, 0.25);
      }

      /* Adaptació mòbil específica per a lectura còmoda */
      @media (max-width: 640px) {
        .modal-backdrop {
          padding: 0;
          align-items: flex-end;
        }

        .legal-container {
          width: 100%;
          max-height: 92vh;
          border-radius: 20px 20px 0 0;
          border-bottom: none;
        }

        .legal-header {
          padding: 1rem 1.15rem;
        }

        .header-titles h2 {
          font-size: 1.15rem;
        }

        .legal-body {
          padding: 1.15rem;
          font-size: 0.88rem;
        }

        .legal-footer {
          padding: 0.85rem 1.15rem;
          flex-direction: column-reverse;
          gap: 0.5rem;
        }

        .btn-cancel,
        .btn-accept {
          width: 100%;
          text-align: center;
          padding: 0.75rem 1rem;
        }
      }
    `
  ]
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

