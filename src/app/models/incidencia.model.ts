/**
 * Model de dades per a una Incidència a la plataforma AVISA.
 * Les incidències són creades exclusivament per clients (demandes d'ajuda, avaries o projectes).
 * Sols tenen client (no tenen professional assignat).
 */
export interface Incidencia {
  /** Identificador únic (ex: 'I-101') */
  id: string;

  /** Identificador de l'usuari client */
  clientId?: string;

  /** Nom de l'usuari client */
  clientNom?: string;

  /** Àlies per al nom del client */
  client?: string;

  /** Títol breu de la necessitat o avaria */
  titol: string;

  /** Descripció detallada */
  descripcio: string;

  /** Categoria o gremi professional */
  categoria: string;

  /** Pressupost màxim orientatiu */
  budget: string;

  /** Estat de la incidència ('Oberta', 'Assignada', 'Cancel·lada') */
  estat: string;

  /** Data de creació */
  createdAt?: string;
}

/**
 * Dades requerides per crear una incidència.
 */
export interface CrearIncidenciaDTO {
  titol: string;
  descripcio: string;
  categoria: string;
  client: string;
  clientId?: string;
  budget: string;
  estat?: string;
}

