/**
 * Model que representa un registre de la llista negra de telèfons.
 */
export interface BlacklistTelefon {
  id: string;
  telefon: string;
  motiu?: string;
  bloquejatPer?: string;
  createdAt?: string;
}

