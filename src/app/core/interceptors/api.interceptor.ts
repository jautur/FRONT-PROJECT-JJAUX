import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

/**
 * Interceptor de connexió i resiliència per a la comunicació amb el backend d'AVISA.
 * 
 * Funcionalitats clau:
 * 1. Adjunta automàticament el token JWT Bearer si l'usuari ha iniciat sessió.
 * 2. Assegura la comunicació tant des de PC (localhost) com des de telèfons mòbils a la xarxa local:
 *    - Si una petició relativa /api/... rep 404 (indicant que el dev-server s'ha iniciat sense proxy),
 *      es reintenta automàticament connectant directament a http://${host}:8080.
 *    - Si una petició directa a port 8080 dona status 0 (habitual quan el Firewall de Windows bloqueja
 *      el port 8080 per a dispositius externs com mòbils), es reintenta a través del proxy /api (port 4200).
 */
export const apiInterceptor: HttpInterceptorFn = (req, next) => {
  const host = typeof window !== 'undefined' && window.location.hostname ? window.location.hostname : 'localhost';

  // 1. Adjuntar token JWT si està disponible
  let clonedReq = req;
  try {
    const rawUser = typeof localStorage !== 'undefined' ? localStorage.getItem('jjaux_user') : null;
    if (rawUser) {
      const user = JSON.parse(rawUser);
      if (user?.token) {
        clonedReq = req.clone({
          setHeaders: {
            Authorization: `Bearer ${user.token}`
          }
        });
      }
    }
  } catch {
    // Ignorar errors de parsing local
  }

  // 2. Executar la petició amb reintent automàtic de seguretat
  return next(clonedReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Cas A: Petició relativa /api que falla amb 404 (el dev-server no té proxy actiu)
      if (req.url.startsWith('/api') && error.status === 404) {
        const directUrl = `http://${host}:8080${req.url}`;
        const retryReq = clonedReq.clone({ url: directUrl });
        return next(retryReq);
      }

      // Cas B: Petició directa a port 8080 que falla amb status 0 (bloqueig de firewall des de mòbil)
      if (req.url.includes(':8080/api') && error.status === 0) {
        const proxyPath = req.url.substring(req.url.indexOf('/api'));
        const retryReq = clonedReq.clone({ url: proxyPath });
        return next(retryReq);
      }

      return throwError(() => error);
    })
  );
};

