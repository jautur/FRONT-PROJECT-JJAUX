// Model d'avís o notificació.
// S'utilitza per mostrar alertes, notificacions o missatges d'importància dins l'aplicació.
// Camps esperats:
// - id
// - missatge: text principal
// - data: data d'emissió
// El backend pot retornar avisos a /api/notifications, /api/alerts o /api/avisos.
export interface Avis {
  id: string;
  missatge: string;
  data: Date;
}
