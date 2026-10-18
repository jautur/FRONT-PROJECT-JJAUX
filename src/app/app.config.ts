import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { appRoutes } from './app.routes';

// Configuració principal de l'aplicació Angular.
// Aquí es registren els providers globals de l'app, incloent:
// - enrutament principal mitjançant provideRouter(appRoutes)
// - interceptors globals si es requereix reutilitzar tokens JWT
// - serveis d'auth i configuració del backend
// La comunicació amb el backend es realitzarà via serveis HTTP a /api/*.
export const appConfig: ApplicationConfig = {
  providers: [provideRouter(appRoutes), provideHttpClient()]
};
