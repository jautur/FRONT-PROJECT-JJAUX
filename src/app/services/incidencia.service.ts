import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
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
}
