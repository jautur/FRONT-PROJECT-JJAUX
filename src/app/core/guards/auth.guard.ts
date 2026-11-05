import { inject, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanActivateFn, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Guard funcional d'autenticació (CanActivateFn).
 * Comprova si l'usuari té una sessió activa abans de permetre accedir a una ruta protegida.
 * Si no està autenticat, el redirigeix al formulari de Login afegint el paràmetre 'returnUrl'.
 */
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    return true;
  }

  const isAppMode = state.url.startsWith('/app') || (
    typeof sessionStorage !== 'undefined' && sessionStorage.getItem('avisa_app_mode') === 'true'
  );
  const loginUrl = isAppMode ? '/app/login' : '/login';

  // Si no ha iniciat sessió, redirigim a la vista de login corresponent amb la ruta de retorn
  return router.createUrlTree([loginUrl], {
    queryParams: {
      message: 'Cal iniciar sessió abans de poder accedir a aquesta secció.',
      returnUrl: state.url
    }
  });
};

/**
 * Guard basat en classe d'autenticació per compatibilitat amb mòduls clàssics.
 */
@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService, private readonly router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree {
    if (this.authService.isLoggedIn()) {
      return true;
    }
    return this.router.createUrlTree(['/login'], {
      queryParams: {
        message: 'Cal iniciar sessió abans de poder accedir a aquesta secció.',
        returnUrl: state.url
      }
    });
  }
}
