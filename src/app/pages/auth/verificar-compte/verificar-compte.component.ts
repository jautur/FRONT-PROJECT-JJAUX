import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';

@Component({
  selector: 'app-verificar-compte',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslatePipe],
  template: `
    <section class="verify-card">
      <div *ngIf="estat === 'carregant'" class="state-container">
        <div class="spinner"></div>
        <h2>{{ 'AUTH.VERIFY.LOADING_TITLE' | translate }}</h2>
        <p>{{ 'AUTH.VERIFY.LOADING_DESC' | translate }}</p>
      </div>

      <div *ngIf="estat === 'exit'" class="state-container success">
        <div class="icon-wrap success-icon">
          <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>
        <h2>{{ 'AUTH.VERIFY.SUCCESS_TITLE' | translate }}</h2>
        <p>{{ 'AUTH.VERIFY.SUCCESS_DESC' | translate }}</p>
        <a [routerLink]="['/login']" class="btn-primary">
          {{ 'AUTH.VERIFY.GOTO_LOGIN' | translate }}
        </a>
      </div>

      <div *ngIf="estat === 'error'" class="state-container error">
        <div class="icon-wrap error-icon">
          <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </div>
        <h2>{{ 'AUTH.VERIFY.ERROR_TITLE' | translate }}</h2>
        <p>{{ missatgeError || ('AUTH.VERIFY.ERROR_DESC' | translate) }}</p>
        <a [routerLink]="['/login']" class="btn-secondary">
          {{ 'AUTH.VERIFY.BACK_LOGIN' | translate }}
        </a>
      </div>
    </section>
  `,
  styles: [`
    .verify-card {
      width: min(520px, 92%);
      margin: 3rem auto;
      background: var(--bg-card, #ffffff);
      padding: 3rem 2.2rem;
      border-radius: var(--radius-xl, 20px);
      border: 1px solid var(--border-subtle, #e5e0d7);
      box-shadow: var(--shadow-lg, 0 16px 40px rgba(0, 0, 0, 0.06));
      text-align: center;
      box-sizing: border-box;
    }
    .state-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1.1rem;
    }
    .icon-wrap {
      width: 72px;
      height: 72px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 0.5rem;
    }
    .success-icon {
      background: #e8f5e9;
      color: #2e7d32;
    }
    .error-icon {
      background: #ffebee;
      color: #ff1744;
    }
    h2 {
      margin: 0;
      font-size: 1.6rem;
      font-weight: 800;
      color: var(--color-text, #09090c);
    }
    p {
      margin: 0;
      font-size: 0.96rem;
      color: #57554e;
      line-height: 1.5;
    }
    .spinner {
      width: 48px;
      height: 48px;
      border: 4px solid #f0ece3;
      border-top-color: #ff1744;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    .btn-primary, .btn-secondary {
      display: inline-block;
      margin-top: 1rem;
      padding: 0.85rem 1.8rem;
      border-radius: 10px;
      font-weight: 700;
      font-size: 0.95rem;
      text-decoration: none;
      transition: all 0.15s ease;
    }
    .btn-primary {
      background: #ff1744;
      color: #ffffff;
      box-shadow: 0 4px 14px rgba(255, 23, 68, 0.3);
    }
    .btn-primary:hover {
      background: #09090c;
    }
    .btn-secondary {
      background: #f0ece3;
      color: #09090c;
    }
    .btn-secondary:hover {
      background: #e2ddd3;
    }
  `]
})
export class VerificarCompteComponent implements OnInit {
  estat: 'carregant' | 'exit' | 'error' = 'carregant';
  missatgeError = '';

  constructor(
    private readonly route: ActivatedRoute,
    private readonly authService: AuthService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      const token = params['token'];
      if (!token) {
        this.estat = 'error';
        return;
      }
      this.authService.verificarEmail(token).subscribe({
        next: (res) => {
          if (res.success) {
            this.estat = 'exit';
          } else {
            this.estat = 'error';
            this.missatgeError = res.message;
          }
        },
        error: (err) => {
          this.estat = 'error';
          this.missatgeError = err.error?.message || '';
        }
      });
    });
  }
}
