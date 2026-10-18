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

  /** URL base de l'API per a autenticació i seguretat */
  private readonly authUrl = `${environment.apiUrl}/auth`;

  constructor(private readonly http: HttpClient) {}

  /**
   * Obté la llista completa de tots els usuaris registrats.
   * Útil per a panells d'administració o directoris.
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
   * Filtra usuaris segons el seu rol ('client', 'professional', 'admin').
   * Útil per mostrar el catàleg de professionals disponibles.
   * @param rol Rol pel qual es vol filtrar
   * @returns Observable amb els usuaris del rol seleccionat
   */
  getByRol(rol: 'client' | 'professional' | 'admin'): Observable<Usuari[]> {
    return this.http.get<Usuari[]>(`${this.apiUrl}/rol/${rol}`);
  }

  /**
   * Actualitza les dades del perfil d'un usuari a la base de dades (nom, telèfon, bio).
   * @param id Identificador de l'usuari
   * @param data Dades modificades de l'usuari
   * @returns Observable amb l'usuari actualitzat
   */
  updateProfile(id: string, data: Partial<Usuari>): Observable<Usuari> {
    const raw = localStorage.getItem('jjaux_user');
    const headers: Record<string, string> = {};
    if (raw) {
      try {
        const u = JSON.parse(raw);
        if (u.rol) headers['X-User-Rol'] = u.rol;
        if (u.id) headers['X-User-Id'] = u.id;
      } catch {}
    }
    return this.http.put<Usuari>(`${this.apiUrl}/${id}`, data, { headers });
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
    const raw = localStorage.getItem('jjaux_user');
    const headers: Record<string, string> = {};
    if (raw) {
      try {
        const u = JSON.parse(raw);
        if (u.rol) headers['X-User-Rol'] = u.rol;
      } catch {}
    }
    return this.http.put<Usuari>(`${this.apiUrl}/${id}/verificar?estat=${estat}`, {}, { headers });
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
