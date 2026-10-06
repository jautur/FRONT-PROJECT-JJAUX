// Model de l'usuari de la plataforma.
// Ha de representar el perfil autenticat i/o qualsevol usuari del sistema.
// Camps esperats:
// - id: identificador únic
// - nom: nom visible de l'usuari
// - email: correu de login
// - rol: perfil actual de l'usuari (client, professional, admin)
// El backend ha de retornar aquests camps a /api/users/* i /api/auth/me.
export interface Usuari {
  id: string;
  nom: string;
  email: string;
  rol: 'client' | 'professional' | 'admin';
}
