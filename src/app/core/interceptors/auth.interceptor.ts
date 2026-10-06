// Interceptor HTTP d'autenticació.
// Ha d'afegir el JWT a cada request de l'aplicació.
// Funcionalitat esperada:
// - incloure Authorization: Bearer <token> a les peticions a /api/*
// - gestionar errors 401 i 403
// - redirigir a /login quan el token és invàlid o caducat
// - reutilitzar la política d'autenticació definida pel backend
export class AuthInterceptor {}
