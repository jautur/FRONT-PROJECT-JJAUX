import { Routes } from '@angular/router';
import { LoginComponent } from './pages/auth/login/login.component';
import { RegistreComponent } from './pages/auth/registre/registre.component';
import { MainComponent } from './pages/main/main.component';
import { PerfilComponent } from './pages/perfil/perfil.component';
import { CrearTascaComponent } from './pages/client/crear-tasca/crear-tasca.component';
import { CrearOfertaComponent } from './pages/professional/crear-oferta/crear-oferta.component';
import { TascaDetallComponent } from './pages/client/tasca-detall/tasca-detall.component';
import { AvisosComponent } from './pages/avisos/avisos.component';
import { LesMevesTasquesComponent } from './pages/client/les-meves-tasques/les-meves-tasques.component';
import { LesMevesOfertesComponent } from './pages/professional/les-meves-ofertes/les-meves-ofertes.component';
import { authGuard } from './core/guards/auth.guard';

/**
 * Configuració global de rutes de la plataforma JJAUX.
 * - '': Vista prèvia de tasques i ofertes públiques (Dashboard).
 * - 'login': Inici de sessió d'usuaris.
 * - 'registre': Registre de nous usuaris (clients o professionals).
 * - 'perfil': Consulta i modificació de dades de l'usuari connectat.
 * - 'avisos': Safata d'entrada de notificacions personals.
 * - 'client/les-meves-tasques': Panell de tasques creades pel client connectat.
 * - 'client/crear-tasca': Publicació de noves tasques per part de clients.
 * - 'professional/les-meves-ofertes': Panell d'ofertes presentades pel professional connectat.
 * - 'professional/crear-oferta': Enviament de pressupostos per part de professionals.
 * - 'tasca-detall/:id': Vista detallada d'una tasca, acceptació/rebuig d'ofertes i finalització.
 */
export const appRoutes: Routes = [
  { path: '', component: MainComponent },
  { path: 'login', component: LoginComponent },
  { path: 'registre', component: RegistreComponent },
  { path: 'perfil', component: PerfilComponent, canActivate: [authGuard] },
  { path: 'avisos', component: AvisosComponent, canActivate: [authGuard] },
  { path: 'client/les-meves-tasques', component: LesMevesTasquesComponent, canActivate: [authGuard] },
  { path: 'client/crear-tasca', component: CrearTascaComponent, canActivate: [authGuard] },
  { path: 'professional/les-meves-ofertes', component: LesMevesOfertesComponent, canActivate: [authGuard] },
  { path: 'professional/crear-oferta', component: CrearOfertaComponent, canActivate: [authGuard] },
  { path: 'tasca-detall/:id', component: TascaDetallComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: '' }
];
