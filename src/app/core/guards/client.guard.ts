// Guard per a clients.
// Aquest fitxer ha de protegir les vistes del client, per exemple /client/*.
// Lògica esperada:
// - assegurar que l'usuari està autenticat
// - validar que el rol sigui "client"
// - redirigir a /login o a /professional si el perfil no coincideix
// El backend ha d'assignar les tasques i permisos segons l'usuari autenticat.
export class ClientGuard {}
