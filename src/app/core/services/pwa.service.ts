import { Injectable, inject, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

/**
 * Interfície auxiliar per a l'esdeveniment beforeinstallprompt de navegadors Chromium.
 */
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

@Injectable({
  providedIn: 'root'
})
export class PwaService {
  private readonly platformId = inject(PLATFORM_ID);
  private deferredPrompt: BeforeInstallPromptEvent | null = null;
  private readonly STORAGE_KEY = 'avisa_pwa_dismissed_at';

  /** Indica si la PWA ja s'està executant en mode instal·lat (standalone / pantalla completa) */
  readonly isStandalone = signal<boolean>(false);

  /** Indica si el navegador admet la instal·lació nativa (Chromium / Android) */
  readonly canInstall = signal<boolean>(false);

  /** Indica si l'usuari és a iOS Safari i no està en mode standalone */
  readonly isIosSafari = signal<boolean>(false);

  /** Controla la visibilitat del component o banner d'instal·lació */
  readonly showPrompt = signal<boolean>(false);

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.initPwaTracking();
    }
  }

  /**
   * Inicialitza la detecció del mode de visualització i els listeners del navegador.
   */
  private initPwaTracking(): void {
    const standalone = this.checkIfStandalone();
    this.isStandalone.set(standalone);

    if (standalone) {
      return; // Ja està instal·lada i en execució independent; no cal mostrar guies
    }

    // Comprovació d'iOS Safari
    const isIos = this.checkIfIosSafari();
    this.isIosSafari.set(isIos);

    // Escolta de l'esdeveniment Chromium / Android per a instal·lació immediata
    window.addEventListener('beforeinstallprompt', (e: Event) => {
      e.preventDefault();
      this.deferredPrompt = e as BeforeInstallPromptEvent;
      this.canInstall.set(true);

      // Si no ha sigut descartat recentment, mostra el banner d'instal·lació
      if (!this.isDismissedRecently()) {
        this.showPrompt.set(true);
      }
    });

    // Escolta de la instal·lació completada amb èxit
    window.addEventListener('appinstalled', () => {
      this.deferredPrompt = null;
      this.canInstall.set(false);
      this.showPrompt.set(false);
      this.isStandalone.set(true);
      try {
        localStorage.removeItem(this.STORAGE_KEY);
      } catch {}
    });

    // En iOS Safari, si no està instal·lat i no s'ha descartat recentment, mostrem la guia
    if (isIos && !this.isDismissedRecently()) {
      // Donem un petit respir de 2 segons perquè l'usuari vegi la pàgina abans de suggerir
      setTimeout(() => {
        if (!this.isStandalone()) {
          this.showPrompt.set(true);
        }
      }, 2000);
    }
  }

  /**
   * Comprova si la finestra actual s'està executant en mode aplicació standalone.
   */
  checkIfStandalone(): boolean {
    if (!isPlatformBrowser(this.platformId)) {
      return false;
    }

    const isStandaloneMedia = window.matchMedia('(display-mode: standalone)').matches;
    const isNavigatorStandalone = (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    const isAndroidApp = document.referrer.includes('android-app://');

    return isStandaloneMedia || isNavigatorStandalone || isAndroidApp;
  }

  /**
   * Detecta si el dispositiu és iOS (iPhone, iPad, iPod) i s'executa a Safari mòbil.
   */
  private checkIfIosSafari(): boolean {
    if (!isPlatformBrowser(this.platformId)) {
      return false;
    }

    const ua = window.navigator.userAgent.toLowerCase();
    const isIos = /iphone|ipad|ipod/.test(ua);
    const isWebKit = /webkit/.test(ua);
    const isOtherBrowserOnIos = /crios|fxios|optios|edgios/.test(ua);

    return isIos && isWebKit && !isOtherBrowserOnIos && !this.checkIfStandalone();
  }

  /**
   * Comprova si l'usuari ha tancat el suggeriment d'instal·lació durant els darrers 3 dies.
   */
  private isDismissedRecently(): boolean {
    try {
      const dismissed = localStorage.getItem(this.STORAGE_KEY);
      if (!dismissed) return false;
      const timestamp = parseInt(dismissed, 10);
      const threeDaysMs = 3 * 24 * 60 * 60 * 1000;
      return Date.now() - timestamp < threeDaysMs;
    } catch {
      return false;
    }
  }

  /**
   * Dispara el prompt natiu d'instal·lació del navegador (Android / Chrome / Edge).
   */
  async promptInstall(): Promise<boolean> {
    if (!this.deferredPrompt) {
      return false;
    }

    try {
      await this.deferredPrompt.prompt();
      const choice = await this.deferredPrompt.userChoice;
      this.deferredPrompt = null;
      this.canInstall.set(false);
      this.showPrompt.set(false);
      return choice.outcome === 'accepted';
    } catch (err) {
      console.warn('Error al disparar el prompt d\'instal·lació de la PWA:', err);
      return false;
    }
  }

  /**
   * Tanca el banner d'instal·lació i desa la preferència per a no importunar l'usuari.
   */
  dismissPrompt(): void {
    this.showPrompt.set(false);
    try {
      localStorage.setItem(this.STORAGE_KEY, Date.now().toString());
    } catch {}
  }

  /**
   * Permet obrir manualment el panell d'instal·lació (ex: des d'un botó a la landing o al menú).
   */
  openInstallGuide(): void {
    this.showPrompt.set(true);
  }
}
