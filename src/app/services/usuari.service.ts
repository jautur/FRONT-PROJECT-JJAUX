import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Usuari } from '../models/usuari.model';
import { environment } from '../../environments/environment';

/**
 * Servei del domini d'usuaris.
 * S'encarrega de comunicar el Frontend amb els endpoints REST de gestió d'usuaris i perfils (/api/users i /api/auth).
 */
@Injectable({
  providedIn: 'root'
})
export class UsuariService {
  /** URL base de l'API per a usuaris */
  private readonly apiUrl = `${environment.apiUrl}/users`;

  /** Directori públic de professionals: el que pot veure qualsevol visitant */
  private readonly professionalsUrl = `${environment.apiUrl}/professionals`;

  /** URL base de l'API per a autenticació i seguretat */
  private readonly authUrl = `${environment.apiUrl}/auth`;

  constructor(private readonly http: HttpClient) {}

  /**
   * Perfils públics de tots els professionals, sense dades de contacte. No demana sessió.
   */
  getProfessionals(): Observable<Usuari[]> {
    return this.http.get<Usuari[]>(this.professionalsUrl);
  }

  /**
   * Perfil públic d'un professional pel seu ID o nom. No demana sessió.
   */
  getProfessional(id: string): Observable<Usuari> {
    return this.http.get<Usuari>(`${this.professionalsUrl}/${encodeURIComponent(id)}`);
  }

  /**
   * Obté la llista completa de tots els usuaris registrats (només administrador).
   * @returns Observable amb la llista d'usuaris
   */
  getAll(): Observable<Usuari[]> {
    return this.http.get<Usuari[]>(this.apiUrl);
  }

  /**
   * Obté la informació detallada del perfil d'un usuari a partir del seu identificador únic.
   * @param id Identificador de l'usuari (ex: 'u-1')
   * @returns Observable amb l'usuari trobat
   */
  getById(id: string): Observable<Usuari> {
    return this.http.get<Usuari>(`${this.apiUrl}/${id}`);
  }

  /**
   * Actualitza les dades del perfil d'un usuari a la base de dades (nom, telèfon, bio).
   * @param id Identificador de l'usuari
   * @param data Dades modificades de l'usuari
   * @returns Observable amb l'usuari actualitzat
   */
  updateProfile(id: string, data: Partial<Usuari>): Observable<Usuari> {
    return this.http.put<Usuari>(`${this.apiUrl}/${id}`, data);
  }

  /**
   * Canvia la contrasenya de l'usuari autenticat.
   * @param userId Identificador de l'usuari
   * @param newPassword Nova contrasenya
   * @returns Observable amb la confirmació del servidor
   */
  changePassword(userId: string, newPassword: string): Observable<string> {
    return this.http.post<string>(`${this.authUrl}/canviar-contrasenya`, { userId, newPassword }, {
      responseType: 'text' as 'json'
    });
  }

  /**
   * Envia una sol·licitud perquè l'administrador verifiqui el compte professional mitjançant comprovació telefònica.
   * @param id Identificador de l'usuari
   * @returns Observable amb l'usuari actualitzat
   */
  sollicitarVerificacio(id: string): Observable<Usuari> {
    return this.http.post<Usuari>(`${this.apiUrl}/${id}/sollicitar-verificacio`, {});
  }

  /**
   * Permet a un administrador verificar o desverificar oficialment un professional després de la trucada.
   * @param id Identificador de l'usuari
   * @param estat true per aprovar, false per rebutjar/desverificar
   * @returns Observable amb l'usuari actualitzat
   */
  verificarProfessional(id: string, estat: boolean = true): Observable<Usuari> {
    return this.http.put<Usuari>(`${this.apiUrl}/${id}/verificar?estat=${estat}`, {});
  }

  /**
   * Elimina o dona de baixa un usuari de la plataforma.
   * @param id Identificador de l'usuari
   * @returns Observable buit de confirmació
   */
  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
