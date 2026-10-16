import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

interface GuiaProfessional {
  id: string;
  titol: string;
  subtitol: string;
  categoria: string;
  tempsLectura: string;
  imatge: string;
  puntsClau: string[];
  contingut: string[];
  destacat: string;
}

/**
 * Pàgina dedicada a la Comunitat de Professionals d'AVISA (/comunitat-professionals).
 * Funciona com un hub editorial i d'atracció (blog del professional) explicant amb detall
 * els motius pels quals els autònoms i empreses locals haurien d'adherir-se a la plataforma.
 */
@Component({
  selector: 'app-comunitat-professionals',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="pro-community-page">
      <!-- Breadcrumbs de navegació -->
      <nav class="pro-breadcrumbs" aria-label="Fil d'ariadna">
        <a routerLink="/" class="breadcrumb-link">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
          Inici
        </a>
        <span class="breadcrumb-separator">/</span>
        <a routerLink="/tasques-ofertes" class="breadcrumb-link">Professionals</a>
        <span class="breadcrumb-separator">/</span>
        <span class="breadcrumb-current">Comunitat</span>
      </nav>

      <!-- Capçalera Hero -->
      <header class="pro-hero-section">
        <div class="hero-badge">
          <span class="badge-dot"></span>
          COMUNITAT DE PROFESSIONALS AVISA
        </div>
        <h1 class="hero-title">Fes créixer el teu negoci local amb feina real, tracte directe i màxima transparència</h1>
        <p class="hero-lead">
          Descobreix per què fusters, lampistes, electricistes, pintors i paletes de la Costera, la Vall d'Albaida, la Safor i la Ribera (Xàtiva, Ontinyent, Gandia, Alzira...)
          escullen AVISA per gestionar la seva feina sense quotes mensuals fixes ni intermediaris abusius.
        </p>

        <div class="hero-cta-group">
          <button type="button" class="btn-hero-primary" (click)="anarRegistrePro()">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="8.5" cy="7" r="4"></circle>
              <line x1="20" y1="8" x2="20" y2="14"></line>
              <line x1="23" y1="11" x2="17" y2="11"></line>
            </svg>
            <span>Adherir-me a la Comunitat (Gratuït)</span>
          </button>
          <a routerLink="/tasques-ofertes" [queryParams]="{ tipus: 'tasques' }" class="btn-hero-secondary">
            <span>Explorar tasques obertes a la zona</span>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </a>
        </div>

        <!-- Mètriques ràpides -->
        <div class="pro-stats-strip">
          <div class="stat-item">
            <span class="stat-number">3%</span>
            <span class="stat-label">Comissió transparent de manteniment (0€ quotes fixes)</span>
          </div>
          <div class="stat-item">
            <span class="stat-number">100%</span>
            <span class="stat-label">Tracte i telèfon directe amb el client</span>
          </div>
          <div class="stat-item">
            <span class="stat-number">2 en 1</span>
            <span class="stat-label">Incidències a mida + Publicació d'ofertes</span>
          </div>
          <div class="stat-item">
            <span class="stat-number">4.9 / 5</span>
            <span class="stat-label">Valoració mitjana de la comunitat</span>
          </div>
        </div>
      </header>

      <!-- SECCIÓ 1: ELS 6 PILARS DE LA COMUNITAT -->
      <section class="reasons-section">
        <div class="section-heading">
          <span class="section-tag">ELS NOSTRES PILARS</span>
          <h2>Per què AVISA és diferent de qualsevol altra aplicació?</h2>
          <p>
            Hem dissenyat la plataforma escoltant els greuges tradicionals dels professionals autònoms:
            quotes abusives, competència deslleial i comissions opaques.
          </p>
        </div>

        <div class="reasons-grid">
          <div class="reason-card">
            <div class="reason-icon-wrapper">
              <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"></path>
                <line x1="12" y1="6" x2="12" y2="8"></line>
                <line x1="12" y1="16" x2="12" y2="18"></line>
              </svg>
            </div>
            <h3>1. Sense quotes ni pagaments per contacte</h3>
            <p>
              Oblida't de pagar per veure telèfons de clients que després no responen. A AVISA només s'aplica una mínima
              reserva transparent del 3% per al servei i manteniment de la xarxa en feines tancades.
            </p>
          </div>

          <div class="reason-card">
            <div class="reason-icon-wrapper">
              <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                <line x1="12" y1="11" x2="12" y2="17"></line>
                <line x1="9" y1="14" x2="15" y2="14"></line>
              </svg>
            </div>
            <h3>2. Doble via d'ingressos: Incidències i Ofertes</h3>
            <p>
              Aprofita la simetria de la plataforma:
              <strong>Mode Incidència</strong> per respondre a urgències o feines a mida,
              i <strong>Mode Oferta</strong> per anunciar packs tancats i cobrir buits d'agenda.
            </p>
          </div>

          <div class="reason-card">
            <div class="reason-icon-wrapper">
              <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
              </svg>
            </div>
            <h3>3. "Colecciona" Tasques i guanya prestigi</h3>
            <p>
              A AVISA, cada tasca que finalitzes amb èxit queda registrada al teu perfil amb valoracions reals de clients.
              Aquest historial demostrable és el teu millor aval davant nous clients de la comarca.
            </p>
          </div>

          <div class="reason-card">
            <div class="reason-icon-wrapper">
              <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
              </svg>
            </div>
            <h3>4. Contacte telefònic immediat</h3>
            <p>
              Tan bon punt el client accepta la teva proposta econòmica, es desbloqueja el contacte telefònic directe.
              Parleu de tu a tu, acordeu la visita d'obra o inici de feina i resolgueu qualsevol detall sense barreres.
            </p>
          </div>

          <div class="reason-card">
            <div class="reason-icon-wrapper">
              <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
            <h3>5. Herència de rol: Tu també ets client</h3>
            <p>
              Com a professional verificat gaudeixes de la màxima capacitat: pots enviar pressupostos a clients
              i, alhora, publicar tasques personals per contractar altres especialistes per a reformes pròpies.
            </p>
          </div>

          <div class="reason-card">
            <div class="reason-icon-wrapper">
              <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
            </div>
            <h3>6. Tu decideixes el teu horari i zona</h3>
            <p>
              Zero permanències i llibertat absoluta d'organització. Tu tries quines feines t'interessen,
              a quins pobles o barris vols desplaçar-te i quin volum de feina vols agafar cada setmana.
            </p>
          </div>
        </div>
      </section>

      <!-- SECCIÓ 2: TAULA COMPARATIVA: AVISA VS ALTRES WEBS -->
      <section class="comparison-section">
        <div class="section-heading">
          <span class="section-tag">COMPARATIVA TRANSPARENT</span>
          <h2>AVISA davant les plataformes tradicionals d'intermediaris</h2>
        </div>

        <div class="table-responsive">
          <table class="comparison-table">
            <thead>
              <tr>
                <th>Característica</th>
                <th class="col-avisa">Comunitat AVISA</th>
                <th>Altres plataformes (Habitissimo, TaskRabbit...)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Model de cobrament</strong></td>
                <td class="col-avisa"><span class="badge-win">Mínim 3% (Sense quotes fixes)</span></td>
                <td>15% - 25% comissió o pagar 150€/mes</td>
              </tr>
              <tr>
                <td><strong>Pagament per contacte / Lead</strong></td>
                <td class="col-avisa"><span class="badge-win">0 € (100% gratuït contactar)</span></td>
                <td>Entre 10€ i 40€ per cada telèfon</td>
              </tr>
              <tr>
                <td><strong>Accés al telèfon del client</strong></td>
                <td class="col-avisa"><span class="badge-win">Immediat en acceptar la proposta</span></td>
                <td>Opac, filtrat o de pagament previ</td>
              </tr>
              <tr>
                <td><strong>Publicació d'ofertes pròpies</strong></td>
                <td class="col-avisa"><span class="badge-win">Inclosa il·limitada per als membres</span></td>
                <td>Quota mensual o paquet d'anuncis</td>
              </tr>
              <tr>
                <td><strong>Focalització territorial</strong></td>
                <td class="col-avisa">Negoci local i comarcal directe (La Costera, Safor...)</td>
                <td>Empreses grans i multinacionals de fora</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- SECCIÓ 3: BLOG I GUIES TÈCNIQUES PER A PROFESSIONALS -->
      <section class="pro-blog-section">
        <div class="section-heading">
          <span class="section-tag">BLOG DEL PROFESSIONAL</span>
          <h2>Consells d'estratègia per maximitzar la teva activitat a la comarca</h2>
          <p>Llegeix els nostres articles especialitzats sobre com augmentar la conversió de pressupostos i fidelitzar clients.</p>
        </div>

        <div class="guides-accordion">
          <article class="guide-card" *ngFor="let guia of guiesProfessionals">
            <div class="guide-header" (click)="toggleGuia(guia.id)">
              <div class="guide-meta-top">
                <span class="guide-cat-badge">{{ guia.categoria }}</span>
                <span class="guide-read-time">{{ guia.tempsLectura }}</span>
              </div>
              <h3>{{ guia.titol }}</h3>
              <p class="guide-subtitle">{{ guia.subtitol }}</p>
              <div class="guide-toggle-btn">
                <span>{{ guiaOberta === guia.id ? 'Tancar consells' : 'Llegir article complet' }}</span>
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" [class.rotated]="guiaOberta === guia.id">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </div>
            </div>

            <!-- Contingut desplegable -->
            <div class="guide-content-body" *ngIf="guiaOberta === guia.id">
              <img [src]="guia.imatge" [alt]="guia.titol" class="guide-cover-img" />
              <div class="guide-paragraphs">
                <p *ngFor="let p of guia.contingut">{{ p }}</p>
              </div>

              <!-- Punts clau -->
              <div class="guide-checklist">
                <strong>Claus per aplicar avui mateix:</strong>
                <ul>
                  <li *ngFor="let pt of guia.puntsClau">✓ {{ pt }}</li>
                </ul>
              </div>

              <div class="guide-callout">
                <span class="callout-icon">💡</span>
                <p><strong>Consell AVISA:</strong> {{ guia.destacat }}</p>
              </div>
            </div>
          </article>
        </div>
      </section>

      <!-- SECCIÓ 4: TESTIMONIS REALS DE LA COMUNITAT -->
      <section class="testimonials-section">
        <div class="section-heading">
          <span class="section-tag">CASOS D'ÈXIT REALS</span>
          <h2>Què diuen els professionals que ja utilitzen AVISA?</h2>
        </div>

        <div class="testimonials-grid">
          <div class="testi-card">
            <div class="testi-stars">★★★★★</div>
            <p class="testi-quote">
              "Abans gastava més de 150€ al mes comprant contactes a altres plataformes que després mai responien.
              A AVISA, el client veu el meu perfil, veu les fotos de les meves feines i em contacta sabent el que faig. En 3 mesos he tancat 6 reformes completes."
            </p>
            <div class="testi-author">
              <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80" alt="Jordi Romero" class="testi-avatar" />
              <div>
                <strong>Jordi Romero</strong>
                <span>Constructor i Paleta (15 anys d'experiència)</span>
              </div>
            </div>
          </div>

          <div class="testi-card">
            <div class="testi-stars">★★★★★</div>
            <p class="testi-quote">
              "La combinació d'incidències urgents i ofertes és perfecta. Si una tarda se'm cancel·la una feina,
              obro AVISA, miro les peticions de fuites o calderes de la zona i en pocs minuts tinc la tarda coberta a preu just."
            </p>
            <div class="testi-author">
              <img src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=120&q=80" alt="Pere Font" class="testi-avatar" />
              <div>
                <strong>Pere Font</strong>
                <span>Lampista Homologat i Tècnic d'Aigua</span>
              </div>
            </div>
          </div>

          <div class="testi-card">
            <div class="testi-stars">★★★★★</div>
            <p class="testi-quote">
              "Publicar ofertes de quadres elèctrics nous i butlletins m'ha donat una estabilitat que abans no tenia.
              Les valoracions que em deixen els clients després de cada feina són la meva millor carta de presentació."
            </p>
            <div class="testi-author">
              <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80" alt="Marc Soler" class="testi-avatar" />
              <div>
                <strong>Marc Soler</strong>
                <span>Instal·lador Elèctric Autoritzat</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- SECCIÓ 5: CRIDA FINAL A L'ACCIÓ -->
      <section class="final-pro-cta">
        <div class="cta-inner-card">
          <span class="cta-mini-tag">COMUNITAT LOCAL D'AVISA</span>
          <h2>Fes el pas avui mateix i suma't a la comunitat d'oficis líder de la zona</h2>
          <p>
            El registre triga menys de 2 minuts. Només necessites el teu nom, correu i telèfon per començar a
            rebre peticions de clients de la teva comarca.
          </p>
          <div class="cta-actions">
            <button type="button" class="btn-register-pro-big" (click)="anarRegistrePro()">
              Registrar-me com a Professional ara
            </button>
            <a routerLink="/" class="link-back-main">← Tornar a la pàgina principal</a>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .pro-community-page {
      max-width: 1180px;
      margin: 0 auto;
      padding: 1.5rem 1.25rem 5rem;
      color: #09090c;
      font-family: inherit;
    }

    /* Breadcrumbs */
    .pro-breadcrumbs {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.88rem;
      color: #636058;
      margin-bottom: 2rem;
    }
    .breadcrumb-link {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      color: #636058;
      text-decoration: none;
      font-weight: 600;
      transition: color 0.2s ease;
    }
    .breadcrumb-link:hover {
      color: #ff1744;
    }
    .breadcrumb-separator {
      color: #d6d0c4;
    }
    .breadcrumb-current {
      color: #09090c;
      font-weight: 700;
    }

    /* Hero */
    .pro-hero-section {
      text-align: center;
      padding: 3.5rem 2rem 3rem;
      background: linear-gradient(180deg, rgba(255, 23, 68, 0.04) 0%, #ffffff 100%);
      border: 1px solid #e5e0d7;
      border-radius: 20px;
      margin-bottom: 4rem;
      box-shadow: 0 8px 30px rgba(0, 0, 0, 0.04);
    }
    .hero-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.4rem 1rem;
      background: rgba(255, 23, 68, 0.08);
      color: #ff1744;
      font-size: 0.8rem;
      font-weight: 800;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      border-radius: 9999px;
      border: 1px solid rgba(255, 23, 68, 0.2);
      margin-bottom: 1.25rem;
    }
    .badge-dot {
      width: 7px;
      height: 7px;
      background: #ff1744;
      border-radius: 50%;
    }
    .hero-title {
      font-size: 2.5rem;
      line-height: 1.2;
      font-weight: 900;
      color: #09090c;
      max-width: 880px;
      margin: 0 auto 1.25rem;
      letter-spacing: -0.02em;
    }
    .hero-lead {
      font-size: 1.12rem;
      line-height: 1.65;
      color: #636058;
      max-width: 760px;
      margin: 0 auto 2.25rem;
    }
    .hero-cta-group {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 1rem;
      margin-bottom: 3rem;
    }
    .btn-hero-primary {
      display: inline-flex;
      align-items: center;
      gap: 0.6rem;
      padding: 0.95rem 1.9rem;
      background: #ff1744;
      color: #ffffff;
      border: none;
      border-radius: 12px;
      font-size: 1rem;
      font-weight: 800;
      cursor: pointer;
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 4px 18px rgba(255, 23, 68, 0.35);
    }
    .btn-hero-primary:hover {
      background: #d50000;
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(255, 23, 68, 0.5);
    }
    .btn-hero-secondary {
      display: inline-flex;
      align-items: center;
      gap: 0.6rem;
      padding: 0.95rem 1.7rem;
      background: #ffffff;
      color: #09090c;
      border: 1px solid #d6d0c4;
      border-radius: 12px;
      font-size: 0.95rem;
      font-weight: 700;
      text-decoration: none;
      transition: all 0.25s ease;
    }
    .btn-hero-secondary:hover {
      border-color: #ff1744;
      color: #ff1744;
      background: #faf8f4;
      transform: translateY(-2px);
    }

    /* Mètriques */
    .pro-stats-strip {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
      gap: 1.5rem;
      padding-top: 2.25rem;
      border-top: 1px solid #ede8df;
    }
    .stat-item {
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .stat-number {
      font-size: 2.1rem;
      font-weight: 900;
      color: #ff1744;
      line-height: 1;
      margin-bottom: 0.45rem;
    }
    .stat-label {
      font-size: 0.86rem;
      color: #636058;
      font-weight: 600;
      text-align: center;
      line-height: 1.4;
    }

    /* Encapçalaments de secció */
    .section-heading {
      text-align: center;
      max-width: 740px;
      margin: 0 auto 3rem;
    }
    .section-tag {
      display: inline-block;
      font-size: 0.78rem;
      font-weight: 800;
      color: #ff1744;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      margin-bottom: 0.5rem;
    }
    .section-heading h2 {
      font-size: 2.1rem;
      font-weight: 900;
      color: #09090c;
      margin: 0 0 0.85rem;
      letter-spacing: -0.02em;
    }
    .section-heading p {
      font-size: 1.05rem;
      color: #636058;
      line-height: 1.6;
      margin: 0;
    }

    /* Graella de raons */
    .reasons-section {
      margin-bottom: 5rem;
    }
    .reasons-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr));
      gap: 1.75rem;
    }
    .reason-card {
      background: #ffffff;
      border: 1px solid #e5e0d7;
      border-radius: 16px;
      padding: 2.2rem 2rem;
      transition: all 0.25s ease;
      box-shadow: 0 4px 18px rgba(0, 0, 0, 0.03);
    }
    .reason-card:hover {
      border-color: #ff1744;
      transform: translateY(-4px);
      box-shadow: 0 12px 30px rgba(0, 0, 0, 0.08);
    }
    .reason-icon-wrapper {
      width: 56px;
      height: 56px;
      border-radius: 14px;
      background: rgba(255, 23, 68, 0.08);
      border: 1px solid rgba(255, 23, 68, 0.18);
      color: #ff1744;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 1.35rem;
    }
    .reason-card h3 {
      font-size: 1.25rem;
      font-weight: 800;
      color: #09090c;
      margin: 0 0 0.75rem;
    }
    .reason-card p {
      font-size: 0.95rem;
      line-height: 1.65;
      color: #636058;
      margin: 0;
    }
    .reason-card strong {
      color: #09090c;
    }

    /* Taula comparativa */
    .comparison-section {
      margin-bottom: 5rem;
      background: #ffffff;
      border: 1px solid #e5e0d7;
      border-radius: 20px;
      padding: 3.5rem 2.5rem;
      box-shadow: 0 8px 30px rgba(0, 0, 0, 0.03);
    }
    .table-responsive {
      overflow-x: auto;
    }
    .comparison-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
      font-size: 0.95rem;
    }
    .comparison-table th {
      padding: 1.1rem 1.4rem;
      background: #faf8f4;
      color: #09090c;
      font-weight: 800;
      border-bottom: 2px solid #e5e0d7;
      font-size: 0.95rem;
    }
    .comparison-table th.col-avisa {
      background: rgba(255, 23, 68, 0.08);
      color: #ff1744;
      border-bottom-color: #ff1744;
      border-left: 2px solid #ff1744;
      border-right: 2px solid #ff1744;
    }
    .comparison-table td {
      padding: 1.1rem 1.4rem;
      border-bottom: 1px solid #ede8df;
      color: #636058;
    }
    .comparison-table td strong {
      color: #09090c;
    }
    .comparison-table td.col-avisa {
      background: rgba(255, 23, 68, 0.02);
      font-weight: 700;
      color: #09090c;
      border-left: 2px solid #ff1744;
      border-right: 2px solid #ff1744;
    }
    .badge-win {
      display: inline-block;
      padding: 0.3rem 0.7rem;
      background: #ecfdf5;
      color: #059669;
      border: 1px solid #a7f3d0;
      border-radius: 6px;
      font-weight: 800;
      font-size: 0.85rem;
    }

    /* Blog / Guies */
    .pro-blog-section {
      margin-bottom: 5rem;
    }
    .guides-accordion {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
    .guide-card {
      background: #ffffff;
      border: 1px solid #e5e0d7;
      border-radius: 16px;
      overflow: hidden;
      transition: all 0.25s ease;
      box-shadow: 0 4px 18px rgba(0, 0, 0, 0.02);
    }
    .guide-card:hover {
      border-color: #d6d0c4;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.05);
    }
    .guide-header {
      padding: 1.8rem 2.2rem;
      cursor: pointer;
      user-select: none;
    }
    .guide-meta-top {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 0.6rem;
    }
    .guide-cat-badge {
      display: inline-block;
      padding: 0.25rem 0.65rem;
      background: rgba(255, 23, 68, 0.08);
      color: #ff1744;
      font-size: 0.72rem;
      font-weight: 800;
      text-transform: uppercase;
      border-radius: 6px;
    }
    .guide-read-time {
      font-size: 0.82rem;
      color: #8c887b;
      font-weight: 500;
    }
    .guide-header h3 {
      font-size: 1.35rem;
      font-weight: 800;
      color: #09090c;
      margin: 0 0 0.4rem;
      line-height: 1.35;
    }
    .guide-subtitle {
      font-size: 0.98rem;
      color: #636058;
      margin: 0 0 1rem;
      line-height: 1.5;
    }
    .guide-toggle-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      font-size: 0.88rem;
      font-weight: 700;
      color: #ff1744;
    }
    .guide-toggle-btn svg {
      transition: transform 0.25s ease;
    }
    .guide-toggle-btn svg.rotated {
      transform: rotate(180deg);
    }

    .guide-content-body {
      padding: 0 2.2rem 2.2rem;
      border-top: 1px solid #ede8df;
      animation: fadeIn 0.3s ease;
    }
    .guide-cover-img {
      width: 100%;
      max-height: 340px;
      object-fit: cover;
      border-radius: 12px;
      margin: 1.75rem 0 1.5rem;
    }
    .guide-paragraphs p {
      font-size: 1rem;
      line-height: 1.75;
      color: #4b5563;
      margin-bottom: 1rem;
    }
    .guide-checklist {
      background: #faf8f4;
      border-left: 4px solid #ff1744;
      padding: 1.35rem 1.6rem;
      border-radius: 8px;
      margin: 1.75rem 0;
    }
    .guide-checklist strong {
      display: block;
      color: #09090c;
      font-weight: 800;
      margin-bottom: 0.75rem;
      font-size: 1rem;
    }
    .guide-checklist ul {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      color: #4b5563;
      font-size: 0.95rem;
    }
    .guide-callout {
      display: flex;
      align-items: flex-start;
      gap: 0.85rem;
      background: rgba(255, 23, 68, 0.05);
      border: 1px solid rgba(255, 23, 68, 0.15);
      padding: 1.1rem 1.4rem;
      border-radius: 10px;
      font-size: 0.95rem;
      color: #09090c;
    }
    .callout-icon {
      font-size: 1.25rem;
      line-height: 1;
    }
    .guide-callout p {
      margin: 0;
      line-height: 1.6;
    }

    /* Testimonis */
    .testimonials-section {
      margin-bottom: 5rem;
    }
    .testimonials-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(310px, 1fr));
      gap: 1.75rem;
    }
    .testi-card {
      background: #ffffff;
      border: 1px solid #e5e0d7;
      border-radius: 16px;
      padding: 2.2rem 2rem;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      box-shadow: 0 4px 18px rgba(0, 0, 0, 0.03);
      transition: all 0.25s ease;
    }
    .testi-card:hover {
      border-color: #ff1744;
      transform: translateY(-4px);
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
    }
    .testi-stars {
      color: #f59e0b;
      font-size: 1.25rem;
      letter-spacing: 2px;
      margin-bottom: 1.1rem;
    }
    .testi-quote {
      font-size: 0.95rem;
      line-height: 1.65;
      color: #4b5563;
      font-style: italic;
      margin: 0 0 1.75rem;
    }
    .testi-author {
      display: flex;
      align-items: center;
      gap: 0.95rem;
    }
    .testi-avatar {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      object-fit: cover;
      border: 2px solid #ff1744;
    }
    .testi-author strong {
      display: block;
      color: #09090c;
      font-size: 0.98rem;
    }
    .testi-author span {
      font-size: 0.8rem;
      color: #636058;
    }

    /* CTA final */
    .final-pro-cta {
      background: linear-gradient(135deg, #09090c 0%, #1e1e24 100%);
      border: 1px solid #2d2d38;
      border-radius: 20px;
      padding: 4rem 2rem;
      text-align: center;
      box-shadow: 0 15px 40px rgba(0, 0, 0, 0.2);
    }
    .cta-mini-tag {
      display: inline-block;
      font-size: 0.78rem;
      font-weight: 800;
      color: #ff1744;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      margin-bottom: 1rem;
    }
    .cta-inner-card h2 {
      font-size: 2.2rem;
      color: #ffffff;
      font-weight: 900;
      margin: 0 auto 1rem;
      max-width: 780px;
      letter-spacing: -0.02em;
      line-height: 1.25;
    }
    .cta-inner-card p {
      font-size: 1.1rem;
      color: #cbd5e1;
      max-width: 640px;
      margin: 0 auto 2.25rem;
      line-height: 1.65;
    }
    .cta-actions {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1.25rem;
    }
    .btn-register-pro-big {
      padding: 1.05rem 2.6rem;
      background: #ff1744;
      color: #ffffff;
      border: none;
      border-radius: 12px;
      font-size: 1.05rem;
      font-weight: 900;
      cursor: pointer;
      transition: all 0.25s ease;
      box-shadow: 0 6px 20px rgba(255, 23, 68, 0.4);
    }
    .btn-register-pro-big:hover {
      background: #d50000;
      transform: translateY(-2px);
      box-shadow: 0 10px 30px rgba(255, 23, 68, 0.6);
    }
    .link-back-main {
      color: #94a3b8;
      text-decoration: none;
      font-size: 0.92rem;
      font-weight: 600;
      transition: color 0.2s;
    }
    .link-back-main:hover {
      color: #ffffff;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-6px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @media (max-width: 768px) {
      .pro-community-page {
        padding: 1rem 0.75rem 3.5rem;
      }
      .pro-hero-section {
        padding: 2rem 1rem 2.25rem;
        border-radius: 14px;
        margin-bottom: 2.5rem;
      }
      .hero-title {
        font-size: 1.55rem;
      }
      .hero-lead {
        font-size: 0.95rem;
        margin-bottom: 1.75rem;
      }
      .pro-stats-strip {
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
        padding-top: 1.5rem;
      }
      .stat-number {
        font-size: 1.6rem;
      }
      .stat-label {
        font-size: 0.78rem;
      }
      .section-heading h2 {
        font-size: 1.5rem;
      }
      .reasons-section, .comparison-section, .pro-blog-section, .testimonials-section {
        margin-bottom: 3rem;
      }
      .reason-card {
        padding: 1.5rem 1.15rem;
        border-radius: 14px;
      }
      .comparison-section {
        padding: 1.75rem 1rem;
        border-radius: 14px;
      }
      .comparison-table th, .comparison-table td {
        padding: 0.75rem 0.65rem;
        font-size: 0.82rem;
      }
      .guide-header {
        padding: 1.25rem 1rem;
      }
      .guide-header h3 {
        font-size: 1.15rem;
      }
      .guide-content-body {
        padding: 0 1rem 1.5rem;
      }
      .testi-card {
        padding: 1.5rem 1.15rem;
        border-radius: 14px;
      }
      .final-pro-cta {
        padding: 2.25rem 1.15rem;
        border-radius: 14px;
      }
      .cta-inner-card h2 {
        font-size: 1.45rem;
      }
      .cta-inner-card p {
        font-size: 0.95rem;
      }
      .btn-hero-primary, .btn-hero-secondary, .btn-register-pro-big {
        width: 100%;
        justify-content: center;
      }
    }
  `]
})
export class ComunitatProfessionalsComponent implements OnInit {
  guiaOberta: string = 'guia-1';

  guiesProfessionals: GuiaProfessional[] = [
    {
      id: 'guia-1',
      titol: 'Com convertir incidències en tasques rendibles: L\'estratègia del pressupost clar',
      subtitol: 'Claus per redactar propostes que transmetin confiança i aconseguir un 80% d\'acceptació del client.',
      categoria: 'Estratègia de Negoci',
      tempsLectura: '4 min de lectura',
      imatge: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1000&q=80',
      contingut: [
        'Quan un client publica una incidència a AVISA (per exemple, una avaria de termo, un curtcircuit o una humitat), normalment busca tres coses: rapidesa de resposta, professionalitat i certesa en el cost final.',
        'Molts professionals cometen l\'error d\'enviar pressupostos amb una sola xifra sense cap detall. A AVISA hem comprovat que les ofertes que desglossen breument la mà d\'obra, el tipus de peces que s\'utilitzaran i el termini estimat d\'arribada tenen una taxa d\'acceptació quatre vegades superior.',
        'A més, un cop acceptada la proposta, la incidència es converteix en una TAREA oficial: això et garanteix que el client s\'ha compromès amb tu i que podràs contactar-lo immediatament per telèfon.'
      ],
      puntsClau: [
        'Indica sempre si el desplaçament està inclòs en el preu de l\'oferta.',
        'Explica la marca o qualitat dels materials que faràs servir per donar valor afegit.',
        'Ofereix garantia per escrit de la feina (per exemple, 2 anys en canonades o quadres).'
      ],
      destacat: 'Ser dels tres primers a enviar una proposta realista sobre una incidència oberta multiplica un 70% les teves opcions de ser l\'escollit.'
    },
    {
      id: 'guia-2',
      titol: 'Publicar Ofertes fixes: La fórmula per omplir els forats d\'agenda',
      subtitol: 'Per què crear packs de serveis tancats atreu clients que no volen esperar pressupostos llargs.',
      categoria: 'Captació Proactiva',
      tempsLectura: '3 min de lectura',
      imatge: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1000&q=80',
      contingut: [
        'El gran avantatge d\'AVISA és que no estàs limitat a esperar que algú publiqui una feina. El professional pot crear de manera proactiva les seves pròpies OFERTES públiques al mercat.',
        'Pensa en serveis recurrents amb preu tancat: "Revisió oficial de caldera i neteja de filtres (75€)", "Instal·lació de 5 portes lacades (980€)" o "Pintura de pis blanc llis 3 habitacions (750€)".',
        'Quan un client navega pel mercat i veu un pack que encaixa amb el que necessita, pot sol·licitar directament la teva oferta per convertir-la en TAREA. És una entrada contínua de feina sense haver de competir en una licitació oberta.'
      ],
      puntsClau: [
        'Posa títols clars amb el preu aproximat o tancat per generar atracció.',
        'Descriu exactament què inclou el servei (metres quadrats, capes de pintura, etc.).',
        'Mantingues les ofertes actualitzades segons la temporada (aire condicionat a l\'estiu, calefacció a la tardor).'
      ],
      destacat: 'Els professionals que mantenen 2 o 3 ofertes actives al mercat reben una mitjana de 4 contactes directes al mes sense necessitat de fer prospecció.'
    },
    {
      id: 'guia-3',
      titol: 'El poder de les ressenyes verificades: El teu millor anunci de pagament',
      subtitol: 'Com "coleccionar" tasques finalitzades per convertir-te en el professional de referència de la comarca.',
      categoria: 'Reputació Digital',
      tempsLectura: '4 min de lectura',
      imatge: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=1000&q=80',
      contingut: [
        'Avui dia, el 92% dels clients particulars consulten les opinions a internet abans de deixar entrar un paleta, lampista o electricista a casa seva.',
        'A diferència d\'altres directoris on qualsevol pot escriure ressenyes falses, a AVISA les valoracions estan 100% blindades: només un client que ha tingut una TAREA real finalitzada amb tu pot puntuar-te i escriure un comentari.',
        'Aquest sistema protegeix el teu prestigi contra atacs i converteix el teu perfil en un aparador irrebatible. Un perfil amb 10 ressenyes de 5 estrelles pot cobrar un 20% més de marge perquè el client prioritza la tranquil·litat i la confiança.'
      ],
      puntsClau: [
        'En acabar la feina, demana amablement al client que marqui la tasca com a Finalitzada des del seu panell.',
        'La puntualitat i la neteja de la zona de treball després de la reforma són els dos punts més valorats a les ressenyes.',
        'Respon sempre amb agraïment a les bones valoracions per mostrar professionalitat.'
      ],
      destacat: 'A AVISA, un professional amb més de 8 tasques finalitzades i 4.8 d\'estrelles apareix de forma destacada a la portada de la web i als suggeriments recomanats.'
    }
  ];

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  toggleGuia(id: string): void {
    this.guiaOberta = this.guiaOberta === id ? '' : id;
  }

  anarRegistrePro(): void {
    if (this.authService.isLoggedIn()) {
      if (this.authService.isProfessional()) {
        this.router.navigate(['/tasques-ofertes'], { queryParams: { tipus: 'tasques' } });
      } else {
        this.router.navigate(['/perfil']);
      }
      return;
    }
    this.router.navigate(['/registre'], { queryParams: { rol: 'professional' } });
  }
}
