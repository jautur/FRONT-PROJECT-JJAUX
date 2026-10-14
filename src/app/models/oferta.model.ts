/**
 * Model de dades d'una Oferta o pressupost a la plataforma AVISA.
 * Representa la candidatura i proposta econòmica presentada per un Professional
 * en resposta a una incidència publicada per un Client o com a oferta de servei públic.
 */
export interface Oferta {
  /** Identificador únic de l'oferta (ex: 'O-201') */
  id: string;

  /** Identificador de la tasca a la qual fa referència (ex: 'T-101') */
  tascaId: string;

  /** Identificador de la incidència a la qual fa referència (ex: 'I-101') */
  incidenciaId?: string;

  /** Nom o identificador del professional que ha enviat l'oferta */
  professional: string;

  /** Àlies per al nom del professional */
  professionalNom?: string;

  /** Categoria del servei */
  categoria?: string;

  /** Import econòmic o pressupost ofertat (ex: '€320') */
  price: string;

  /** Nota explicativa, detall tècnic o condicions del servei */
  note?: string;

  /** Camp opcional d'estat (les ofertes no tenen estat, sols s'accepten o es borren) */
  estat?: string;

  /** Data de creació */
  createdAt?: string;
}
