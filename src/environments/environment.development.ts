/**
 * Configuració d'entorn de desenvolupament.
 * Utilitza /api relatiu perquè les peticions passin a través del dev-server d'Angular
 * (proxyConfig a port 8080), permetent accés transparent tant des de localhost
 * com des de qualsevol mòbil connectat a la Wi-Fi sense bloquejos de Firewall.
 */
export const environment = {
  production: false,
  apiUrl: '/api'
};
