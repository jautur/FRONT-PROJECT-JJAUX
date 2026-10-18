import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Pressupost, CrearPressupostRequest } from '../models/pressupost.model';
import { Tasca } from '../models/tasca.model';
import { environment } from '../../environments/environment';

/**
 * Servei per a la gestió de pressupostos presentats a incidències (/api/pressupostos).
 * Permet als professionals enviar pressupostos i als clients consultar, acceptar o rebutjar-los.
 */
@Injectable({
  providedIn: 'root'
})
export class PressupostService {
  private readonly apiUrl = `${environment.apiUrl}/pressupostos`;

  constructor(private readonly http: HttpClient) {}

  /**
   * Envia un pressupost per a una incidència.
   */
  create(data: CrearPressupostRequest): Observable<Pressupost> {
    return this.http.post<Pressupost>(this.apiUrl, data);
  }

  /**
   * Obté la llista de pressupostos rebuts per a una incidència concreta.
   */
  getByIncidencia(incidenciaId: string): Observable<Pressupost[]> {
    return this.http.get<Pressupost[]>(`${this.apiUrl}/incidencia/${encodeURIComponent(incidenciaId)}`);
  }

  /**
   * Obté un pressupost pel seu ID.
   */
  getById(id: string): Observable<Pressupost> {
    return this.http.get<Pressupost>(`${this.apiUrl}/${id}`);
  }

  /**
   * El client accepta el pressupost seleccionat.
   * Transaccionalment crea la tasca en curs i elimina la incidència de les publicacions.
   */
  accept(id: string): Observable<Tasca> {
    return this.http.post<Tasca>(`${this.apiUrl}/${id}/acceptar`, {});
  }

  /**
   * El client rebutja el pressupost (no es crea tasca).
   */
  reject(id: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${id}/rebutjar`, {});
  }
}

