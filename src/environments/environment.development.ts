/**
 * Configuració d'entorn de desenvolupament.
 * Detecta dinàmicament l'amfitrió (host) per permetre connexions locals tant
 * des del navegador de l'ordinador (localhost) com des de dispositius mòbils
 * connectats a la mateixa xarxa Wi-Fi (ex: 192.168.1.200:4200 connectant a 192.168.1.200:8080).
 */
const host = typeof window !== 'undefined' && window.location.hostname ? window.location.hostname : 'localhost';

export const environment = {
  production: false,
  apiUrl: `http://${host}:8080/api`
};
