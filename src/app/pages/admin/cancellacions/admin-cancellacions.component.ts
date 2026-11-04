import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ResolucioCancellacio, SollicitudCancellacio } from '../../../models/cancellacio.model';
import { Tasca } from '../../../models/tasca.model';
import { Usuari } from '../../../models/usuari.model';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';
import { CancellacioService } from '../../../services/cancellacio.service';
import { TascaService } from '../../../services/tasca.service';
import { UsuariService } from '../../../services/usuari.service';

interface Seleccio {
  resolucio: ResolucioCancellacio | '';
  responsableId: string;
}

/**
 * Gestió de les cancel·lacions de tasques per a l'administrador:
 * resol cada sol·licitud (sense conseqüències, negligència o rebutjada) i consulta l'historial de negligències d'un usuari.
 * La negligència no té conseqüències automàtiques: l'administrador decideix després si avisa o bloqueja un telèfon.
 */
@Component({
  selector: 'app-admin-cancellacions',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  template: `
    <section class="canc-panel">
      <div class="canc-toolbar">
        <h2>{{ 'TREBALL.ADMIN_CANCEL_TITLE' | translate }}</h2>
        <label class="canc-check">
          <input type="checkbox" [(ngModel)]="mostrarResoltes" (ngModelChange)="carregar()" />
          {{ 'TREBALL.ADMIN_SHOW_RESOLVED' | translate }}
        </label>
      </div>

      <p class="canc-msg ok" role="status" *ngIf="missatgeOk">{{ missatgeOk | translate }}</p>
      <p class="canc-msg error" role="alert" *ngIf="missatgeError">{{ missatgeError | translate }}</p>
      <p class="canc-buit" *ngIf="!carregant && sollicituds.length === 0">{{ 'TREBALL.ADMIN_CANCEL_EMPTY' | translate }}</p>

      <article class="canc-card" *ngFor="let s of sollicituds">
        <header>
          <strong>{{ s.tascaTitol || s.tascaId }}</strong>
          <span class="canc-badge" [class.pendent]="!s.resolucio">
            {{ s.resolucio ? ('TREBALL.RES_' + s.resolucio | translate) : ('TREBALL.ADMIN_PENDING' | translate) }}
          </span>
        </header>
        <p class="canc-linia">
          <span>{{ 'TREBALL.ADMIN_REQUESTED_BY' | translate }}</span> <strong>{{ s.sollicitantNom }}</strong>
          · {{ s.createdAt | date: 'dd/MM/yyyy HH:mm' }}
        </p>
        <p class="canc-motiu">«{{ s.motiu }}»</p>
        <p class="canc-linia" *ngIf="s.resolucio === 'NEGLIGENCIA'">
          <span>{{ 'TREBALL.ADMIN_RESPONSIBLE' | translate }}</span> <strong>{{ s.responsableNom }}</strong>
        </p>

        <div class="canc-resol" *ngIf="!s.resolucio">
          <label [for]="'res-' + s.id">{{ 'TREBALL.ADMIN_RESOLUTION' | translate }}</label>
          <select [id]="'res-' + s.id" [(ngModel)]="seleccio[s.id].resolucio">
            <option value="">—</option>
            <option value="SENSE_CONSEQUENCIES">{{ 'TREBALL.RES_SENSE_CONSEQUENCIES' | translate }}</option>
            <option value="NEGLIGENCIA">{{ 'TREBALL.RES_NEGLIGENCIA' | translate }}</option>
            <option value="REBUTJADA">{{ 'TREBALL.RES_REBUTJADA' | translate }}</option>
          </select>

          <ng-container *ngIf="seleccio[s.id].resolucio === 'NEGLIGENCIA'">
            <label [for]="'resp-' + s.id">{{ 'TREBALL.ADMIN_RESPONSIBLE' | translate }}</label>
            <select [id]="'resp-' + s.id" [(ngModel)]="seleccio[s.id].responsableId">
              <option value="">—</option>
              <option *ngIf="tasques[s.tascaId]?.clientId as cid" [value]="cid">
                {{ 'COMMON.CLIENT' | translate }}: {{ tasques[s.tascaId]?.clientNom || tasques[s.tascaId]?.client }}
              </option>
              <option *ngIf="tasques[s.tascaId]?.professionalId as pid" [value]="pid">
                {{ 'COMMON.PROFESSIONAL' | translate }}: {{ tasques[s.tascaId]?.professionalNom || tasques[s.tascaId]?.professional }}
              </option>
            </select>
            <p class="canc-nota">{{ 'TREBALL.ADMIN_NEGLIGENCE_NOTE' | translate }}</p>
          </ng-container>

          <button type="button" class="canc-btn" (click)="resoldre(s)" [disabled]="!potResoldre(s) || resolent === s.id">
            {{ 'TREBALL.ADMIN_RESOLVE' | translate }}
          </button>
        </div>
      </article>

      <section class="canc-historial">
        <h3>{{ 'TREBALL.ADMIN_NEG_HISTORY' | translate }}</h3>
        <label for="neg-usuari">{{ 'TREBALL.ADMIN_NEG_USER' | translate }}</label>
        <select id="neg-usuari" [(ngModel)]="usuariHistorial" (ngModelChange)="carregarHistorial()">
          <option value="">—</option>
          <option *ngFor="let u of usuaris" [value]="u.id">{{ u.nom }} ({{ u.rol }})</option>
        </select>
        <p class="canc-buit" *ngIf="usuariHistorial && historial.length === 0">{{ 'TREBALL.ADMIN_NEG_EMPTY' | translate }}</p>
        <ul class="canc-llista" *ngIf="historial.length > 0">
          <li *ngFor="let h of historial">
            <strong>{{ h.tascaTitol }}</strong> · {{ h.dataResolucio | date: 'dd/MM/yyyy' }}<br />
            <span>«{{ h.motiu }}»</span>
          </li>
        </ul>
      </section>
    </section>
  `,
  styles: [`
    .canc-panel { display: flex; flex-direction: column; gap: 1rem; }
    .canc-toolbar { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.75rem; }
    .canc-toolbar h2 { margin: 0; font-size: 1.2rem; }
    .canc-check { display: inline-flex; gap: 0.4rem; align-items: center; font-weight: 700; font-size: 0.85rem; }
    .canc-card { border: 1px solid #e5e0d7; border-radius: 14px; padding: 1rem; background: #ffffff; display: flex; flex-direction: column; gap: 0.45rem; color: #09090c; }
    .canc-card header { display: flex; justify-content: space-between; gap: 0.5rem; flex-wrap: wrap; align-items: center; }
    .canc-badge { padding: 0.2rem 0.6rem; border-radius: 999px; font-size: 0.72rem; font-weight: 800; background: #f1f5f9; color: #334155; }
    .canc-badge.pendent { background: #fef3c7; color: #92400e; }
    .canc-linia, .canc-motiu, .canc-nota, .canc-buit { margin: 0; font-size: 0.85rem; }
    .canc-motiu { font-style: italic; }
    .canc-nota { color: #57534e; }
    .canc-resol { display: flex; flex-direction: column; gap: 0.35rem; margin-top: 0.4rem; }
    .canc-resol label, .canc-historial label { font-weight: 700; font-size: 0.8rem; }
    select { padding: 0.55rem; border-radius: 8px; border: 1px solid #d6d3d1; font: inherit; min-height: 44px; }
    .canc-btn { align-self: flex-start; padding: 0.65rem 1.1rem; border-radius: 10px; border: 0; background: #ff1744; color: #ffffff; font-weight: 800; cursor: pointer; min-height: 44px; }
    .canc-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .canc-msg { margin: 0; padding: 0.6rem 0.8rem; border-radius: 8px; font-weight: 700; font-size: 0.85rem; }
    .canc-msg.ok { background: #dcfce7; color: #166534; }
    .canc-msg.error { background: #fee2e2; color: #991b1b; }
    .canc-historial { display: flex; flex-direction: column; gap: 0.4rem; border-top: 1px solid #e5e0d7; padding-top: 1rem; }
    .canc-historial h3 { margin: 0; font-size: 1rem; }
    .canc-llista { margin: 0; padding-left: 1.1rem; font-size: 0.85rem; display: flex; flex-direction: column; gap: 0.4rem; }
  `]
})
export class AdminCancellacionsComponent implements OnInit {
  sollicituds: SollicitudCancellacio[] = [];
  tasques: Record<string, Tasca> = {};
  seleccio: Record<string, Seleccio> = {};
  usuaris: Usuari[] = [];
  historial: SollicitudCancellacio[] = [];
  usuariHistorial = '';
  mostrarResoltes = false;
  carregant = false;
  resolent = '';
  missatgeOk = '';
  missatgeError = '';

  constructor(
    private readonly cancellacioService: CancellacioService,
    private readonly tascaService: TascaService,
    private readonly usuariService: UsuariService
  ) {}

  ngOnInit(): void {
    this.carregar();
    this.usuariService.getAll().pipe(catchError(() => of([] as Usuari[]))).subscribe((u) => (this.usuaris = u));
  }

  carregar(): void {
    this.carregant = true;
    this.cancellacioService.getAll(!this.mostrarResoltes).subscribe({
      next: (llista) => {
        this.sollicituds = llista;
        llista.forEach((s) => (this.seleccio[s.id] = this.seleccio[s.id] || { resolucio: '', responsableId: '' }));
        const pendents = llista.filter((s) => !s.resolucio);
        if (pendents.length === 0) {
          this.carregant = false;
          return;
        }
        forkJoin(pendents.map((s) => this.tascaService.getById(s.tascaId).pipe(catchError(() => of(null))))).subscribe((tasques) => {
          tasques.forEach((t) => t && (this.tasques[t.id] = t));
          this.carregant = false;
        });
      },
      error: () => {
        this.carregant = false;
        this.missatgeError = 'TREBALL.ADMIN_LOAD_ERROR';
      }
    });
  }

  potResoldre(s: SollicitudCancellacio): boolean {
    const sel = this.seleccio[s.id];
    if (!sel || !sel.resolucio) return false;
    return sel.resolucio !== 'NEGLIGENCIA' || !!sel.responsableId;
  }

  resoldre(s: SollicitudCancellacio): void {
    const sel = this.seleccio[s.id];
    if (!sel?.resolucio || !this.potResoldre(s)) return;
    this.resolent = s.id;
    this.missatgeOk = '';
    this.missatgeError = '';
    this.cancellacioService.resoldre(s.id, sel.resolucio, sel.responsableId || undefined).subscribe({
      next: () => {
        this.resolent = '';
        this.missatgeOk = 'TREBALL.ADMIN_RESOLVED_OK';
        this.carregar();
        this.carregarHistorial();
      },
      error: (e) => {
        this.resolent = '';
        this.missatgeError = e?.error?.error || 'TREBALL.ADMIN_RESOLVE_ERROR';
      }
    });
  }

  carregarHistorial(): void {
    if (!this.usuariHistorial) {
      this.historial = [];
      return;
    }
    this.cancellacioService.getNegligencies(this.usuariHistorial).pipe(catchError(() => of([]))).subscribe((h) => (this.historial = h));
  }
}
