/**
 * Rols d'usuari a la plataforma JJAUX amb model d'herència:
 * - 'client': Rol base. Requereix email i contrasenya. Pot publicar peticions i feines.
 * - 'professional': Fill del client. Hereta TOTES les funcions del client (publicar feines)
 *                   i a més requereix telèfon obligatori i pot resoldre peticions (enviar pressupostos).
 * - 'admin': Gestor global amb accés a la totalitat de tasques, ofertes i usuaris del sistema.
 */
export type RolUsuari = 'client' | 'professional' | 'admin';

/**
 * Model de dades de l'Usuari a la plataforma JJAUX.
 * Representa el perfil de qualsevol usuari registrat (Client, Professional o Administrador),
 * tant per a les dades públiques com per a la gestió del propi perfil privat.
 */
export interface Usuari {
  /** Identificador únic de l'usuari (ex: 'u-1', 'u-admin') */
  id: string;

  /** Nom visible complet o nom d'empresa */
  nom: string;

  /** Adreça de correu electrònic principal per a l'inici de sessió */
  email: string;

  /** Rol que defineix els permisos de l'usuari a la plataforma */
  rol: RolUsuari;

  /** Telèfon de contacte (obligatori per a professionals, opcional per a clients) */
  telefon?: string;

  /** Biografia, presentació o descripció d'habilitats del perfil */
  bio?: string;
}
