import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Usuari } from '../../models/usuari.model';
import { environment } from '../../../environments/environment';

export interface LoginCredentials {
  email: string;
  password?: string;
}

export interface RegisterData {
  nom: string;
  email: string;
  rol: 'client' | 'professional' | 'admin';
  password?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiUrl = `${environment.apiUrl}/auth`;
  private readonly USER_KEY = 'jjaux_user';

  constructor(private readonly http: HttpClient) {}

  isLoggedIn(): boolean {
    return !!this.getCurrentUser();
  }

  getCurrentUser(): Usuari | null {
    const raw = localStorage.getItem(this.USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as Usuari;
    } catch {
      return null;
    }
  }

  setCurrentUser(user: Usuari): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  login(credentials: LoginCredentials): Observable<Usuari> {
    return this.http.post<Usuari>(`${this.apiUrl}/login`, credentials).pipe(
      tap((user) => this.setCurrentUser(user))
    );
  }

  register(data: RegisterData): Observable<Usuari> {
    return this.http.post<Usuari>(`${this.apiUrl}/register`, data).pipe(
      tap((user) => this.setCurrentUser(user))
    );
  }

  me(): Observable<Usuari> {
    return this.http.get<Usuari>(`${this.apiUrl}/me`).pipe(
      tap((user) => this.setCurrentUser(user))
    );
  }

  logout(): void {
    localStorage.removeItem(this.USER_KEY);
  }

  hasRole(rol: 'client' | 'professional' | 'admin'): boolean {
    const user = this.getCurrentUser();
    return user?.rol === rol;
  }
}

