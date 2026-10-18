import { Injectable, signal, computed } from '@angular/core';
import { SupportedLang, TRANSLATIONS } from '../i18n';

/**
 * Servei reactiu ultralleuger d'internacionalització basat en Signals d'Angular 18.
 *
 * Avantatges per a Google Lighthouse:
 * 1. 0 peticions de xarxa adicionals: els diccionaris es compilen al paquet sense retards.
 * 2. 0 Cumulative Layout Shift (CLS): les cadenes es resolen sincrònicament en renderitzar.
 * 3. 0 Total Blocking Time (TBT): actualització quirúrgica per Signals sense zones brutes.
 * 4. Millora de SEO i Accessibilitat: actualitza dinàmicament l'atribut `lang` a l'element <html>.
 */
@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  /** Estat reactiu de l'idioma seleccionat (per defecte: Valencià 'VA') */
  readonly currentLang = signal<SupportedLang>('VA');

  /** Diccionari actiu computat de forma reactiva */
  readonly currentDictionary = computed(() => TRANSLATIONS[this.currentLang()]);

  constructor() {
    this.inicialitzarIdioma();
  }

  /**
   * Inicialitza l'idioma des de localStorage o utilitza el predeterminat ('VA').
   */
  private inicialitzarIdioma(): void {
    if (typeof localStorage !== 'undefined') {
      const guardat = localStorage.getItem('avisa_lang') as SupportedLang | null;
      if (guardat && (guardat === 'VA' || guardat === 'ES' || guardat === 'EN')) {
        this.currentLang.set(guardat);
      }
    }
    this.actualitzarAtributHtmlLang(this.currentLang());
  }

  /**
   * Canvia l'idioma actiu de l'aplicació, el desa a localStorage i ajusta l'atribut HTML.
   */
  setLanguage(lang: SupportedLang): void {
    if (lang !== this.currentLang()) {
      this.currentLang.set(lang);
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('avisa_lang', lang);
      }
      this.actualitzarAtributHtmlLang(lang);
    }
  }

  /**
   * Obté l'idioma actual.
   */
  getLanguage(): SupportedLang {
    return this.currentLang();
  }

  /**
   * Retorna el text traduït per a una clau donada (ex: 'NAV.MENU', o 'Lampisteria') amb suport per a paràmetres ({{param}}).
   */
  t(key: string, params?: Record<string, string | number>): string {
    if (!key) return '';
    const lang = this.currentLang();
    let text = this.buscarClau(TRANSLATIONS[lang], key);

    // Fallback a Valencià (idioma primari) si manca la clau en l'idioma seleccionat
    if (text === undefined && lang !== 'VA') {
      text = this.buscarClau(TRANSLATIONS['VA'], key);
    }

    if (text === undefined) {
      return key;
    }

    if (params) {
      for (const [paramKey, paramVal] of Object.entries(params)) {
        text = text.replace(new RegExp(`{{\\s*${paramKey}\\s*}}`, 'g'), String(paramVal));
      }
    }

    return text;
  }

  /**
   * Tradueix el nom d'una categoria de servei al idioma actual.
   */
  translateCategory(category: string): string {
    if (!category) return '';
    return this.t(`CATEGORIES.${category}`) || category;
  }

  /**
   * Tradueix un estat de tasca o oferta al idioma actual.
   */
  translateStatus(status: string): string {
    if (!status) return '';
    return this.t(`STATUS.${status}`) || status;
  }

  /**
   * Cerca recursivament una clau separada per punts dins d'un objecte diccionari.
   * Si no té punts, cerca també dins de CATEGORIES, STATUS i COMMON com a drecera.
   */
  private buscarClau(obj: any, path: string): string | undefined {
    if (!obj || !path) return undefined;

    if (!path.includes('.')) {
      if (obj.CATEGORIES && path in obj.CATEGORIES) {
        return obj.CATEGORIES[path];
      }
      if (obj.STATUS && path in obj.STATUS) {
        return obj.STATUS[path];
      }
      if (obj.COMMON && path in obj.COMMON) {
        return obj.COMMON[path];
      }
      if (path in obj) {
        const val = obj[path];
        if (typeof val === 'string') return val;
      }
    }

    const parts = path.split('.');
    let actual: any = obj;
    for (const part of parts) {
      if (actual && typeof actual === 'object' && part in actual) {
        actual = actual[part];
      } else {
        return undefined;
      }
    }
    return typeof actual === 'string' ? actual : undefined;
  }

  /**
   * Actualitza l'atribut `lang` de la capçalera <html> per optimitzar el SEO i Lighthouse.
   */
  private actualitzarAtributHtmlLang(lang: SupportedLang): void {
    if (typeof document !== 'undefined' && document.documentElement) {
      const codeMap: Record<SupportedLang, string> = {
        VA: 'ca-valencia',
        ES: 'es',
        EN: 'en'
      };
      document.documentElement.lang = codeMap[lang] || 'ca';
    }
  }
}

