/**
 * Tipus de rol permesos a la plataforma JJAUX:
 * - 'client': Pot publicar noves tasques i adjudicar ofertes rebudes.
 * - 'professional': Pot presentar pressupostos i postular a tasques disponibles.
 * - 'ambdos': Usuari híbrid amb permisos dobles (pot crear tasques i enviar ofertes).
 * - 'admin': Gestor global amb accés a la totalitat de tasques, ofertes i usuaris.
 */
export type RolUsuari = 'client' | 'professional' | 'ambdos' | 'admin';

/**
 * Model de dades de l'Usuari a la plataforma JJAUX.
 * Representa el perfil de qualsevol usuari registrat (Client, Professional, Ambdós o Administrador),
 * tant per a les dades públiques com per a la gestió del propi perfil privat.
 */
export interface Usuari {
  /** Identificador únic de l'usuari (ex: 'u-1') */
  id: string;

  /** Nom visible complet o nom d'empresa */
  nom: string;

  /** Adreça de correu electrònic principal per a l'inici de sessió */
  email: string;

  /** Rol que defineix els permisos de l'usuari a la plataforma */
  rol: RolUsuari;

  /** Telèfon de contacte opcional */
  telefon?: string;

  /** Biografia, presentació o descripció d'habilitats del perfil */
  bio?: string;
}
