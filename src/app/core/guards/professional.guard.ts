import { inject, Injectable } from '@angular/core';
import { CanActivate, CanActivateFn, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Funció Guard funcional per a rutes exclusives de professionals (/professional/*).
 * Permet l'accés a usuaris amb rol 'professional' (o 'admin').
 */
export const professionalGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isLoggedIn()) {
    router.navigate(['/login'], { queryParams: { returnUrl: state.url, message: 'Cal iniciar sessió per accedir com a professional.' } });
    return false;
  }

  if (authService.isProfessional()) {
    return true;
  }

  router.navigate(['/'], { queryParams: { error: 'Aquesta secció requereix un compte de professional.' } });
  return false;
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

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    return professionalGuard(route, state) as boolean;
  }
}
