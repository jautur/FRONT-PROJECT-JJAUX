import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';
import { environment } from '../../../../environments/environment';

/**
 * Component d'Inici de Sessió (/login).
 * Permet a clients, professionals i administradors autenticar-se a la plataforma AVISA
 * amb les seves credencials (correu electrònic i contrasenya).
 * Inclou suport complet per al flux de recuperació de contrasenya (modal interactiu en 2 passos),
 * gestió d'errors d'autenticació, redirecció returnUrl i enllaç cap al registre (/registre).
 */
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TranslatePipe],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  email = '';
  password = '';
  loading = false;
  error = '';
  message = '';
  returnUrl = '/';

  // Estat del modal de recuperació
  mostrarModalRecuperacio = false;
  pasRecuperacio: 1 | 2 | 3 = 1;
  recuperarEmail = '';
  recuperarCodi = '';
  novaContrasenya = '';
  confirmarContrasenya = '';
  recuperarLoading = false;
  recuperarError = '';

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      if (params['message']) {
        this.message = params['message'];
      }
      if (params['returnUrl']) {
        this.returnUrl = params['returnUrl'];
      }
    });
  }

  /** Comptes de prova: buit en el build de producció. */
  readonly accesRapid = environment.accesRapid;

  omplirCredencials(u: string, p: string): void {
    this.email = u;
    this.password = p;
    this.error = '';
    this.onSubmit();
  }

  get isAppPage(): boolean {
    const url = this.router.url || '';
    return url.startsWith('/app');
  }

  goBack(): void {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      window.history.back();
    } else {
      this.router.navigate([this.getNavUrl('/inici')]);
    }
  }

  getNavUrl(path: string): string {
    if (this.isAppPage) {
      if (path === '/' || path === '/inici' || path === '/app') return '/app';
      if (path.startsWith('/app/')) return path;
      return path.startsWith('/') ? `/app${path}` : `/app/${path}`;
    }
    return path;
  }

  onSubmit(): void {
    const cleanEmail = (this.email || '').trim();
    const cleanPassword = (this.password || '').trim();

    if (!cleanEmail) {
      this.error = 'AUTH.LOGIN.ERROR_REQUIRED';
      return;
    }
    this.loading = true;
    this.error = '';

    this.authService.login({ email: cleanEmail, password: cleanPassword }).subscribe({
      next: () => {
        this.loading = false;
        const target = (this.isAppPage && (this.returnUrl === '/' || this.returnUrl === '/inici')) ? '/app' : this.returnUrl;
        this.router.navigateByUrl(target);
      },
      error: (err) => {
        this.loading = false;
        if (err.status === 401) {
          this.error = 'AUTH.LOGIN.ERROR_INVALID';
        } else if (err.status === 429) {
          // Compte bloquejat temporalment per massa intents: el back diu quants minuts falten
          this.error = err?.error?.error || 'AUTH.LOGIN.ERROR_GENERIC';
        } else if (err.status === 0) {
          this.error = 'AUTH.LOGIN.ERROR_SERVER';
        } else {
          this.error = 'AUTH.LOGIN.ERROR_GENERIC';
        }
      }
    });
  }

  // --- MÈTODES DE RECUPERACIÓ DE CONTRASENYA ---

  obrirModalRecuperacio(): void {
    this.mostrarModalRecuperacio = true;
    this.pasRecuperacio = 1;
    this.recuperarEmail = this.email.trim();
    this.recuperarCodi = '';
    this.novaContrasenya = '';
    this.confirmarContrasenya = '';
    this.recuperarError = '';
  }

  tancarModalRecuperacio(): void {
    this.mostrarModalRecuperacio = false;
    this.recuperarLoading = false;
  }

  tornarPas1(): void {
    this.pasRecuperacio = 1;
    this.recuperarError = '';
  }


  sollicitarCodi(): void {
    const mail = this.recuperarEmail.trim();
    if (!mail) {
      this.recuperarError = 'AUTH.LOGIN.ERROR_REQUIRED';
      return;
    }
    this.recuperarLoading = true;
    this.recuperarError = '';

    this.authService.demanarRecuperacio(mail).subscribe({
      next: (resp) => {
        this.recuperarLoading = false;
        // El codi no arriba mai al navegador: en desenvolupament es llig al log del backend
        this.pasRecuperacio = 2;
      },
      error: (err) => {
        this.recuperarLoading = false;
        if (err.status === 0) {
          this.recuperarError = 'AUTH.LOGIN.ERROR_SERVER';
        } else {
          this.recuperarError = err?.error?.message || 'AUTH.LOGIN.ERROR_GENERIC';
        }
      }
    });
  }

  aplicarNovaContrasenya(): void {
    const codi = this.recuperarCodi.trim();
    const p1 = this.novaContrasenya.trim();
    const p2 = this.confirmarContrasenya.trim();

    if (!codi) {
      this.recuperarError = 'AUTH.LOGIN.RECOVERY_CODE_LABEL';
      return;
    }
    if (p1.length < 6) {
      this.recuperarError = 'AUTH.LOGIN.RECOVERY_PWD_LENGTH';
      return;
    }
    if (p1 !== p2) {
      this.recuperarError = 'AUTH.LOGIN.RECOVERY_PWD_MISMATCH';
      return;
    }

    this.recuperarLoading = true;
    this.recuperarError = '';

    this.authService.restablirContrasenya(this.recuperarEmail.trim(), codi, p1).subscribe({
      next: () => {
        this.recuperarLoading = false;
        this.pasRecuperacio = 3;
      },
      error: (err) => {
        this.recuperarLoading = false;
        if (err.status === 0) {
          this.recuperarError = 'AUTH.LOGIN.ERROR_SERVER';
        } else {
          this.recuperarError = err?.error?.message || 'AUTH.LOGIN.ERROR_GENERIC';
        }
      }
    });
  }

  tancarModalAmbExit(): void {
    this.email = this.recuperarEmail.trim();
    this.password = this.novaContrasenya.trim();
    this.tancarModalRecuperacio();
  }
}
