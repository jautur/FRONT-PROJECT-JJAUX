import { inject, Injectable } from '@angular/core';
import { CanActivate, CanActivateFn, GuardResult, MaybeAsync, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { map } from 'rxjs';
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

  // El rol el confirma el servidor: el de localStorage es pot editar a mà
  return authService.confirmarRol().pipe(
    map((rol) => rol === 'ADMIN'
      ? true
      : router.createUrlTree(['/'], { queryParams: { error: 'Accés denegat: es requereixen permisos d’administrador.' } }))
  );
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

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): MaybeAsync<GuardResult> {
    return adminGuard(route, state);
  }
}
