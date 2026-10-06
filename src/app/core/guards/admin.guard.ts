// Guard per a rols d'administrador.
// Ha de restringir l'accés a les pàgines d'administració, per exemple /admin/*.
// Lògica esperada:
// - verificar autenticació a través d'AuthGuard
// - comprovar que l'usuari té rol "admin"
// - bloquejar l'accés i redirigir si no és administrador
// El backend ha de retornar el rol dins del JWT o de la resposta de /api/auth/me.
export class AdminGuard {}
