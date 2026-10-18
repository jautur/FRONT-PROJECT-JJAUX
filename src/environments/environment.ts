/**
 * Configuració d'entorn per defecte / producció.
 * Utilitza l'amfitrió actual si està definit o localhost per defecte.
 */
const host = typeof window !== 'undefined' && window.location.hostname ? window.location.hostname : 'localhost';

export const environment = {
  production: true,
  apiUrl: `http://${host}:8080/api`
};
