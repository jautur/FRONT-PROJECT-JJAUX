import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Pressupost, CrearPressupostRequest } from '../models/pressupost.model';
import { Tasca } from '../models/tasca.model';
import { AuthService } from '../core/services/auth.service';
import { environment } from '../../environments/environment';

/**
 * Servei per a la gestió de pressupostos presentats a incidències (/api/pressupostos).
 * PRIVADESA: Garanteix que els pressupostos només són visibles per als 2 usuaris implicats
 * (el client que va publicar la incidència i el professional que pressuposta).
 */
@Injectable({
  providedIn: 'root'
})
export class PressupostService {
  private readonly apiUrl = `${environment.apiUrl}/pressupostos`;

  constructor(
    private readonly http: HttpClient,
    private readonly authService: AuthService
  ) {}

  private getHeaders(): HttpHeaders {
    let headers = new HttpHeaders();
    const user = this.authService.getCurrentUser();
    if (user) {
      if (user.id) headers = headers.set('X-User-Id', user.id);
      if (user.nom) headers = headers.set('X-User-Nom', user.nom);
      if (user.rol) headers = headers.set('X-User-Rol', user.rol);
    }
    return headers;
  }

  /**
   * Obté el llistat complet de tots els pressupostos (privilegi d'administrador).
   */
  getAll(): Observable<Pressupost[]> {
    return this.http.get<Pressupost[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  /**
   * Envia un pressupost per a una incidència.
   */
  create(data: CrearPressupostRequest): Observable<Pressupost> {
    return this.http.post<Pressupost>(this.apiUrl, data, { headers: this.getHeaders() });
  }

  /**
   * Obté la llista de pressupostos rebuts per a una incidència concreta.
   * El backend filtra segons privadesa: el client veu tots els pressupostos de la seva incidència;
   * un professional només veu el seu propi pressupost.
   */
  getByIncidencia(incidenciaId: string): Observable<Pressupost[]> {
    return this.http.get<Pressupost[]>(`${this.apiUrl}/incidencia/${encodeURIComponent(incidenciaId)}`, {
      headers: this.getHeaders()
    });
  }

  /**
   * Obté un pressupost pel seu ID (només visible si l'usuari és un dels 2 implicats o admin).
   */
  getById(id: string): Observable<Pressupost> {
    return this.http.get<Pressupost>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  /**
   * Obté tots els pressupostos presentats pel propi professional.
   */
  getByProfessional(proId: string): Observable<Pressupost[]> {
    return this.http.get<Pressupost[]>(`${this.apiUrl}/professional/${encodeURIComponent(proId)}`, {
      headers: this.getHeaders()
    });
  }

  /**
   * El client accepta el pressupost seleccionat.
   * Transaccionalment crea la tasca en curs i elimina la incidència de les publicacions.
   */
  accept(id: string): Observable<Tasca> {
    return this.http.post<Tasca>(`${this.apiUrl}/${id}/acceptar`, {}, { headers: this.getHeaders() });
  }

  /**
   * El client rebutja el pressupost (no es crea tasca).
   */
  reject(id: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${id}/rebutjar`, {}, { headers: this.getHeaders() });
  }
}
