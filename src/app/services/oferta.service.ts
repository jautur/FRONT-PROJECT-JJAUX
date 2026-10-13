import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Oferta } from '../models/oferta.model';
import { environment } from '../../environments/environment';

/**
 * DTO per a l'enviament d'una nova oferta per part d'un professional.
 */
export interface CreateOfertaDto {
  /** Identificador de la tasca a la qual s'aplica */
  tascaId: string;
  /** Nom del professional emissor */
  professional: string;
  /** Preu o import ofertat (ex: '€450') */
  price: string;
  /** Explicació de la proposta o terminis */
  note?: string;
  /** Estat inicial (per defecte 'Pendent') */
  estat?: string;
}

/**
 * Servei del domini d'ofertes (/api/offers).
 * S'encarrega de gestionar les candidatures dels professionals i les decisions
 * d'acceptació o rebuig preses pels clients.
 */
@Injectable({
  providedIn: 'root'
})
export class OfertaService {
  /** URL base de l'endpoint d'ofertes */
  private readonly apiUrl = `${environment.apiUrl}/offers`;

  constructor(private readonly http: HttpClient) {}

  /**
   * Obté totes les ofertes registrades a la plataforma.
   * @returns Observable amb la llista d'ofertes
   */
  getAll(): Observable<Oferta[]> {
    return this.http.get<Oferta[]>(this.apiUrl);
  }

  /**
   * Obté les ofertes rebudes per a una tasca concreta.
   * Permet al client comparar els pressupostos dels professionals.
   * @param tascaId Identificador de la tasca
   * @returns Observable amb les ofertes vinculades
   */
  getByTasca(tascaId: string): Observable<Oferta[]> {
    return this.http.get<Oferta[]>(`${this.apiUrl}/tasca/${tascaId}`);
  }

  /**
   * Obté les ofertes enviades per un professional concret.
   * @param professionalNom Nom del professional
   * @returns Observable amb les candidatures del professional
   */
  getByProfessional(professionalNom: string): Observable<Oferta[]> {
    return this.http.get<Oferta[]>(`${this.apiUrl}/professional/${encodeURIComponent(professionalNom)}`);
  }

  /**
   * Envia una nova oferta econòmica per a una tasca oberta.
   * @param data Dades de l'oferta
   * @returns Observable amb l'oferta creada a PostgreSQL
   */
  create(data: CreateOfertaDto): Observable<Oferta> {
    return this.http.post<Oferta>(this.apiUrl, data);
  }

  /**
   * Accepta una oferta seleccionada pel client.
   * L'oferta passa a estat 'Acceptada', les altres es rebutgen i la tasca passa a 'En curs'.
   * @param id Identificador de l'oferta
   * @returns Observable amb l'oferta acceptada
   */
  accept(id: string): Observable<Oferta> {
    return this.http.post<Oferta>(`${this.apiUrl}/${id}/acceptar`, {});
  }

  /**
   * Rebutja una oferta descartada pel client.
   * @param id Identificador de l'oferta
   * @returns Observable amb l'oferta rebutjada
   */
  reject(id: string): Observable<Oferta> {
    return this.http.post<Oferta>(`${this.apiUrl}/${id}/rebutjar`, {});
  }
}
