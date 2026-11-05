import { HttpInterceptorFn } from '@angular/common/http';
import { apiInterceptor } from './api.interceptor';

/**
 * Interceptor funcional d'autenticació i protecció de sessions per a AVISA.
 * Reutilitza i canalitza la lògica d'autenticació, injecció de JWT i maneig d'errors 401/403.
 */
export const authInterceptor: HttpInterceptorFn = apiInterceptor;
