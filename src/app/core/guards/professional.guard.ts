import { inject, Injectable } from '@angular/core';
import { CanActivate, CanActivateFn, GuardResult, MaybeAsync, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { map } from 'rxjs';
import { AuthService } from '../services/auth.service';

/**
 * Funció Guard funcional per a rutes exclusives de professionals (/professional/*).
 * Permet l'accés a usuaris amb rol PROFESSIONAL.
 */
export const professionalGuard: CanActivateFn = (
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
    router.navigate([loginUrl], { queryParams: { returnUrl: state.url, message: 'Cal iniciar sessió per accedir com a professional.' } });
    return false;
  }

  // El rol el confirma el servidor: el de localStorage es pot editar a mà
  return authService.confirmarRol().pipe(
    map((rol) => rol === 'PROFESSIONAL'
      ? true
      : router.createUrlTree([homeUrl], { queryParams: { error: 'Aquesta secció requereix un compte de professional.' } }))
  );
};

/**
 * Guard basat en classe per a professionals.
 */
@Injectable({
  providedIn: 'root'
})
export class ProfessionalGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): MaybeAsync<GuardResult> {
    return professionalGuard(route, state);
  }
}
