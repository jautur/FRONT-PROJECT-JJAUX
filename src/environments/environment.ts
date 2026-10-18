/**
 * Configuració d'entorn per defecte / producció.
 * Utilitza /api relatiu perquè les peticions passin a través del mateix amfitrió i port
 * (mitjançant proxy de desenvolupament o proxy invers de producció),
 * eliminant problemes de CORS i de Firewall en dispositius mòbils.
 */
export const environment = {
  production: true,
  apiUrl: '/api'
};
