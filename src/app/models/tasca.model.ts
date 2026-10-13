/**
 * Model de dades de la Tasca a la plataforma JJAUX.
 * Representa una demanda o encàrrec publicat per un Client que pot rebre
 * ofertes econòmiques i propostes per part de diversos Professionals.
 */
export interface Tasca {
  /** Identificador únic de la tasca (ex: 'T-101') */
  id: string;

  /** Títol breu i descriptiu de la tasca */
  titol: string;

  /** Explicació detallada dels requeriments */
  descripcio: string;

  /** Categoria professional (ex: 'Web', 'Branding', 'Multimèdia', etc.) */
  categoria?: string;

  /** Nom de l'usuari client que ha publicat la tasca */
  client?: string;

  /** Pressupost orientatiu o estimat pel client (ex: '€350') */
  budget?: string;

  /** Estat del cicle de vida de la tasca ('Oberta', 'En curs', 'Finalitzada') */
  estat: string;
}
