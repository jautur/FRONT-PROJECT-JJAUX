/**
 * Mòdul d'internacionalització lleuger (i18n) per a AVISA.
 * Exporta els tipus d'idiomes suportats i els diccionaris compilats.
 */
import { va } from './va';
import { es } from './es';
import { en } from './en';

export type SupportedLang = 'VA' | 'ES' | 'EN';

export const TRANSLATIONS: Record<SupportedLang, typeof va> = {
  VA: va,
  ES: es,
  EN: en
};

export { va, es, en };
