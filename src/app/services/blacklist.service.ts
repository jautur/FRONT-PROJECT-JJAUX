import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BlacklistTelefon } from '../models/blacklist.model';
import { AuthService } from '../core/services/auth.service';
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

  constructor(
    private readonly http: HttpClient,
    private readonly authService: AuthService
  ) {}

  private getHeaders(): HttpHeaders {
    let headers = new HttpHeaders();
    const user = this.authService.getCurrentUser();
    if (user) {
      if (user.rol) {
        headers = headers.set('X-User-Rol', user.rol);
      }
      if (user.nom) {
        headers = headers.set('X-User-Nom', user.nom);
      }
    }
    return headers;
  }

  /**
   * Obté la llista completa de telèfons a la llista negra.
   */
  getAll(): Observable<BlacklistTelefon[]> {
    return this.http.get<BlacklistTelefon[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  /**
   * Comprova si un número està bloquejat.
   */
  check(telefon: string): Observable<{ telefon: string; blacklisted: boolean }> {
    return this.http.get<{ telefon: string; blacklisted: boolean }>(`${this.apiUrl}/check`, {
      params: { telefon },
      headers: this.getHeaders()
    });
  }

  /**
   * Afegeix un número de telèfon a la llista negra.
   */
  add(telefon: string, motiu?: string): Observable<BlacklistTelefon> {
    return this.http.post<BlacklistTelefon>(
      this.apiUrl,
      { telefon, motiu },
      { headers: this.getHeaders() }
    );
  }

  /**
   * Desbloqueja un telèfon de la llista negra pel seu ID o número.
   */
  remove(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${encodeURIComponent(id)}`, {
      headers: this.getHeaders()
    });
  }
}

