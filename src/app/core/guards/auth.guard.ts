// Guard genèric d'autenticació.
// Aquest fitxer ha de verificar si l'usuari està autenticat abans d'accedir a qualsevol ruta protegida.
// Lògica esperada:
// - comprovar si hi ha token JWT a localStorage/sessionStorage
// - validar si el token no ha expirat
// - redirigir a /login si no està autenticat
// - permetre l'accés si el token és vàlid
export class AuthGuard {}
