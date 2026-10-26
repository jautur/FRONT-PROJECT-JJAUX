import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

/**
 * Guard intel·ligent que assegura que si l'usuari es troba dins de l'espai de l'aplicació (/app o subrutes),
 * qualsevol navegació que apunti per error a una ruta web estàndard (com /tasques-ofertes, /perfil, etc.)
 * sigui redirigida automàticament a la seva ruta corresponent amb el prefix /app/...
 *
 * Si l'usuari està navegant a la versió web (/inici, etc.), permet la navegació web amb normalitat.
 */
export const webToAppGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);

  let isAppSession = false;
  if (typeof window !== 'undefined') {
    try {
      isAppSession = sessionStorage.getItem('avisa_app_mode') === 'true';
    } catch {}
  }

  // Només redirigim si l'usuari té activa la sessió d'aplicació (/app)
  if (isAppSession) {
    const targetUrl = state.url;
    if (!targetUrl.startsWith('/app')) {
      if (targetUrl === '/' || targetUrl === '/inici' || targetUrl.startsWith('/inici?')) {
        return router.createUrlTree(['/app']);
      }
      return router.createUrlTree([`/app${targetUrl.startsWith('/') ? '' : '/'}${targetUrl}`]);
    }
  }

  return true;
};

