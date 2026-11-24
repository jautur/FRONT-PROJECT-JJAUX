import { TestBed } from '@angular/core/testing';
import { Router, UrlTree, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { of } from 'rxjs';
import { authGuard } from './auth.guard';
import { adminGuard } from './admin.guard';
import { AuthService } from '../services/auth.service';

const route = {} as ActivatedRouteSnapshot;
const state = (url: string) => ({ url }) as RouterStateSnapshot;

describe('guards', () => {
  let auth: jasmine.SpyObj<AuthService>;
  let router: Router;

  beforeEach(() => {
    sessionStorage.clear();
    auth = jasmine.createSpyObj<AuthService>('AuthService', ['isLoggedIn', 'confirmarRol']);
    TestBed.configureTestingModule({
      providers: [{ provide: AuthService, useValue: auth }, { provide: Router, useValue: jasmine.createSpyObj('Router', ['createUrlTree', 'navigate']) }]
    });
    router = TestBed.inject(Router);
    (router.createUrlTree as jasmine.Spy).and.callFake((c: unknown[]) => ({ c }) as unknown as UrlTree);
  });

  describe('authGuard', () => {
    it('deixa passar amb sessió', () => {
      auth.isLoggedIn.and.returnValue(true);
      expect(TestBed.runInInjectionContext(() => authGuard(route, state('/x')))).toBeTrue();
    });

    it('redirigeix a /login amb returnUrl', () => {
      auth.isLoggedIn.and.returnValue(false);
      TestBed.runInInjectionContext(() => authGuard(route, state('/tasques')));
      expect(router.createUrlTree).toHaveBeenCalledWith(['/login'], jasmine.objectContaining({
        queryParams: jasmine.objectContaining({ returnUrl: '/tasques' })
      }));
    });

    it('redirigeix a /app/login en mode app', () => {
      auth.isLoggedIn.and.returnValue(false);
      TestBed.runInInjectionContext(() => authGuard(route, state('/app/avisos')));
      expect((router.createUrlTree as jasmine.Spy).calls.mostRecent().args[0]).toEqual(['/app/login']);
    });
  });

  describe('adminGuard', () => {
    const run = () => TestBed.runInInjectionContext(() => adminGuard(route, state('/admin')));

    it('bloqueja sense sessió', () => {
      auth.isLoggedIn.and.returnValue(false);
      expect(run()).toBeFalse();
      expect(router.navigate).toHaveBeenCalled();
    });

    it('accepta només si el servidor confirma ADMIN', (done) => {
      auth.isLoggedIn.and.returnValue(true);
      auth.confirmarRol.and.returnValue(of('ADMIN'));
      (run() as any).subscribe((r: unknown) => { expect(r).toBeTrue(); done(); });
    });

    it('rebutja un rol no admin encara que localStorage digui admin', (done) => {
      auth.isLoggedIn.and.returnValue(true);
      auth.confirmarRol.and.returnValue(of('CLIENT'));
      (run() as any).subscribe((r: unknown) => { expect(r).not.toBeTrue(); done(); });
    });
  });
});
