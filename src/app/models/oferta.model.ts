// Model d'oferta.
// Una oferta és la proposta econòmica d'un professional sobre una tasca concreta.
// Camps esperats:
// - id: identificador
// - tascaId: tasca a la qual es presenta
// - professionalId: usuari professional que l'ofereix
// - import: preu o pressupost ofertat
// El backend pot exposar endpoints com /api/offers i /api/tasks/:id/offers.
export interface Oferta {
  id: string;
  tascaId: string;
  professionalId: string;
  import: number;
}
