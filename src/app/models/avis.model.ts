/**
 * Model que representa una notificació o avís del sistema per a la plataforma JJAUX.
 * S'utilitza per notificar als usuaris (clients i professionals) esdeveniments clau:
 * - Recepció d'un nou pressupost o oferta.
 * - Acceptació o rebuig d'un pressupost.
 * - Finalització d'un projecte o tasca.
 */
export interface Avis {
  /** Identificador únic de l'avís (ex: 'A-301') */
  id: string;
  /** Identificador de l'usuari receptor de la notificació */
  usuariId?: string;
  /** Contingut detallat del missatge o avís */
  missatge: string;
  /** Indicador si l'avís ha estat llegit o continua pendent */
  llegit?: boolean;
  /** Data i hora d'emissió de la notificació */
  data: string | Date;
}
