import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BlacklistTelefon } from '../models/blacklist.model';
import { environment } from '../../environments/environment';

/**
 * Servei per a la gestió de la llista negra de telèfons (/api/blacklist).
 * Permet consultar, bloquejar i desbloquejar números amb permisos d'administrador.
 */
@Injectable({
  providedIn: 'root'
})
export class BlacklistService {
  private readonly apiUrl = `${environment.apiUrl}/blacklist`;

  constructor(private readonly http: HttpClient) {}


  /**
   * Obté la llista completa de telèfons a la llista negra.
   */
  getAll(): Observable<BlacklistTelefon[]> {
    return this.http.get<BlacklistTelefon[]>(this.apiUrl);
  }

  /**
   * Afegeix un número de telèfon a la llista negra.
   */
  add(telefon: string, motiu?: string): Observable<BlacklistTelefon> {
    return this.http.post<BlacklistTelefon>(
      this.apiUrl,
      { telefon, motiu }
    );
  }

  /**
   * Desbloqueja un telèfon de la llista negra pel seu ID o número.
   */
  remove(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${encodeURIComponent(id)}`);
  }
}

