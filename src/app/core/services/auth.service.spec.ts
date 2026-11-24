import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { Usuari } from '../../models/usuari.model';

const usuari = (extra: Partial<Usuari> = {}) =>
  ({ id: '1', nom: 'Test', email: 't@t.es', rol: 'CLIENT', token: 'tok', ...extra }) as unknown as Usuari;

describe('AuthService', () => {
  let service: AuthService;
  let http: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(AuthService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
    localStorage.clear();
  });

  it('no té sessió inicialment', () => {
    expect(service.isLoggedIn()).toBeFalse();
    expect(service.getToken()).toBeNull();
  });

  it('login desa l\'usuari i el token', () => {
    service.login({ email: 't@t.es', password: 'x' }).subscribe();
    const req = http.expectOne((r) => r.url.endsWith('/auth/login'));
    expect(req.request.method).toBe('POST');
    req.flush(usuari());
    expect(service.isLoggedIn()).toBeTrue();
    expect(service.getToken()).toBe('tok');
    expect(service.isClient()).toBeTrue();
  });

  it('normalitza el rol antic en minúscules', () => {
    localStorage.setItem('jjaux_user', JSON.stringify({ ...usuari(), rol: 'admin' }));
    expect(service.isAdmin()).toBeTrue();
    expect(service.hasRole('ADMIN')).toBeTrue();
  });

  it('una resposta de perfil sense token conserva el de la sessió', () => {
    service.setCurrentUser(usuari());
    service.setCurrentUser(usuari({ nom: 'Nou', token: undefined }));
    expect(service.getToken()).toBe('tok');
    expect(service.getCurrentUser()?.nom).toBe('Nou');
  });

  it('ignora un localStorage corrupte', () => {
    localStorage.setItem('jjaux_user', '{no-json');
    expect(service.getCurrentUser()).toBeNull();
    expect(service.isLoggedIn()).toBeFalse();
  });

  it('logout esborra la sessió', () => {
    service.setCurrentUser(usuari());
    service.logout();
    expect(service.isLoggedIn()).toBeFalse();
    expect(localStorage.getItem('jjaux_user')).toBeNull();
  });

  it('confirmarRol retorna null sense sessió i no crida el servidor', () => {
    let rol: unknown = 'x';
    service.confirmarRol().subscribe((r) => (rol = r));
    expect(rol).toBeNull();
  });

  it('confirmarRol usa el rol del servidor i el memoritza per token', () => {
    service.setCurrentUser(usuari({ rol: 'ADMIN' as Usuari['rol'] }));
    const rols: unknown[] = [];
    service.confirmarRol().subscribe((r) => rols.push(r));
    http.expectOne((r) => r.url.endsWith('/auth/me')).flush(usuari({ rol: 'CLIENT' as Usuari['rol'] }));
    service.confirmarRol().subscribe((r) => rols.push(r));
    expect(rols).toEqual(['CLIENT', 'CLIENT']);
  });

  it('confirmarRol retorna null si el servidor falla', () => {
    service.setCurrentUser(usuari());
    let rol: unknown = 'x';
    service.confirmarRol().subscribe((r) => (rol = r));
    http.expectOne((r) => r.url.endsWith('/auth/me')).flush('', { status: 401, statusText: 'Unauthorized' });
    expect(rol).toBeNull();
  });
});
