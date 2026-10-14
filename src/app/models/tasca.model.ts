/**
 * Model de dades per a Incidències i Tasques a la plataforma AVISA.
 * - Incidència: Demanda oberta per un Client (sols té client, no té professional).
 * - Oferta: Servei proposat per un Professional (sols té professional).
 * - Tasca: Treball en curs on ja convergeixen Client i Professional obligatoris.
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

  /** Nom del client (obligatori en incidències i tasques) */
  client?: string;

  /** Àlies per al nom del client */
  clientNom?: string;

  /** Nom del professional assignat (obligatori en tasques, null en incidències obertes) */
  professional?: string;

  /** Àlies per al nom del professional */
  professionalNom?: string;

  /** Pressupost estimat pel client o preu acordat de la tasca */
  budget?: string;

  /** Estat ('Oberta' per a incidència, 'En curs' o 'Finalitzada' per a tasca) */
  estat: string;

  /** Distinció conceptual: 'incidencia' (sols client) o 'tasca' (client + professional) */
  tipus?: 'incidencia' | 'tasca' | 'oferta' | string;
}
