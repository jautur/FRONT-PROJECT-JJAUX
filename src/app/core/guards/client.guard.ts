import { inject, Injectable } from '@angular/core';
import { CanActivate, CanActivateFn, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Funció Guard funcional per a rutes exclusives de clients (/client/*).
 * Permet l'accés a usuaris amb rol 'client', 'ambdos' (client i professional) o 'admin'.
 */
export const clientGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isLoggedIn()) {
    router.navigate(['/login'], { queryParams: { returnUrl: state.url, message: 'Cal iniciar sessió per accedir com a client.' } });
    return false;
  }

  if (authService.isClient()) {
    return true;
  }

  router.navigate(['/'], { queryParams: { error: 'Aquesta secció requereix un compte de client o híbrid.' } });
  return false;
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

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    return clientGuard(route, state) as boolean;
  }
}
