import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

/**
 * Interceptor HTTP d'Autenticació, Connexió i Resiliència per a AVISA.
 * 
 * Funcionalitats clau:
 * 1. Adjunta automàticament el token JWT Bearer si l'usuari està autenticat.
 * 2. Gestiona les sessions caducades o invàlides (error 401). Un 403 vol dir que la sessió és bona
 *    però l'acció no està permesa: es mostra l'error i no es tanca la sessió.
 *    - Neteja la sessió local mitjançant AuthService.
 *    - Redirigeix netament a la pantalla de login corresponent (web o /app/login).
 * 3. Assegura la comunicació tant des de PC (localhost) com des de dispositius mòbils a la xarxa local:
 *    - Si una petició relativa /api/... rep 404, es reintenta amb el protocol i host actiu a port 8080.
 *    - Si una petició directa falla amb status 0 (bloqueig de firewall), reintenta a través del proxy /api.
 */
export const apiInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  const host = typeof window !== 'undefined' && window.location.hostname ? window.location.hostname : 'localhost';
  const protocol = typeof window !== 'undefined' && window.location.protocol ? window.location.protocol : 'http:';

  // 1. Adjuntar token JWT si està disponible
  let clonedReq = req;
  const token = authService.getToken();

  if (token) {
    clonedReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  // 2. Executar la petició amb gestió de 401/403 i reintents de resiliència
  return next(clonedReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Cas 1: Sessió caducada o token invàlid (401) fora dels endpoints de login/registre
      const isAuthEndpoint = req.url.includes('/api/auth/login') ||
                             req.url.includes('/api/auth/register') ||
                             req.url.includes('/api/auth/recuperar');

      if (error.status === 401 && !isAuthEndpoint) {
        if (authService.isLoggedIn()) {
          authService.logout();
          const isAppMode = typeof window !== 'undefined' && (
            window.location.pathname.startsWith('/app') ||
            sessionStorage.getItem('avisa_app_mode') === 'true'
          );
          const loginUrl = isAppMode ? '/app/login' : '/login';
          router.navigate([loginUrl], {
            queryParams: { expired: 'true', message: 'La teva sessió ha caducat. Torna a iniciar sessió.' }
          });
        }
      }

      // Cas 2: Petició relativa /api que falla amb 404 (el dev-server no té proxy actiu)
      if (req.url.startsWith('/api') && error.status === 404) {
        const directUrl = `${protocol}//${host}:8080${req.url}`;
        const retryReq = clonedReq.clone({ url: directUrl });
        return next(retryReq);
      }

      // Cas 3: Petició directa a port 8080 que falla amb status 0 (bloqueig de firewall des de mòbil)
      if (req.url.includes(':8080/api') && error.status === 0) {
        const proxyPath = req.url.substring(req.url.indexOf('/api'));
        const retryReq = clonedReq.clone({ url: proxyPath });
        return next(retryReq);
      }

      return throwError(() => error);
    })
  );
};

