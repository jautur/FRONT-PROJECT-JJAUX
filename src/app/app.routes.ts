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
import { TasquesOfertesComponent } from './pages/tasques-ofertes/tasques-ofertes.component';
import { AdminPanellComponent } from './pages/admin/panell/admin-panell.component';
import { ArticleDetallComponent } from './pages/article-detall/article-detall.component';
import { BlogComponent } from './pages/blog/blog.component';
import { ComunitatProfessionalsComponent } from './pages/professional/comunitat-professionals/comunitat-professionals.component';
import { TermesModalComponent } from './pages/auth/termes-modal/termes-modal.component';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';
import { pwaFlowGuard } from './core/guards/pwa-flow.guard';
import { webToAppGuard } from './core/guards/web-to-app.guard';

/**
 * Configuració global de rutes de la plataforma AVISA.
 * - '': Vista prèvia / Landing informativa (protegida amb pwaFlowGuard per desviar PWA instal·lades o usuaris recurrents a /app).
 * - 'app': Panel principal / àrea operativa de tasques i encàrrecs.
 * - 'tasques-ofertes': Mercat complet de tasques i ofertes amb cerca i categories.
 * - 'login': Inici de sessió d'usuaris.
 * - 'registre': Registre de nous usuaris (clients, professionals o ambdós).
 * - 'perfil': Consulta i modificació de dades de l'usuari connectat.
 * - 'avisos': Safata d'entrada de notificacions personals.
 * - 'client/les-meves-tasques': Panell de tasques creades pel client connectat.
 * - 'client/crear-tasca': Publicació de noves tasques per part de clients.
 * - 'professional/les-meves-ofertes': Panell d'ofertes presentades pel professional connectat.
 * - 'professional/crear-oferta': Enviament de pressupostos per part de professionals.
 * - 'tasca-detall/:id': Vista detallada d'una tasca, acceptació/rebuig d'ofertes i finalització.
 * - 'admin/panell': Panell de supervisió global amb llistat complet de tasques, ofertes i usuaris (només admin).
 */
export const appRoutes: Routes = [
  { path: '', pathMatch: 'full', canActivate: [pwaFlowGuard], redirectTo: 'inici' },
  { path: 'inici', canActivate: [webToAppGuard], component: MainComponent },
  { path: 'app', component: MainComponent },
  { path: 'tasques-ofertes', canActivate: [webToAppGuard], component: TasquesOfertesComponent },
  { path: 'login', component: LoginComponent },
  { path: 'registre', component: RegistreComponent },
  { path: 'perfil', canActivate: [webToAppGuard, authGuard], component: PerfilComponent },
  { path: 'perfil/:id', canActivate: [webToAppGuard], component: PerfilComponent },
  { path: 'avisos', canActivate: [webToAppGuard, authGuard], component: AvisosComponent },
  { path: 'client/les-meves-tasques', canActivate: [webToAppGuard, authGuard], component: LesMevesTasquesComponent },
  { path: 'client/crear-tasca', canActivate: [webToAppGuard, authGuard], component: CrearTascaComponent },
  { path: 'client/crear-incidencia', redirectTo: 'client/crear-tasca' },
  { path: 'professional/les-meves-ofertes', canActivate: [webToAppGuard, authGuard], component: LesMevesOfertesComponent },
  { path: 'professional/crear-oferta', canActivate: [webToAppGuard, authGuard], component: CrearOfertaComponent },
  { path: 'professional/publicar-oferta', redirectTo: 'professional/crear-oferta' },
  { path: 'tasca-detall/:id', canActivate: [webToAppGuard, authGuard], component: TascaDetallComponent },
  { path: 'admin/panell', canActivate: [webToAppGuard, adminGuard], component: AdminPanellComponent },
  { path: 'blog', canActivate: [webToAppGuard], component: BlogComponent },
  { path: 'blogs', redirectTo: 'blog' },
  { path: 'articles', redirectTo: 'blog' },
  { path: 'article/:id', canActivate: [webToAppGuard], component: ArticleDetallComponent },
  { path: 'blog/:id', redirectTo: 'article/:id' },
  { path: 'sobre-nosaltres', canActivate: [webToAppGuard], component: ComunitatProfessionalsComponent },
  { path: 'sobre-nosotros', redirectTo: 'sobre-nosaltres' },
  { path: 'about-us', redirectTo: 'sobre-nosaltres' },
  { path: 'comunitat-professionals', redirectTo: 'sobre-nosaltres' },
  { path: 'professionals', redirectTo: 'sobre-nosaltres' },
  { path: 'termes', component: TermesModalComponent },
  { path: 'termes-condicions', redirectTo: 'termes' },
  { path: 'privacitat', component: TermesModalComponent },

  // =========================================================================
  // RUTES DE L'ENTORN APP MÒBIL I PWA (/app/...)
  // Mantenen la navegació dins de l'espai de l'aplicació, amb barra inferior
  // =========================================================================
  { path: 'app/inici', redirectTo: 'app' },
  { path: 'app/tasques-ofertes', component: TasquesOfertesComponent },
  { path: 'app/login', component: LoginComponent },
  { path: 'app/registre', component: RegistreComponent },
  { path: 'app/perfil', component: PerfilComponent, canActivate: [authGuard] },
  { path: 'app/perfil/:id', component: PerfilComponent },
  { path: 'app/avisos', component: AvisosComponent, canActivate: [authGuard] },
  { path: 'app/client/les-meves-tasques', component: LesMevesTasquesComponent, canActivate: [authGuard] },
  { path: 'app/client/crear-tasca', component: CrearTascaComponent, canActivate: [authGuard] },
  { path: 'app/client/crear-incidencia', redirectTo: 'app/client/crear-tasca' },
  { path: 'app/professional/les-meves-ofertes', component: LesMevesOfertesComponent, canActivate: [authGuard] },
  { path: 'app/professional/crear-oferta', component: CrearOfertaComponent, canActivate: [authGuard] },
  { path: 'app/professional/publicar-oferta', redirectTo: 'app/professional/crear-oferta' },
  { path: 'app/tasca-detall/:id', component: TascaDetallComponent, canActivate: [authGuard] },
  { path: 'app/admin/panell', component: AdminPanellComponent, canActivate: [adminGuard] },
  { path: 'app/blog', component: BlogComponent },
  { path: 'app/blogs', redirectTo: 'app/blog' },
  { path: 'app/articles', redirectTo: 'app/blog' },
  { path: 'app/article/:id', component: ArticleDetallComponent },
  { path: 'app/blog/:id', redirectTo: 'app/article/:id' },
  { path: 'app/sobre-nosaltres', component: ComunitatProfessionalsComponent },
  { path: 'app/sobre-nosotros', redirectTo: 'app/sobre-nosaltres' },
  { path: 'app/about-us', redirectTo: 'app/sobre-nosaltres' },
  { path: 'app/comunitat-professionals', redirectTo: 'app/sobre-nosaltres' },
  { path: 'app/professionals', redirectTo: 'app/sobre-nosaltres' },
  { path: 'app/termes', component: TermesModalComponent },
  { path: 'app/termes-condicions', redirectTo: 'app/termes' },
  { path: 'app/privacitat', component: TermesModalComponent },

  { path: '**', redirectTo: 'inici' }
];
