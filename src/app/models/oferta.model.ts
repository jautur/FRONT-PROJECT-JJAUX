/**
 * Model de dades d'una Oferta o pressupost a la plataforma JJAUX.
 * Representa la candidatura i proposta econòmica presentada per un Professional
 * en resposta a una tasca publicada per un Client.
 */
export interface Oferta {
  /** Identificador únic de l'oferta (ex: 'O-201') */
  id: string;

  /** Identificador de la tasca a la qual fa referència (ex: 'T-101') */
  tascaId: string;

  /** Nom o identificador del professional que ha enviat l'oferta */
  professional: string;

  /** Import econòmic o pressupost ofertat (ex: '€320') */
  price: string;

  /** Nota explicativa, detall tècnic o condicions del servei */
  note?: string;

  /** Estat de la proposta ('Pendent', 'Acceptada', 'Rebutjada') */
  estat: string;
}
