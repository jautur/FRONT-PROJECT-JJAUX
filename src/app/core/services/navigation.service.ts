import { Injectable, inject } from '@angular/core';
import { Router, NavigationExtras } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class NavigationService {
  private readonly router = inject(Router);

  /**
   * Determina si estem actualment a l'espai de l'aplicació (/app o rutes amb prefix /app/...)
   */
  get isAppMode(): boolean {
    const url = this.router.url || '';
    if (url.startsWith('/app')) return true;
    if (typeof window !== 'undefined') {
      try {
        return sessionStorage.getItem('avisa_app_mode') === 'true';
      } catch {}
    }
    return false;
  }

  /**
   * Retorna la ruta adaptada:
   * - Si estem en mode App, afegeix el prefix /app (i mapeja inici a /app).
   * - Si estem en mode Web, retorna la ruta estàndard.
   */
  getNavUrl(path: string): string {
    if (!this.isAppMode) {
      return path === '/' ? '/inici' : path;
    }
    if (path === '/' || path === '/inici' || path === '/app') {
      return '/app';
    }
    if (path.startsWith('/app/')) {
      return path;
    }
    return path.startsWith('/') ? `/app${path}` : `/app/${path}`;
  }

  /**
   * Navega garantint que si estem a l'espai App es manté el prefix /app
   */
  navigate(commands: any[], extras?: NavigationExtras): Promise<boolean> {
    if (this.isAppMode && commands.length > 0 && typeof commands[0] === 'string') {
      const adaptedFirst = this.getNavUrl(commands[0]);
      return this.router.navigate([adaptedFirst, ...commands.slice(1)], extras);
    }
    return this.router.navigate(commands, extras);
  }
}

