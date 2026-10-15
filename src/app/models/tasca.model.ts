/**
 * Model de dades per a Incidències i Tasques a la plataforma AVISA.
 * - Incidència: Demanda oberta per un Client (sols té client, no té professional).
 * - Oferta: Servei proposat per un Professional (sols té professional).
 * - Tasca: Treball en curs on ja convergeixen Client i Professional obligatoris.
 * Les tasques finalitzades guarden directament la valoració (1-5) i l'opinió del client,
 * actuant directament com les valoracions/ressenyes públiques del professional.
 */
export interface Tasca {
  /** Identificador únic (ex: 'T-101') */
  id: string;

  /** Títol breu i descriptiu de la tasca o incidència */
  titol: string;

  /** Explicació detallada dels requeriments */
  descripcio: string;

  /** Categoria professional (ex: 'Reformes i Obres', 'Lampisteria', etc.) */
  categoria?: string;

  /** Identificador únic de l'usuari client */
  clientId?: string;

  /** Nom del client (obligatori en incidències i tasques) */
  client?: string;

  /** Àlies per al nom del client */
  clientNom?: string;

  /** Identificador únic de l'usuari professional */
  professionalId?: string;

  /** Nom del professional assignat (obligatori en tasques, null en incidències obertes) */
  professional?: string;

  /** Àlies per al nom del professional */
  professionalNom?: string;

  /** Identificador de l'oferta o incidència d'origen */
  origenId?: string;

  /** Pressupost estimat pel client o preu acordat de la tasca */
  budget?: string;

  /** Estat ('En curs' o 'Finalitzada' per a tasques; les incidències no tenen estat) */
  estat?: string;

  /** Distinció conceptual: 'incidencia' (sols client) o 'tasca' (client + professional) */
  tipus?: 'incidencia' | 'tasca' | 'oferta' | string;

  /** Puntuació atorgada pel client en finalitzar la tasca (1 a 5 estrelles) */
  valoracio?: number | null;

  /** Comentari breu o opinió del client en finalitzar la tasca */
  opinio?: string | null;

  /** Data i hora de creació */
  createdAt?: string;
}
