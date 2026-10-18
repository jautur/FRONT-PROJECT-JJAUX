import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Avis } from '../models/avis.model';
import { environment } from '../../environments/environment';

/**
 * Servei de notificacions i avisos del sistema (/api/avisos).
 * Permet consultar missatges informatius, avisos d'adjudicació de tasques,
 * alertes de noves ofertes i marcar-los com a llegits.
 */
@Injectable({
  providedIn: 'root'
})
export class AvisService {
  /** URL base de l'endpoint d'avisos */
  private readonly apiUrl = `${environment.apiUrl}/avisos`;

  constructor(private readonly http: HttpClient) {}

  /**
   * Obté el llistat complet d'avisos globals del sistema.
   * @returns Observable amb la llista completa d'avisos
   */
  getAll(): Observable<Avis[]> {
    return this.http.get<Avis[]>(this.apiUrl);
  }

  /**
   * Obté els avisos dirigits a un usuari concret.
   * @param usuariId Identificador únic de l'usuari
   * @returns Observable amb els avisos personals de l'usuari
   */
  getByUsuari(usuariId: string): Observable<Avis[]> {
    return this.http.get<Avis[]>(`${this.apiUrl}/usuari/${usuariId}`);
  }

  /**
   * Envia o crea un avís nou per a un usuari.
   * @param avis Dades de la notificació a registrar
   * @returns Observable amb l'avís creat
   */
  create(avis: Partial<Avis>): Observable<Avis> {
    return this.http.post<Avis>(this.apiUrl, avis);
  }

  /**
   * Marca un avís com a llegit.
   * @param id Identificador de l'avís
   * @returns Observable buit de confirmació
   */
  markAsRead(id: string): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/llegit`, {});
  }

  /**
   * Elimina un avís del sistema.
   * @param id Identificador de l'avís
   * @returns Observable buit de confirmació
   */
  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
