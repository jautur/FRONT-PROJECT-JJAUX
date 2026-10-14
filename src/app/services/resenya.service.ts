import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Resenya, CrearResenyaDTO } from '../models/resenya.model';
import { environment } from '../../environments/environment';

/**
 * Servei per a la gestió de ressenyes i valoracions (/api/resenyes).
 * Permet consultar les opinions dels clients i valorar els serveis dels professionals.
 */
@Injectable({
  providedIn: 'root'
})
export class ResenyaService {
  private readonly apiUrl = `${environment.apiUrl}/resenyes`;

  constructor(private readonly http: HttpClient) {}

  /**
   * Obté totes les ressenyes registrades a la plataforma.
   * @returns Observable amb la llista completa de ressenyes
   */
  getAll(): Observable<Resenya[]> {
    return this.http.get<Resenya[]>(this.apiUrl);
  }

  /**
   * Obté les ressenyes dirigides a un professional concret pel seu ID o nom.
   * @param treballadorId Identificador o nom del treballador
   * @returns Observable amb la llista de ressenyes del professional
   */
  getByTreballador(treballadorId: string): Observable<Resenya[]> {
    return this.http.get<Resenya[]>(`${this.apiUrl}/treballador/${encodeURIComponent(treballadorId)}`);
  }

  /**
   * Obté les ressenyes escrites per un client concret.
   * @param clientId Identificador del client
   * @returns Observable amb les ressenyes del client
   */
  getByClient(clientId: string): Observable<Resenya[]> {
    return this.http.get<Resenya[]>(`${this.apiUrl}/client/${encodeURIComponent(clientId)}`);
  }

  /**
   * Publica una nova ressenya o valoració d'un servei.
   * @param dto Dades de la ressenya
   * @returns Observable amb la ressenya creada
   */
  create(dto: CrearResenyaDTO): Observable<Resenya> {
    return this.http.post<Resenya>(this.apiUrl, dto);
  }
}
