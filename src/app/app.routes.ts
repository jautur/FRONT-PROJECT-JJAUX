import { Routes } from '@angular/router';
import { LoginComponent } from './pages/auth/login/login.component';
import { RegistreComponent } from './pages/auth/registre/registre.component';
import { MainComponent } from './pages/main/main.component';

// Aquest fitxer defineix les rutes globals de l'aplicació.
// Ha de tenir la configuració del flux d'autenticació:
// - /login i /registre per a usuaris no autenticats
// - /client/* per al dashboard i tasques del client
// - /professional/* per al dashboard, ofertes i tasques del professional
// - /admin/* per a la gestió administrativa
// - redirecció a /login si la ruta no existeix
// El backend associat ha d'exposar endpoints com /api/auth/login, /api/auth/register i /api/users/*.
export const appRoutes: Routes = [
  { path: '', component: MainComponent },
  { path: 'login', component: LoginComponent },
  { path: 'registre', component: RegistreComponent },
  { path: '**', redirectTo: '' }
];
