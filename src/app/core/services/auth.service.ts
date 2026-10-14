import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Usuari, RolUsuari } from '../../models/usuari.model';
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
  rol: RolUsuari;
  password?: string;
}

/**
 * Servei central d'Autenticació i Gestió de Sessió de l'aplicació JJAUX.
 * S'encarrega d'iniciar sessió, registrar usuaris (clients, professionals o ambdós),
 * mantenir l'estat local a localStorage i verificar permisos d'accés.
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
   * Comprova si l'usuari connectat té permisos de client.
   * Retorna true si el seu rol és 'client', 'ambdos' o 'admin'.
   */
  isClient(): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;
    const r = user.rol?.toLowerCase();
    return r === 'client' || r === 'ambdos' || r === 'admin';
  }

  /**
   * Comprova si l'usuari connectat té permisos de professional.
   * Retorna true si el seu rol és 'professional', 'ambdos' o 'admin'.
   */
  isProfessional(): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;
    const r = user.rol?.toLowerCase();
    return r === 'professional' || r === 'ambdos' || r === 'admin';
  }

  /**
   * Comprova si l'usuari connectat té el rol d'administrador global.
   */
  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.rol?.toLowerCase() === 'admin';
  }

  /**
   * Comprova si l'usuari és híbrid (client i professional simultàniament).
   */
  isBoth(): boolean {
    const user = this.getCurrentUser();
    return user?.rol?.toLowerCase() === 'ambdos';
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
   * Comprova si l'usuari connectat té un rol específic.
   * @param rol Rol a verificar ('client' | 'professional' | 'ambdos' | 'admin')
   * @returns true si coincideix, false en cas contrari
   */
  hasRole(rol: RolUsuari): boolean {
    const user = this.getCurrentUser();
    return user?.rol === rol;
  }
}
