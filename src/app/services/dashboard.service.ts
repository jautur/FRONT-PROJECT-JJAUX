import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface DashboardTask {
  id: string;
  titol: string;
  descripcio: string;
  categoria: string;
  client: string;
  budget: string;
  estat: string;
}

export interface DashboardOffer {
  id: string;
  tascaId: string;
  professional: string;
  price: string;
  note: string;
  estat: string;
}

export interface DashboardResponse {
  openTasks: number;
  activeOffers: number;
  completedProjects: number;
  tasks: DashboardTask[];
  offers: DashboardOffer[];
}

@Injectable({ providedIn: 'root' })
export class DashboardService {

	private readonly apiUrl = environment.apiUrl;

	constructor(private readonly http: HttpClient) {}

	getDashboard(): Observable<DashboardResponse> {
		return this.http.get<DashboardResponse>(`${this.apiUrl}/dashboard`);
	}
}