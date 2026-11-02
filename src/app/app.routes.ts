import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';
import { clientGuard } from './core/guards/client.guard';
import { professionalGuard } from './core/guards/professional.guard';
import { pwaFlowGuard } from './core/guards/pwa-flow.guard';
import { webToAppGuard } from './core/guards/web-to-app.guard';

/**
 * Configuració global de rutes de la plataforma AVISA amb Lazy Loading (Code Splitting).
 * Els components es carreguen sota demanda (`loadComponent`), reduint dràsticament
 * la mida del bundle inicial i accelerant notablement el temps de càrrega (FCP i TTI).
 */
export const appRoutes: Routes = [
  { path: '', pathMatch: 'full', canActivate: [pwaFlowGuard], redirectTo: 'inici' },
  {
    path: 'inici',
    canActivate: [webToAppGuard],
    loadComponent: () => import('./pages/main/main.component').then(m => m.MainComponent)
  },
  {
    path: 'app',
    loadComponent: () => import('./pages/main/main.component').then(m => m.MainComponent)
  },
  {
    path: 'tasques-ofertes',
    canActivate: [webToAppGuard],
    loadComponent: () => import('./pages/tasques-ofertes/tasques-ofertes.component').then(m => m.TasquesOfertesComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'registre',
    loadComponent: () => import('./pages/auth/registre/registre.component').then(m => m.RegistreComponent)
  },
  {
    path: 'perfil',
    canActivate: [webToAppGuard, authGuard],
    loadComponent: () => import('./pages/perfil/perfil.component').then(m => m.PerfilComponent)
  },
  {
    path: 'perfil/:id',
    canActivate: [webToAppGuard],
    loadComponent: () => import('./pages/perfil/perfil.component').then(m => m.PerfilComponent)
  },
  {
    path: 'avisos',
    canActivate: [webToAppGuard, authGuard],
    loadComponent: () => import('./pages/avisos/avisos.component').then(m => m.AvisosComponent)
  },
  {
    path: 'client/les-meves-tasques',
    canActivate: [webToAppGuard, clientGuard],
    loadComponent: () => import('./pages/client/les-meves-tasques/les-meves-tasques.component').then(m => m.LesMevesTasquesComponent)
  },
  {
    path: 'client/crear-tasca',
    canActivate: [webToAppGuard, clientGuard],
    loadComponent: () => import('./pages/client/crear-tasca/crear-tasca.component').then(m => m.CrearTascaComponent)
  },
  { path: 'client/crear-incidencia', redirectTo: 'client/crear-tasca' },
  {
    path: 'professional/les-meves-ofertes',
    canActivate: [webToAppGuard, professionalGuard],
    loadComponent: () => import('./pages/professional/les-meves-ofertes/les-meves-ofertes.component').then(m => m.LesMevesOfertesComponent)
  },
  {
    path: 'professional/crear-oferta',
    canActivate: [webToAppGuard, professionalGuard],
    loadComponent: () => import('./pages/professional/crear-oferta/crear-oferta.component').then(m => m.CrearOfertaComponent)
  },
  { path: 'professional/publicar-oferta', redirectTo: 'professional/crear-oferta' },
  {
    path: 'tasca-detall/:id',
    canActivate: [webToAppGuard, authGuard],
    loadComponent: () => import('./pages/client/tasca-detall/tasca-detall.component').then(m => m.TascaDetallComponent)
  },
  {
    path: 'admin/panell',
    canActivate: [webToAppGuard, adminGuard],
    loadComponent: () => import('./pages/admin/panell/admin-panell.component').then(m => m.AdminPanellComponent)
  },
  {
    path: 'blog',
    canActivate: [webToAppGuard],
    loadComponent: () => import('./pages/blog/blog.component').then(m => m.BlogComponent)
  },
  { path: 'blogs', redirectTo: 'blog' },
  { path: 'articles', redirectTo: 'blog' },
  {
    path: 'article/:id',
    canActivate: [webToAppGuard],
    loadComponent: () => import('./pages/article-detall/article-detall.component').then(m => m.ArticleDetallComponent)
  },
  { path: 'blog/:id', redirectTo: 'article/:id' },
  {
    path: 'sobre-nosaltres',
    canActivate: [webToAppGuard],
    loadComponent: () => import('./pages/professional/comunitat-professionals/comunitat-professionals.component').then(m => m.ComunitatProfessionalsComponent)
  },
  { path: 'sobre-nosotros', redirectTo: 'sobre-nosaltres' },
  { path: 'about-us', redirectTo: 'sobre-nosaltres' },
  { path: 'comunitat-professionals', redirectTo: 'sobre-nosaltres' },
  { path: 'professionals', redirectTo: 'sobre-nosaltres' },
  {
    path: 'termes',
    loadComponent: () => import('./pages/auth/termes-modal/termes-modal.component').then(m => m.TermesModalComponent)
  },
  { path: 'termes-condicions', redirectTo: 'termes' },
  {
    path: 'privacitat',
    loadComponent: () => import('./pages/auth/termes-modal/termes-modal.component').then(m => m.TermesModalComponent)
  },

  // =========================================================================
  // RUTES DE L'ENTORN APP MÒBIL I PWA (/app/...)
  // =========================================================================
  {
    path: 'app/inici',
    loadComponent: () => import('./pages/main/main.component').then(m => m.MainComponent)
  },
  {
    path: 'app/tasques-ofertes',
    loadComponent: () => import('./pages/tasques-ofertes/tasques-ofertes.component').then(m => m.TasquesOfertesComponent)
  },
  {
    path: 'app/login',
    loadComponent: () => import('./pages/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'app/registre',
    loadComponent: () => import('./pages/auth/registre/registre.component').then(m => m.RegistreComponent)
  },
  {
    path: 'app/perfil',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/perfil/perfil.component').then(m => m.PerfilComponent)
  },
  {
    path: 'app/perfil/:id',
    loadComponent: () => import('./pages/perfil/perfil.component').then(m => m.PerfilComponent)
  },
  {
    path: 'app/avisos',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/avisos/avisos.component').then(m => m.AvisosComponent)
  },
  {
    path: 'app/client/les-meves-tasques',
    canActivate: [clientGuard],
    loadComponent: () => import('./pages/client/les-meves-tasques/les-meves-tasques.component').then(m => m.LesMevesTasquesComponent)
  },
  {
    path: 'app/client/crear-tasca',
    canActivate: [clientGuard],
    loadComponent: () => import('./pages/client/crear-tasca/crear-tasca.component').then(m => m.CrearTascaComponent)
  },
  { path: 'app/client/crear-incidencia', redirectTo: 'app/client/crear-tasca' },
  {
    path: 'app/professional/les-meves-ofertes',
    canActivate: [professionalGuard],
    loadComponent: () => import('./pages/professional/les-meves-ofertes/les-meves-ofertes.component').then(m => m.LesMevesOfertesComponent)
  },
  {
    path: 'app/professional/crear-oferta',
    canActivate: [professionalGuard],
    loadComponent: () => import('./pages/professional/crear-oferta/crear-oferta.component').then(m => m.CrearOfertaComponent)
  },
  { path: 'app/professional/publicar-oferta', redirectTo: 'app/professional/crear-oferta' },
  {
    path: 'app/tasca-detall/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/client/tasca-detall/tasca-detall.component').then(m => m.TascaDetallComponent)
  },
  {
    path: 'app/admin/panell',
    canActivate: [adminGuard],
    loadComponent: () => import('./pages/admin/panell/admin-panell.component').then(m => m.AdminPanellComponent)
  },
  {
    path: 'app/blog',
    loadComponent: () => import('./pages/blog/blog.component').then(m => m.BlogComponent)
  },
  { path: 'app/blogs', redirectTo: 'app/blog' },
  { path: 'app/articles', redirectTo: 'app/blog' },
  {
    path: 'app/article/:id',
    loadComponent: () => import('./pages/article-detall/article-detall.component').then(m => m.ArticleDetallComponent)
  },
  { path: 'app/blog/:id', redirectTo: 'app/article/:id' },
  {
    path: 'app/sobre-nosaltres',
    loadComponent: () => import('./pages/professional/comunitat-professionals/comunitat-professionals.component').then(m => m.ComunitatProfessionalsComponent)
  },
  { path: 'app/sobre-nosotros', redirectTo: 'app/sobre-nosaltres' },
  { path: 'app/about-us', redirectTo: 'app/sobre-nosaltres' },
  { path: 'app/comunitat-professionals', redirectTo: 'app/sobre-nosaltres' },
  { path: 'app/professionals', redirectTo: 'app/sobre-nosaltres' },
  {
    path: 'app/termes',
    loadComponent: () => import('./pages/auth/termes-modal/termes-modal.component').then(m => m.TermesModalComponent)
  },
  { path: 'app/termes-condicions', redirectTo: 'app/termes' },
  {
    path: 'app/privacitat',
    loadComponent: () => import('./pages/auth/termes-modal/termes-modal.component').then(m => m.TermesModalComponent)
  },

  { path: '**', redirectTo: 'inici' }
];
