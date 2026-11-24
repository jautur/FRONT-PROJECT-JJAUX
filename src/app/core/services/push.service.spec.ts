import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { SwPush } from '@angular/service-worker';
import { BehaviorSubject } from 'rxjs';
import { PushService } from './push.service';

describe('PushService', () => {
  let servei: PushService;
  let http: HttpTestingController;
  let subscripcio$: BehaviorSubject<unknown>;
  let sw: { isEnabled: boolean; subscription: BehaviorSubject<unknown>; requestSubscription: jasmine.Spy; unsubscribe: jasmine.Spy };

  const subscripcioFalsa = {
    endpoint: 'https://fcm.googleapis.com/x',
    toJSON: () => ({ endpoint: 'https://fcm.googleapis.com/x', keys: { p256dh: 'k', auth: 'a' } })
  };

  beforeEach(() => {
    subscripcio$ = new BehaviorSubject<unknown>(null);
    sw = {
      isEnabled: true,
      subscription: subscripcio$,
      requestSubscription: jasmine.createSpy('requestSubscription').and.resolveTo(subscripcioFalsa),
      unsubscribe: jasmine.createSpy('unsubscribe').and.resolveTo()
    };
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), { provide: SwPush, useValue: sw }]
    });
    servei = TestBed.inject(PushService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('sense service worker (p. ex. en desenvolupament) no és suportat', async () => {
    sw.isEnabled = false;
    expect(await servei.estat()).toBe('no-suportat');
    expect(await servei.activar()).toBe('no-suportat');
    expect(await servei.desactivar()).toBe('no-suportat');
  });

  it('l\'estat és desactivat sense subscripció i activat amb ella', async () => {
    expect(await servei.estat()).toBe('desactivat');
    subscripcio$.next(subscripcioFalsa);
    expect(await servei.estat()).toBe('activat');
  });

  it('activar demana la clau, es subscriu i registra la subscripció al servidor', async () => {
    const promesa = servei.activar();
    http.expectOne((r) => r.url.endsWith('/push/clau-publica')).flush({ clau: 'BCLAU' });
    await new Promise((r) => setTimeout(r));
    const post = http.expectOne((r) => r.url.endsWith('/push/subscripcions'));
    expect(post.request.method).toBe('POST');
    expect(post.request.body).toEqual({ endpoint: 'https://fcm.googleapis.com/x', keys: { p256dh: 'k', auth: 'a' } });
    post.flush(null);

    expect(await promesa).toBe('activat');
    expect(sw.requestSubscription).toHaveBeenCalledWith({ serverPublicKey: 'BCLAU' });
  });

  it('si el servidor no té claus VAPID (404) queda no-configurat i no es demana permís', async () => {
    const promesa = servei.activar();
    http.expectOne((r) => r.url.endsWith('/push/clau-publica')).flush('', { status: 404, statusText: 'Not Found' });

    expect(await promesa).toBe('no-configurat');
    expect(sw.requestSubscription).not.toHaveBeenCalled();
  });

  it('si l\'usuari rebutja el permís no es registra res', async () => {
    sw.requestSubscription.and.rejectWith(new Error('denied'));
    const promesa = servei.activar();
    http.expectOne((r) => r.url.endsWith('/push/clau-publica')).flush({ clau: 'BCLAU' });

    expect(['desactivat', 'denegat']).toContain(await promesa);
  });

  it('desactivar dona de baixa l\'endpoint al servidor i cancel·la la subscripció', async () => {
    subscripcio$.next(subscripcioFalsa);
    const promesa = servei.desactivar();
    await new Promise((r) => setTimeout(r));
    const del = http.expectOne((r) => r.url.endsWith('/push/subscripcions'));
    expect(del.request.method).toBe('DELETE');
    expect(del.request.body).toEqual({ endpoint: 'https://fcm.googleapis.com/x' });
    del.flush(null);

    expect(await promesa).toBe('desactivat');
    expect(sw.unsubscribe).toHaveBeenCalled();
  });
});
