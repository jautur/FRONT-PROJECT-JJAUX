import { inject, Injectable } from '@angular/core';
import { CanActivate, CanActivateFn, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Funció Guard funcional per a la protecció de rutes administratives (/admin/*).
 * Garanteix que només els usuaris amb rol d'administrador (`admin`) puguin accedir-hi.
 */
export const adminGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isLoggedIn()) {
    router.navigate(['/login'], { queryParams: { returnUrl: state.url, message: 'Cal iniciar sessió com a administrador.' } });
    return false;
  }

  if (authService.isAdmin()) {
    return true;
  }

  // Redirigeix usuaris sense permisos d'administrador
  router.navigate(['/'], { queryParams: { error: 'Accés denegat: es requereixen permisos d’administrador.' } });
  return false;
};

/**
 * Guard de tipus classe per a compatibilitat amb mòduls clàssics.
 */
@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    return adminGuard(route, state) as boolean;
  }
}
