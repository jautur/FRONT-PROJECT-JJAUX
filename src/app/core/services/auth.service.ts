import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Usuari } from '../../models/usuari.model';
import { environment } from '../../../environments/environment';

/**
 * Model per a les credencials d'accés (email i contrasenya).
 */
export interface LoginCredentials {
  email: string;
  password?: string;
}

/**
 * Model per a les dades sol·licitades al registre d'un nou compte.
 */
export interface RegisterData {
  nom: string;
  email: string;
  rol: 'client' | 'professional' | 'admin';
  password?: string;
}

/**
 * Servei central d'Autenticació i Gestió de Sessió de l'aplicació.
 * S'encarrega d'iniciar sessió, registrar usuaris, mantenir l'estat local a localStorage
 * i verificar permisos segons el rol de l'usuari.
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  /** Ruta base cap a la API d'autenticació del backend */
  private readonly apiUrl = `${environment.apiUrl}/auth`;

  /** Clau utilitzada per desar l'usuari a localStorage */
  private readonly USER_KEY = 'jjaux_user';

  constructor(private readonly http: HttpClient) {}

  /**
   * Comprova si hi ha un usuari amb sessió iniciada en aquest moment.
   * @returns true si l'usuari està autenticat, false en cas contrari
   */
  isLoggedIn(): boolean {
    return !!this.getCurrentUser();
  }

  /**
   * Recupera les dades de l'usuari actualment connectat des del magatzem local.
   * @returns Objecte Usuari o null si no hi ha sessió iniciada
   */
  getCurrentUser(): Usuari | null {
    const raw = localStorage.getItem(this.USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as Usuari;
    } catch {
      return null;
    }
  }

  /**
   * Desa o actualitza les dades de l'usuari a la sessió local.
   * @param user Dades de l'usuari a persistir
   */
  setCurrentUser(user: Usuari): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  /**
   * Inicia sessió enviant les credencials al backend (/api/auth/login).
   * En cas d'èxit, desa automàticament l'usuari a la sessió local.
   * @param credentials Correu i contrasenya
   * @returns Observable amb les dades de l'usuari obtingudes
   */
  login(credentials: LoginCredentials): Observable<Usuari> {
    return this.http.post<Usuari>(`${this.apiUrl}/login`, credentials).pipe(
      tap((user) => this.setCurrentUser(user))
    );
  }

  /**
   * Registra un nou compte d'usuari al sistema (/api/auth/register).
   * @param data Dades del formulari de registre
   * @returns Observable amb l'usuari creat
   */
  register(data: RegisterData): Observable<Usuari> {
    return this.http.post<Usuari>(`${this.apiUrl}/register`, data).pipe(
      tap((user) => this.setCurrentUser(user))
    );
  }

  /**
   * Consulta el backend per verificar la sessió activa actual (/api/auth/me).
   * @returns Observable amb les dades de l'usuari
   */
  me(): Observable<Usuari> {
    return this.http.get<Usuari>(`${this.apiUrl}/me`).pipe(
      tap((user) => this.setCurrentUser(user))
    );
  }

  /**
   * Tanca la sessió eliminant les dades de l'usuari del magatzem local.
   */
  logout(): void {
    localStorage.removeItem(this.USER_KEY);
  }

  /**
   * Comprova si l'usuari connectat té un rol específic (ex: 'client', 'professional', 'admin').
   * @param rol Rol a verificar
   * @returns true si coincideix, false en cas contrari
   */
  hasRole(rol: 'client' | 'professional' | 'admin'): boolean {
    const user = this.getCurrentUser();
    return user?.rol === rol;
  }
}
