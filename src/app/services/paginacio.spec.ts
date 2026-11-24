import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { IncidenciaService } from './incidencia.service';
import { OfertaService } from './oferta.service';
import { TascaService } from './tasca.service';

describe('Serveis: paginació del servidor', () => {
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('incidències: demana page i size i llegeix el total de X-Total-Count', () => {
    let pagina: any;
    TestBed.inject(IncidenciaService).getPage(2, 10).subscribe((p) => (pagina = p));
    const req = http.expectOne((r) => r.url.endsWith('/incidencies'));
    expect(req.request.params.get('page')).toBe('2');
    expect(req.request.params.get('size')).toBe('10');
    req.flush([{ id: 'I-1' }], { headers: { 'X-Total-Count': '41' } });
    expect(pagina).toEqual({ elements: [{ id: 'I-1' }], total: 41, pagina: 2, mida: 10 });
  });

  it('ofertes: valors per defecte i total absent = longitud de la pàgina', () => {
    let pagina: any;
    TestBed.inject(OfertaService).getPage().subscribe((p) => (pagina = p));
    const req = http.expectOne((r) => r.url.endsWith('/offers'));
    expect(req.request.params.get('page')).toBe('0');
    expect(req.request.params.get('size')).toBe('20');
    req.flush([{ id: 'O-1' }, { id: 'O-2' }]);
    expect(pagina.total).toBe(2);
  });

  it('tasques disponibles: usa /disponibles amb la paginació', () => {
    let pagina: any;
    TestBed.inject(TascaService).getAvailablePage(1, 5).subscribe((p) => (pagina = p));
    const req = http.expectOne((r) => r.url.endsWith('/tasks/disponibles'));
    expect(req.request.params.get('size')).toBe('5');
    req.flush([], { headers: { 'X-Total-Count': '7' } });
    expect(pagina.total).toBe(7);
    expect(pagina.elements).toEqual([]);
  });

  it('tasques: getPage pagina /tasks', () => {
    TestBed.inject(TascaService).getPage(0, 50).subscribe();
    const req = http.expectOne((r) => r.url.endsWith('/tasks'));
    expect(req.request.params.get('size')).toBe('50');
    req.flush([]);
  });
});
