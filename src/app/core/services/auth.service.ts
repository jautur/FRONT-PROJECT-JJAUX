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
 * - Client: requereix nom, email, password.
 * - Professional (fill de client): requereix nom, email, password i telèfon obligatori.
 */
export interface RegisterData {
  nom: string;
  email: string;
  rol: 'client' | 'professional';
  password?: string;
  telefon?: string;
}

/**
 * Servei central d'Autenticació i Gestió de Sessió de l'aplicació JJAUX.
 * S'encarrega d'iniciar sessió, registrar usuaris amb model d'herència
 * (el Professional hereta totes les capacitats del Client i afegeix resolució de peticions + telèfon),
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
   * Comprova si l'usuari connectat té permisos de client (publicar feines, gestionar les seves tasques).
   * Segons el model d'herència ("el professional és el fill del client"):
   * Tant el 'client' com el 'professional' (i l'admin) tenen permisos de client!
   */
  isClient(): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;
    const r = user.rol?.toLowerCase();
    return r === 'client' || r === 'professional' || r === 'admin';
  }

  /**
   * Comprova si l'usuari connectat té permisos de professional (resoldre peticions, enviar ofertes).
   * Retorna true per al rol 'professional' i l'administrador global.
   */
  isProfessional(): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;
    const r = user.rol?.toLowerCase();
    return r === 'professional' || r === 'admin';
  }

  /**
   * Comprova si l'usuari connectat té el rol d'administrador global.
   */
  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.rol?.toLowerCase() === 'admin';
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
   * @param data Dades del formulari de registre (amb telèfon inclòs si és professional)
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
   * @param rol Rol a verificar ('client' | 'professional' | 'admin')
   * @returns true si coincideix exactament, false en cas contrari
   */
  hasRole(rol: RolUsuari): boolean {
    const user = this.getCurrentUser();
    return user?.rol === rol;
  }

  /**
   * Canvia la contrasenya d'un usuari.
   * L'administrador pot canviar la contrasenya de qualsevol usuari sense conèixer l'antiga.
   * @param userId Identificador de l'usuari
   * @param newPassword Nova contrasenya desitjada (mínim 6 caràcters)
   * @returns Observable amb el missatge de confirmació del servidor
   */
  canviarContrasenya(userId: string, newPassword: string): Observable<string> {
    return this.http.post(`${this.apiUrl}/canviar-contrasenya`, {
      userId,
      newPassword
    }, { responseType: 'text' });
  }
}
