import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { apiInterceptor } from './api.interceptor';
import { AuthService } from '../services/auth.service';

describe('apiInterceptor', () => {
  let http: HttpClient;
  let ctrl: HttpTestingController;
  let auth: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(() => {
    sessionStorage.clear();
    auth = jasmine.createSpyObj<AuthService>('AuthService', ['getToken', 'isLoggedIn', 'logout']);
    router = jasmine.createSpyObj<Router>('Router', ['navigate']);
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([apiInterceptor])),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: auth },
        { provide: Router, useValue: router }
      ]
    });
    http = TestBed.inject(HttpClient);
    ctrl = TestBed.inject(HttpTestingController);
  });

  afterEach(() => ctrl.verify());

  it('afegeix el Bearer token', () => {
    auth.getToken.and.returnValue('abc');
    http.get('/api/avisos').subscribe();
    expect(ctrl.expectOne('/api/avisos').request.headers.get('Authorization')).toBe('Bearer abc');
  });

  it('no afegeix capçalera sense token', () => {
    auth.getToken.and.returnValue(null);
    http.get('/api/avisos').subscribe();
    expect(ctrl.expectOne('/api/avisos').request.headers.has('Authorization')).toBeFalse();
  });

  it('un 401 tanca la sessió i va al login', () => {
    auth.getToken.and.returnValue('abc');
    auth.isLoggedIn.and.returnValue(true);
    http.get('/api/avisos').subscribe({ error: () => {} });
    ctrl.expectOne('/api/avisos').flush('', { status: 401, statusText: 'Unauthorized' });
    expect(auth.logout).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/login'], jasmine.anything());
  });

  it('un 401 al login no tanca la sessió', () => {
    auth.getToken.and.returnValue(null);
    auth.isLoggedIn.and.returnValue(true);
    http.post('/api/auth/login', {}).subscribe({ error: () => {} });
    ctrl.expectOne('/api/auth/login').flush('', { status: 401, statusText: 'Unauthorized' });
    expect(auth.logout).not.toHaveBeenCalled();
  });

  it('un 403 no tanca la sessió i propaga l\'error', () => {
    auth.getToken.and.returnValue('abc');
    auth.isLoggedIn.and.returnValue(true);
    let status = 0;
    http.get('/api/admin').subscribe({ error: (e) => (status = e.status) });
    ctrl.expectOne('/api/admin').flush('', { status: 403, statusText: 'Forbidden' });
    expect(status).toBe(403);
    expect(auth.logout).not.toHaveBeenCalled();
  });

  it('reintenta al port 8080 si /api dóna 404', () => {
    auth.getToken.and.returnValue(null);
    http.get('/api/x').subscribe();
    ctrl.expectOne('/api/x').flush('', { status: 404, statusText: 'Not Found' });
    const retry = ctrl.expectOne((r) => r.url.endsWith(':8080/api/x'));
    retry.flush({});
  });
});
