import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SwPush } from '@angular/service-worker';
import { firstValueFrom, catchError, of } from 'rxjs';
import { environment } from '../../../environments/environment';

/**
 * Estat de les notificacions push d'aquest navegador:
 * - 'activat': hi ha una subscripció registrada al servidor.
 * - 'desactivat': es poden activar.
 * - 'denegat': l'usuari ha bloquejat el permís al navegador.
 * - 'no-suportat': el navegador o el mode (p. ex. desenvolupament, sense service worker) no ho permet.
 * - 'no-configurat': el servidor no té claus VAPID.
 */
export type EstatPush = 'activat' | 'desactivat' | 'denegat' | 'no-suportat' | 'no-configurat';

/**
 * Notificacions push (Web Push). Cada avís intern del servidor arriba també al dispositiu on s'hagen activat.
 * El service worker d'Angular (ngsw) mostra la notificació i obri l'enllaç en tocar-la.
 */
@Injectable({ providedIn: 'root' })
export class PushService {
  private readonly apiUrl = `${environment.apiUrl}/push`;

  constructor(
    private readonly http: HttpClient,
    private readonly swPush: SwPush
  ) {}

  /** Si el navegador i el service worker permeten notificacions. */
  private get suportat(): boolean {
    return this.swPush.isEnabled && typeof Notification !== 'undefined';
  }

  /** Estat actual: mira el permís del navegador i si ja hi ha una subscripció. */
  async estat(): Promise<EstatPush> {
    if (!this.suportat) return 'no-suportat';
    if (Notification.permission === 'denied') return 'denegat';
    const subscripcio = await firstValueFrom(this.swPush.subscription);
    return subscripcio ? 'activat' : 'desactivat';
  }

  /**
   * Demana permís, es subscriu al servei de push del navegador i registra la subscripció al servidor.
   * @returns l'estat resultant; mai llança: els errors es tradueixen en un estat.
   */
  async activar(): Promise<EstatPush> {
    if (!this.suportat) return 'no-suportat';
    const resposta = await firstValueFrom(
      this.http.get<{ clau: string }>(`${this.apiUrl}/clau-publica`).pipe(catchError(() => of(null)))
    );
    if (!resposta?.clau) return 'no-configurat';
    try {
      const subscripcio = await this.swPush.requestSubscription({ serverPublicKey: resposta.clau });
      const { endpoint, keys } = subscripcio.toJSON() as { endpoint: string; keys: { p256dh: string; auth: string } };
      await firstValueFrom(this.http.post<void>(`${this.apiUrl}/subscripcions`, { endpoint, keys }));
      return 'activat';
    } catch {
      return Notification.permission === 'denied' ? 'denegat' : 'desactivat';
    }
  }

  /** Dona de baixa aquest dispositiu al servidor i cancel·la la subscripció del navegador. */
  async desactivar(): Promise<EstatPush> {
    if (!this.suportat) return 'no-suportat';
    try {
      const subscripcio = await firstValueFrom(this.swPush.subscription);
      if (subscripcio) {
        await firstValueFrom(
          this.http.request<void>('DELETE', `${this.apiUrl}/subscripcions`, { body: { endpoint: subscripcio.endpoint } })
        );
        await this.swPush.unsubscribe();
      }
    } catch {
      return 'activat';
    }
    return 'desactivat';
  }
}
