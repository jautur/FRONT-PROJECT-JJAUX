import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService, RegisterData } from '../../../core/services/auth.service';
import { TermesModalComponent } from '../termes-modal/termes-modal.component';

import { TranslatePipe } from '../../../core/pipes/translate.pipe';

/**
 * Component de Registre d'usuaris (/registre).
 * Implementa el model d'herència de AVISA:
 * - Client: requereix email i contrasenya; pot publicar peticions i feines.
 * - Professional (fill del client): hereta tot el que fa el client, requereix a més
 *   un número de telèfon obligatori i pot resoldre peticions (presentar ofertes).
 * 
 * Inclou formulari reactiu (ReactiveFormsModule) amb dues caselles obligatòries
 * no marcades per defecte (Validators.requiredTrue):
 * - acceptedTerms: Termes i Condicions d'Ús d'AVISA.
 * - acceptedPrivacy: Política de Privacitat i protecció de dades.
 * 
 * Permet obrir el modal amb el text legal complet sense sortir del formulari.
 */
@Component({
  selector: 'app-registre',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, TermesModalComponent, TranslatePipe],
  templateUrl: './registre.component.html',
  styleUrl: './registre.component.css'
})
export class RegistreComponent implements OnInit {
  /** Formulari reactiu de registre */
  registerForm!: FormGroup;

  /** Estat d'enviament per mostrar errors visuals */
  submitted = false;

  /** Estat de càrrega durant la petició HTTP */
  loading = false;

  /** Missatge d'error general o del servidor */
  errorMessage = '';

  /** Control de visibilitat del modal legal */
  showTermsModal = false;

  /** Pestanya activa del modal ('termes' o 'privacitat') */
  modalActiveTab: 'termes' | 'privacitat' = 'termes';

  constructor(
    private readonly fb: FormBuilder,
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly location: Location
  ) {}

  goBack(): void {
    if (window.history.length > 1) {
      this.location.back();
    } else {
      this.router.navigate([this.getNavUrl('/inici')]);
    }
  }

  get isAppPage(): boolean {
    const url = this.router.url || '';
    return url.startsWith('/app');
  }

  getNavUrl(path: string): string {
    if (this.isAppPage) {
      if (path === '/' || path === '/inici' || path === '/app') return '/app';
      if (path.startsWith('/app/')) return path;
      return path.startsWith('/') ? `/app${path}` : `/app/${path}`;
    }
    return path;
  }

  ngOnInit(): void {
    // Inicialització del formulari reactiu amb les dues caselles obligatòries no marcades per defecte
    this.registerForm = this.fb.group({
      rol: ['CLIENT', [Validators.required]],
      nom: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      telefon: [''],
      password: ['', [Validators.required, Validators.minLength(6)]],
      acceptedTerms: [false, [Validators.requiredTrue]],
      acceptedPrivacy: [false, [Validators.requiredTrue]]
    });
  }

  /**
   * Canvia el rol seleccionat al formulari reactiu.
   * @param rol 'CLIENT' o 'PROFESSIONAL'
   */
  onSelectRole(rol: 'CLIENT' | 'PROFESSIONAL'): void {
    this.registerForm.patchValue({ rol });
    this.errorMessage = '';
  }

  /**
   * Obre el modal legal a la pestanya de termes o de privacitat.
   */
  obrirModalTermes(tab: 'termes' | 'privacitat'): void {
    this.modalActiveTab = tab;
    this.showTermsModal = true;
  }

  /**
   * Tanca el modal legal.
   */
  tancarModalTermes(): void {
    this.showTermsModal = false;
  }

  /**
   * Gestiona l'acceptació del document des del botó d'acció del propi modal.
   * Marca automàticament la casella corresponent.
   */
  onAcceptLegal(tab: 'termes' | 'privacitat'): void {
    if (tab === 'termes') {
      this.registerForm.patchValue({ acceptedTerms: true });
      this.registerForm.get('acceptedTerms')?.markAsTouched();
    } else {
      this.registerForm.patchValue({ acceptedPrivacy: true });
      this.registerForm.get('acceptedPrivacy')?.markAsTouched();
    }
  }

  /**
   * Valida i envia les dades de registre al backend Spring Boot.
   * Comprova requisits del client, requisits del professional (telèfon)
   * i l'acceptació obligatòria de termes i privacitat.
   */
  onRegister(): void {
    this.submitted = true;
    this.errorMessage = '';

    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();

      if (this.registerForm.get('acceptedTerms')?.hasError('required')) {
        this.errorMessage = 'ERRORS.TERMS_REQUIRED';
        return;
      }
      if (this.registerForm.get('acceptedPrivacy')?.hasError('required')) {
        this.errorMessage = 'ERRORS.PRIVACY_REQUIRED';
        return;
      }
      this.errorMessage = 'ERRORS.REGISTER_FORM_CHECK';
      return;
    }

    const formVal = this.registerForm.value;

    // Validació específica del fill (Professional): requereix telèfon obligatori
    if (formVal.rol === 'PROFESSIONAL') {
      if (!formVal.telefon || !formVal.telefon.trim()) {
        this.errorMessage = 'ERRORS.PRO_PHONE_REQUIRED';
        return;
      }
    }

    this.loading = true;

    const registerData: RegisterData = {
      nom: (formVal.nom || '').trim(),
      email: (formVal.email || '').trim(),
      rol: formVal.rol,
      telefon: formVal.telefon ? formVal.telefon.trim() : '',
      password: formVal.password,
      acceptedTerms: !!formVal.acceptedTerms,
      acceptedPrivacy: !!formVal.acceptedPrivacy
    };

    this.authService.register(registerData).subscribe({
      next: () => {
        this.loading = false;
        // Sessió iniciada directament -> tornem a la pàgina principal adaptada
        this.router.navigate([this.getNavUrl('/inici')]);
      },
      error: (err) => {
        this.loading = false;
        if (err.status === 400 && err.error?.message) {
          this.errorMessage = err.error.message;
        } else if (err.status === 400 && err.error?.missatges) {
          const msgs = Object.values(err.error.missatges).join(' ');
          this.errorMessage = msgs || 'ERRORS.REGISTER_ERROR';
        } else if (err.error?.error && typeof err.error.error === 'string') {
          this.errorMessage = err.error.error;
        } else if (err.status === 0 || err.status === 502 || err.status === 504) {
          this.errorMessage = 'ERRORS.SERVER_UNREACHABLE';
        } else {
          this.errorMessage = err?.error?.message || 'ERRORS.REGISTER_ERROR';
        }
      }
    });
  }
}
