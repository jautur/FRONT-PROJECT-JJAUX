import { Injectable, signal } from '@angular/core';

export interface ConfirmDialogOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDanger?: boolean;
  isAlert?: boolean;
  icon?: 'question' | 'success' | 'warning' | 'danger';
}

/**
 * Servei global per a gestionar modals de confirmació i avisos elegants.
 * Substitueix completament els diàlegs natius del navegador (window.confirm / window.alert)
 * evitant missatges lletjos com "localhost dice...".
 */
@Injectable({
  providedIn: 'root'
})
export class ConfirmService {
  isOpen = signal(false);
  title = signal('Confirmació');
  message = signal('');
  confirmText = signal('Confirmar');
  cancelText = signal('Cancel·lar');
  isDanger = signal(false);
  isAlert = signal(false);
  icon = signal<'question' | 'success' | 'warning' | 'danger'>('question');

  private resolveFn?: (value: boolean) => void;

  /**
   * Mostra un modal de confirmació estilitzat (amb botons Acceptar / Cancel·lar).
   * @param options Configuració del títol, missatge i botons
   * @returns Promesa que resol a true si s'accepta o false si es cancel·la
   */
  confirm(options: ConfirmDialogOptions | string): Promise<boolean> {
    const opts: ConfirmDialogOptions = typeof options === 'string'
      ? { message: options }
      : options;

    this.title.set(opts.title || 'Confirmació');
    this.message.set(opts.message);
    this.confirmText.set(opts.confirmText || 'Confirmar');
    this.cancelText.set(opts.cancelText || 'Cancel·lar');
    this.isDanger.set(opts.isDanger || false);
    this.isAlert.set(opts.isAlert || false);
    this.icon.set(opts.icon || (opts.isDanger ? 'danger' : 'question'));

    this.isOpen.set(true);

    return new Promise<boolean>((resolve) => {
      this.resolveFn = resolve;
    });
  }

  /**
   * Mostra un avís informatiu estilitzat (amb un únic botó D'acord).
   * @param message Missatge d'avís
   * @param title Títol de l'avís
   * @returns Promesa que resol quan l'usuari tanca l'avís
   */
  alert(message: string, title: string = 'Avís'): Promise<void> {
    return this.confirm({
      title,
      message,
      confirmText: 'D\'acord',
      isAlert: true,
      icon: 'warning'
    }).then(() => {});
  }

  onAccept(): void {
    this.isOpen.set(false);
    if (this.resolveFn) {
      this.resolveFn(true);
      this.resolveFn = undefined;
    }
  }

  onCancel(): void {
    this.isOpen.set(false);
    if (this.resolveFn) {
      this.resolveFn(false);
      this.resolveFn = undefined;
    }
  }
}
