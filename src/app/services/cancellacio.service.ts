import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ResolucioCancellacio, SollicitudCancellacio } from '../models/cancellacio.model';
import { environment } from '../../environments/environment';

/**
 * Servei de cancel·lacions de tasques. Només un administrador les pot llistar i resoldre.
 * L'usuari que actua és el del token JWT: mai es pot indicar des del cos de la petició.
 */
@Injectable({
  providedIn: 'root'
})
export class CancellacioService {
  private readonly apiUrl = `${environment.apiUrl}/cancellacions`;

  constructor(private readonly http: HttpClient) {}

  getAll(nomesPendents = false): Observable<SollicitudCancellacio[]> {
    const params = new HttpParams().set('pendents', String(nomesPendents));
    return this.http.get<SollicitudCancellacio[]>(this.apiUrl, { params });
  }

  getNegligencies(usuariId: string): Observable<SollicitudCancellacio[]> {
    return this.http.get<SollicitudCancellacio[]>(`${this.apiUrl}/negligencies/${encodeURIComponent(usuariId)}`);
  }

  resoldre(id: string, resolucio: ResolucioCancellacio, responsableId?: string): Observable<SollicitudCancellacio> {
    return this.http.post<SollicitudCancellacio>(`${this.apiUrl}/${id}/resoldre`, {
      resolucio,
      responsableId: resolucio === 'NEGLIGENCIA' ? responsableId : null
    });
  }
}
