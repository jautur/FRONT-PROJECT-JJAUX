import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Pagina, aPagina } from '../models/pagina.model';
import { Incidencia, CrearIncidenciaDTO } from '../models/incidencia.model';
import { environment } from '../../environments/environment';

/**
 * Servei per a la gestió d'incidències (/api/incidencies).
 * Les incidències són publicades per clients per sol·licitar pressupostos a professionals.
 */
@Injectable({
  providedIn: 'root'
})
export class IncidenciaService {
  private readonly apiUrl = `${environment.apiUrl}/incidencies`;

  constructor(private readonly http: HttpClient) {}

  /**
   * Una pàgina de incidències, paginada pel servidor (el total ve a X-Total-Count).
   * Prefereix-la a getAll() als llistats llargs: només baixa els elements que es mostren.
   * @param pagina Número de pàgina, des de 0
   * @param mida Elements per pàgina (1 a 100)
   */
  getPage(pagina = 0, mida = 20): Observable<Pagina<Incidencia>> {
    const params = new HttpParams().set('page', pagina).set('size', mida);
    return this.http
      .get<Incidencia[]>(this.apiUrl, { params, observe: 'response' })
      .pipe(map((resposta) => aPagina(resposta, pagina, mida)));
  }

  /**
   * Obté totes les incidències registrades a la plataforma.
   */
  getAll(): Observable<Incidencia[]> {
    return this.http.get<Incidencia[]>(this.apiUrl);
  }

  /**
   * Consulta el detall d'una incidència concreta pel seu ID.
   */
  getById(id: string): Observable<Incidencia> {
    return this.http.get<Incidencia>(`${this.apiUrl}/${encodeURIComponent(id)}`);
  }

  /**
   * Llista les incidències publicades per un client concret.
   */
  getByClient(clientNom: string): Observable<Incidencia[]> {
    return this.http.get<Incidencia[]>(`${this.apiUrl}/client/${encodeURIComponent(clientNom)}`);
  }

  /**
   * Publica una nova incidència (petició de client).
   */
  create(dto: CrearIncidenciaDTO): Observable<Incidencia> {
    return this.http.post<Incidencia>(this.apiUrl, dto);
  }

  /**
   * Elimina una incidència.
   */
  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${encodeURIComponent(id)}`);
  }

  /** Tanca una incidència oberta: els pressupostos pendents es rebutgen */
  close(id: string): Observable<Incidencia> {
    return this.http.post<Incidencia>(`${this.apiUrl}/${encodeURIComponent(id)}/tancar`, {});
  }
}
