// Model de tasca.
// Representa una demanda creada per un client i gestionada per professionals.
// Camps esperats:
// - id, titol, descripcio, estat
// - poden existir camps addicionals com categoria, preu, dataLimit, clientId, etc.
// El backend exposa la lògica de tasques a /api/tasks o /api/tasques.
export interface Tasca {
  id: string;
  titol: string;
  descripcio: string;
  estat: 'oberta' | 'en_curs' | 'finalitzada';
}
