/**
 * Model de dades per als Pressupostos enviats pels professionals per a una incidència.
 * Registra la proposta econòmica, descripció del treball i durada estimada.
 * Quan el client accepta el pressupost, es crea la tasca i s'elimina la incidència en una operació transaccional.
 */
export interface Pressupost {
  id: string;
  incidenciaId: string;
  incidenciaTitol?: string;
  professionalId: string;
  professionalNom: string;
  preu: string;
  descripcio?: string;
  duracioEstimada?: string;
  dataCreacio?: string;
}

export interface CrearPressupostRequest {
  incidenciaId: string;
  professionalId?: string;
  professionalNom: string;
  preu: string;
  descripcio?: string;
  duracioEstimada?: string;
}

