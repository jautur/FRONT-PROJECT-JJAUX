/**
 * Model de dades de l'Usuari a la plataforma JJAUX.
 * Representa el perfil de qualsevol usuari registrat (Client, Professional o Administrador),
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
  rol: 'client' | 'professional' | 'admin';

  /** Telèfon de contacte opcional */
  telefon?: string;

  /** Biografia, presentació o descripció d'habilitats del perfil */
  bio?: string;
}
