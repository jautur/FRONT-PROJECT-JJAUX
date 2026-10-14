/**
 * Model de dades per a una Ressenya o Valoració de servei.
 * Representa la puntuació (1 a 5 punts) i comentari que un Client atorga a un Treballador/Professional.
 */
export interface Resenya {
  /** Identificador únic de la ressenya (p. ex. 'R-001') */
  id: string;

  /** Identificador de l'usuari client que escriu la ressenya (FK a usuaris) */
  clientId: string;

  /** Nom visible del client (per a visualització ràpida amb JOINs) */
  clientNom?: string;

  /** Identificador de l'usuari treballador/professional valorat (FK a usuaris) */
  treballadorId: string;

  /** Nom visible del treballador valorat */
  treballadorNom?: string;

  /** Identificador opcional de la tasca sobre la qual s'ha realitzat la feina */
  tascaId?: string;

  /** Puntuació de 1 a 5 punts (CHECK constraint) */
  puntuacio: number;

  /** Text o descripció detallada de l'opinió del client */
  descripcio: string;

  /** Data i hora de creació */
  createdAt?: string;
}

/**
 * Dades necessàries per a crear una nova ressenya.
 */
export interface CrearResenyaDTO {
  clientId: string;
  treballadorId: string;
  tascaId?: string;
  puntuacio: number;
  descripcio: string;
}

