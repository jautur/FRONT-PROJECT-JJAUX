import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Incidencia } from '../models/incidencia.model';

/**
 * Model de dades per a tasques retornades al resum del Dashboard.
 */
export interface DashboardTask {
  id: string;
  titol: string;
  descripcio: string;
  categoria: string;
  client: string;
  professional?: string;
  budget: string;
  estat: string;
  tipus?: string;
}

export interface DashboardOffer {
  id: string;
  tascaId: string;
  professional: string;
  price: string;
  note: string;
  estat: string;
}

/**
 * Estructura de resposta global del Dashboard amb mètriques i llistats.
 */
export interface DashboardResponse {
  openTasks: number;
  activeOffers: number;
  completedProjects: number;
  tasks: DashboardTask[];
  offers: DashboardOffer[];
  incidencies?: Incidencia[];
}

/**
 * Servei per a la consulta del tauler de control i resum global (/api/dashboard).
 * Proporciona mètriques en temps real de feines obertes, ofertes actives i projectes conclosos.
 */
@Injectable({ providedIn: 'root' })
export class DashboardService {

	private readonly apiUrl = environment.apiUrl;

	constructor(private readonly http: HttpClient) {}

	getDashboard(): Observable<DashboardResponse> {
		return this.http.get<DashboardResponse>(`${this.apiUrl}/dashboard`);
	}
}