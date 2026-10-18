import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { appRoutes } from './app.routes';
import { apiInterceptor } from './core/interceptors/api.interceptor';

/**
 * Configuració principal de l'aplicació Angular (AVISA Frontend).
 * - Enrutament principal (appRoutes).
 * - Client HTTP amb interceptor de resiliència (apiInterceptor) que garanteix
 *   la connexió des de mòbils en xarxa local i la propagació del token JWT.
 */
export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(appRoutes),
    provideHttpClient(withInterceptors([apiInterceptor]))
  ]
};

