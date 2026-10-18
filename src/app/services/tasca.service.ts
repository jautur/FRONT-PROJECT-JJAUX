import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Tasca } from '../models/tasca.model';
import { environment } from '../../environments/environment';

/**
 * DTO per a la creació d'una nova tasca per part d'un client.
 */
export interface CreateTascaDto {
  /** Títol de la tasca */
  titol: string;
  /** Descripció detallada del treball a realitzar */
  descripcio: string;
  /** Categoria del servei */
  categoria: string;
  /** Nom del client autor de la tasca */
  client: string;
  /** Pressupost estimat */
  budget: string;
  /** Estat inicial de la tasca (per defecte 'Oberta') */
  estat?: string;
}

/**
 * Servei del domini de tasques (/api/tasks).
 * S'encarrega de gestionar les demandes de serveis creades pels clients,
 * consultar llistats, veure detalls i finalitzar treballs.
 */
@Injectable({
  providedIn: 'root'
})
export class TascaService {
  /** URL base de l'endpoint de tasques */
  private readonly apiUrl = `${environment.apiUrl}/tasks`;

  constructor(private readonly http: HttpClient) {}

  /**
   * Obté el llistat complet de tasques de la plataforma.
   * @returns Observable amb la llista de tasques
   */
  getAll(): Observable<Tasca[]> {
    return this.http.get<Tasca[]>(this.apiUrl);
  }

  /**
   * Consulta el detall d'una tasca concreta pel seu identificador únic.
   * @param id Identificador de la tasca (ex: 'T-101')
   * @returns Observable amb la tasca sol·licitada
   */
  getById(id: string): Observable<Tasca> {
    return this.http.get<Tasca>(`${this.apiUrl}/${id}`);
  }

  /**
   * Obté només les tasques obertes a recepció de pressupostos.
   * Útil per a la cerca d'oportunitats per part dels professionals.
   * @returns Observable amb les tasques amb estat 'Oberta'
   */
  getAvailable(): Observable<Tasca[]> {
    return this.http.get<Tasca[]>(`${this.apiUrl}/disponibles`);
  }

  /**
   * Llista les tasques publicades per un client concret.
   * @param clientNom Nom del client
   * @returns Observable amb les tasques d'aquell client
   */
  getByClient(clientNom: string): Observable<Tasca[]> {
    return this.http.get<Tasca[]>(`${this.apiUrl}/client/${encodeURIComponent(clientNom)}`);
  }

  /**
   * Llista les tasques on el professional ha estat assignat (on convergeixen client i professional).
   * @param professionalNom Nom del professional
   * @returns Observable amb les tasques assignades a aquell professional
   */
  getByProfessional(professionalNom: string): Observable<Tasca[]> {
    return this.http.get<Tasca[]>(`${this.apiUrl}/professional/${encodeURIComponent(professionalNom)}`);
  }

  /**
   * Crea i publica una nova tasca a la plataforma.
   * @param data Dades de la tasca a crear
   * @returns Observable amb la tasca creada a la base de dades
   */
  create(data: CreateTascaDto): Observable<Tasca> {
    return this.http.post<Tasca>(this.apiUrl, data);
  }

  /**
   * Marca una tasca com a finalitzada un cop acabat el servei, enregistrant opcionalment la valoració i opinió del client.
   * @param id Identificador de la tasca
   * @param avaluacio Dades opcionals de valoració (1-5 estrelles) i opinió del client
   * @returns Observable amb la tasca actualitzada
   */
  complete(id: string, avaluacio?: { valoracio?: number; opinio?: string }): Observable<Tasca> {
    return this.http.post<Tasca>(`${this.apiUrl}/${id}/finalitzar`, avaluacio || {});
  }

  /**
   * Avalua o actualitza la valoració d'una tasca per part del client (encara que ja estiga finalitzada).
   * @param id Identificador de la tasca
   * @param avaluacio Dades de valoració (1-5 estrelles) i opinió del client
   * @returns Observable amb la tasca actualitzada
   */
  avaluar(id: string, avaluacio: { valoracio: number; opinio?: string }): Observable<Tasca> {
    return this.http.post<Tasca>(`${this.apiUrl}/${id}/avaluar`, avaluacio);
  }

  /**
   * Elimina una tasca de la base de dades.
   * @param id Identificador de la tasca
   * @returns Observable buit de confirmació
   */
  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
