import { inject, Injectable } from '@angular/core';
import { CanActivate, CanActivateFn, GuardResult, MaybeAsync, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { map } from 'rxjs';
import { AuthService } from '../services/auth.service';

/**
 * Funció Guard funcional per a rutes exclusives de clients (/client/*).
 * Permet l'accés a usuaris amb rol CLIENT.
 */
export const clientGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const isAppMode = state.url.startsWith('/app') || (
    typeof sessionStorage !== 'undefined' && sessionStorage.getItem('avisa_app_mode') === 'true'
  );
  const loginUrl = isAppMode ? '/app/login' : '/login';
  const homeUrl = isAppMode ? '/app' : '/';

  if (!authService.isLoggedIn()) {
    router.navigate([loginUrl], { queryParams: { returnUrl: state.url, message: 'Cal iniciar sessió per accedir com a client.' } });
    return false;
  }

  // El rol el confirma el servidor: el de localStorage es pot editar a mà
  return authService.confirmarRol().pipe(
    map((rol) => rol === 'CLIENT'
      ? true
      : router.createUrlTree([homeUrl], { queryParams: { error: 'Aquesta secció requereix un compte de client o professional.' } }))
  );
};

/**
 * Guard basat en classe per a clients.
 */
@Injectable({
  providedIn: 'root'
})
export class ClientGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): MaybeAsync<GuardResult> {
    return clientGuard(route, state);
  }
}
