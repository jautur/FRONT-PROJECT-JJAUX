// Model de proposta.
// Representa l'estat d'una oferta dins del procés de selecció o contractació.
// Camps esperats:
// - id
// - ofertaId
// - estat: pendent, acceptada o rebutjada
// El backend pot gestionar l'acceptació o rebuig mitjançant /api/proposals o /api/offers/:id/proposal.
export interface Proposta {
  id: string;
  ofertaId: string;
  estat: 'pendent' | 'acceptada' | 'rebutjada';
}
