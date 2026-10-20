import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { PwaService } from '../services/pwa.service';

/**
 * Guard funcional d'enrutament intel·ligent PWA (CanActivateFn).
 * Regula l'accés a l'arrel ('/'):
 *
 * 1. Mode PWA Instal·lada (standalone):
 *    - Salta la landing page i va directament al panell operatiu (/app).
 *    - Si no hi ha sessió activa, redirigeix a /login.
 *
 * 2. Usuari recurrent amb sessió / JWT guardat:
 *    - Redirigeix automàticament a /app per oferir una experiència àgil i sense passos redundants.
 *
 * 3. Visitant nou o públic al navegador web:
 *    - Permet visualitzar la Landing Page informativa d'AVISA.
 *
 * Paràmetres addicionals:
 * - ?landing=true : Permet a un usuari autenticat o en mode PWA forçar la visualització de la landing page.
 */
export const pwaFlowGuard: CanActivateFn = (route) => {
  const pwaService = inject(PwaService);
  const authService = inject(AuthService);
  const router = inject(Router);

  // Si s'especifica expressament el paràmetre 'landing', redirigeix a la pàgina d'inici
  if (route.queryParamMap.has('landing')) {
    return router.createUrlTree(['/inici']);
  }

  const isStandalone = pwaService.checkIfStandalone();
  const isLoggedIn = authService.isLoggedIn();

  // 1. App instal·lada (PWA standalone): entra directe a l'àrea operativa (/app) o a login
  if (isStandalone) {
    if (isLoggedIn) {
      return router.createUrlTree(['/app']);
    } else {
      return router.createUrlTree(['/login'], {
        queryParams: {
          message: 'Inicia sessió per accedir a l\'aplicació AVISA.'
        }
      });
    }
  }

  // 2. Navegador web estàndard: sempre a la pàgina d'inici (/inici)
  return router.createUrlTree(['/inici']);
};

