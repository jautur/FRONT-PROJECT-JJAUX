/**
 * Model de dades per als Interessos expressats pels clients en ofertes dels professionals.
 * Registra quan un client manifesta interés en una oferta específica.
 * El professional pot acceptar (generant la tasca) o rebutjar l'interés.
 */
export interface Interes {
  id: string;
  publicacioId: string;
  publicacioTitol?: string;
  clientId: string;
  clientNom: string;
  missatge?: string;
  tascaId?: string;
  dataCreacio?: string;
}

export interface CrearInteresRequest {
  publicacioId: string;
  clientId?: string;
  clientNom: string;
  missatge?: string;
}
