import { HttpResponse } from '@angular/common/http';

/**
 * Una pàgina d'un llistat del servidor (?size=&page=): els elements i el total, que arriba a la capçalera X-Total-Count.
 */
export interface Pagina<T> {
  elements: T[];
  /** Nombre total d'elements de tot el llistat, no només d'aquesta pàgina */
  total: number;
  /** Número de pàgina, des de 0 */
  pagina: number;
  /** Mida demanada de pàgina */
  mida: number;
}

/** Mida màxima de pàgina que accepta el servidor. */
export const MIDA_MAXIMA_PAGINA = 100;

/** Converteix la resposta HTTP paginada del servidor en una Pagina. */
export function aPagina<T>(resposta: HttpResponse<T[]>, pagina: number, mida: number): Pagina<T> {
  const elements = resposta.body ?? [];
  const total = Number(resposta.headers.get('X-Total-Count'));
  return { elements, total: Number.isFinite(total) && resposta.headers.has('X-Total-Count') ? total : elements.length, pagina, mida };
}
