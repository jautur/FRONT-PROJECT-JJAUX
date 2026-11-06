/**
 * Configuració d'entorn de desenvolupament.
 * Utilitza /api relatiu perquè les peticions passin a través del dev-server d'Angular
 * (proxyConfig a port 8080), permetent accés transparent tant des de localhost
 * com des de qualsevol mòbil connectat a la Wi-Fi sense bloquejos de Firewall.
 */
export const environment = {
  production: false,
  apiUrl: '/api',
  /** Comptes de prova del perfil dev del backend. Només existeixen en el build de desenvolupament. */
  accesRapid: [
    { etiqueta: 'AUTH.LOGIN.QUICK_CLIENT', usuari: 'cli', contrasenya: 'clicli' },
    { etiqueta: 'AUTH.LOGIN.QUICK_PRO', usuari: 'pro', contrasenya: 'propro' },
    { etiqueta: 'AUTH.LOGIN.QUICK_ADMIN', usuari: 'admin@admin.es', contrasenya: 'adminadmin' }
  ] as { etiqueta: string; usuari: string; contrasenya: string }[]
};
