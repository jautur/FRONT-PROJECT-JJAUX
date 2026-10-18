import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Interes, CrearInteresRequest } from '../models/interes.model';
import { Tasca } from '../models/tasca.model';
import { environment } from '../../environments/environment';

/**
 * Servei per a la gestió d'interessos en ofertes de professionals (/api/interessos).
 * Permet manifestar interés, llistar interessos rebuts i acceptar o rebutjar propostes.
 */
@Injectable({
  providedIn: 'root'
})
export class InteresService {
  private readonly apiUrl = `${environment.apiUrl}/interessos`;

  constructor(private readonly http: HttpClient) {}

  /**
   * Envia una manifestació d'interés en una oferta.
   */
  create(data: CrearInteresRequest): Observable<Interes> {
    return this.http.post<Interes>(this.apiUrl, data);
  }

  /**
   * Obté els interessos rebuts per a les ofertes d'un professional.
   */
  getByProfessional(proNomOrId: string): Observable<Interes[]> {
    return this.http.get<Interes[]>(`${this.apiUrl}/professional/${encodeURIComponent(proNomOrId)}`);
  }

  /**
   * Obté els interessos enviats per un client.
   */
  getByClient(clientNomOrId: string): Observable<Interes[]> {
    return this.http.get<Interes[]>(`${this.apiUrl}/client/${encodeURIComponent(clientNomOrId)}`);
  }

  /**
   * Obté un interés pel seu ID.
   */
  getById(id: string): Observable<Interes> {
    return this.http.get<Interes>(`${this.apiUrl}/${id}`);
  }

  /**
   * El professional accepta l'interés del client.
   * Crea una tasca vinculada a l'oferta i al client, conservant l'oferta.
   */
  accept(id: string): Observable<Tasca> {
    return this.http.post<Tasca>(`${this.apiUrl}/${id}/acceptar`, {});
  }

  /**
   * El professional rebutja l'interés (elimina el registre d'interés sense crear cap tasca).
   */
  reject(id: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${id}/rebutjar`, {});
  }
}

