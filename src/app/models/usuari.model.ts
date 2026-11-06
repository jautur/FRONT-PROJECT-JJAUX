/**
 * Rols d'usuari a la plataforma AVISA amb model d'herència:
 * - 'CLIENT': Rol base. Requereix email i contrasenya. Pot publicar peticions i feines.
 * - 'PROFESSIONAL': Fill del client. Hereta TOTES les funcions del client (publicar feines)
 *                   i a més requereix telèfon obligatori i pot resoldre peticions (enviar pressupostos).
 * - 'ADMIN': Gestor global amb accés a la totalitat de tasques, ofertes i usuaris del sistema.
 */
export type RolUsuari = 'CLIENT' | 'PROFESSIONAL' | 'ADMIN';

/**
 * Model de dades de l'Usuari a la plataforma AVISA.
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

  /** Percentil de comissió reservat per a la plataforma (0-100, per defecte 3) */
  percentil?: number;

  /** Indica si el professional ha estat oficialment verificat per l'administrador mitjançant trucada */
  verificat?: boolean;

  /** Indica si hi ha una sol·licitud de verificació pendent de comprovació telefònica */
  sollicitudVerificacio?: boolean;

  /** Foto de perfil pròpia, servida pel backend (/api/imatges/...) */
  fotoUrl?: string;

  /** Logotip propi, servit pel backend (/api/imatges/...) */
  logoUrl?: string;

  /** Token JWT d'autenticació i sessió de l'usuari */
  token?: string;
}

/** Imatges pròpies d'un usuari: la ruta de POST/DELETE /api/users/{id}/{tipus}. */
export type TipusImatge = 'foto' | 'logo';

/** Resposta de la pujada d'una imatge. */
export interface ImatgePujada {
  /** Versió de 512 px pel costat llarg (detall) */
  url: string;
  /** Versió de 128 px pel costat llarg (llistats i avatars xicotets) */
  urlPetita: string;
}

/** Formats que accepta el backend (els reconeix pel contingut, no pel tipus que diu el navegador). */
export const FORMATS_IMATGE = ['image/jpeg', 'image/png', 'image/webp'];

/** Mida màxima per defecte al backend (AVISA_IMATGES_MAX_BYTES); el servidor és qui mana. */
export const MAX_BYTES_IMATGE = 5 * 1024 * 1024;

/**
 * URL de la versió petita: la mateixa amb "-petita" abans de l'extensió.
 * /api/imatges/<uuid>.jpg → /api/imatges/<uuid>-petita.jpg
 */
export function urlImatgePetita(url?: string | null): string | null {
  if (!url) return null;
  if (url.includes('-petita.')) return url;
  return url.replace(/\.(jpg|png)$/, '-petita.$1');
}
