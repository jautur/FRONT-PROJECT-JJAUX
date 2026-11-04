/**
 * Sol·licitud de cancel·lació d'una tasca en curs i la seua resolució per un administrador.
 */
export type ResolucioCancellacio = 'SENSE_CONSEQUENCIES' | 'NEGLIGENCIA' | 'REBUTJADA';

export interface SollicitudCancellacio {
  id: string;
  tascaId: string;
  tascaTitol?: string;
  sollicitantId: string;
  sollicitantNom?: string;
  motiu: string;
  /** Buit mentre està pendent de resoldre */
  resolucio?: ResolucioCancellacio | null;
  /** Només en cas de negligència: el client o el professional de la tasca */
  responsableId?: string | null;
  responsableNom?: string | null;
  adminId?: string | null;
  dataResolucio?: string | null;
  createdAt: string;
}
