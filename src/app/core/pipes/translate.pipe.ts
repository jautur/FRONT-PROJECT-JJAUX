import { Pipe, PipeTransform } from '@angular/core';
import { TranslationService } from '../services/translation.service';

/**
 * Pipe standalone 'translate' per a traduir cadenes de text directament a les plantilles.
 * Ús:
 * {{ 'NAV.INICI' | translate }}
 * {{ 'AVISOS.PENDENTS_TOOLTIP' | translate:{ count: avisosPendents } }}
 */
@Pipe({
  name: 'translate',
  standalone: true,
  pure: false
})
export class TranslatePipe implements PipeTransform {
  constructor(private readonly translationService: TranslationService) {}

  transform(key: string, params?: Record<string, string | number>): string {
    if (!key) return '';
    return this.translationService.t(key, params);
  }
}
