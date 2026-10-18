import { Injectable } from '@angular/core';
import { Article } from '../models/article.model';
import { TranslationService } from '../core/services/translation.service';
import { ARTICLES_VA, ARTICLES_ES, ARTICLES_EN } from './articles-data';

/**
 * Servei per a la gestió d'articles del Blog d'AVISA.
 * Totalment integrat amb el sistema d'internacionalització reactiu (VA, ES, EN).
 */
@Injectable({
  providedIn: 'root'
})
export class ArticleService {

  constructor(private readonly translationService: TranslationService) {}

  /**
   * Retorna tots els articles disponibles adaptats a l'idioma seleccionat (VA, ES, EN).
   */
  getArticles(): Article[] {
    const lang = this.translationService.currentLang();
    if (lang === 'ES') return ARTICLES_ES;
    if (lang === 'EN') return ARTICLES_EN;
    return ARTICLES_VA;
  }

  /**
   * Cerca un article pel seu identificador únic en l'idioma seleccionat.
   */
  getArticleById(id: number | string): Article | undefined {
    const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
    return this.getArticles().find(a => a.id === numericId);
  }

  /**
   * Retorna articles recomanats excloent l'article actual.
   */
  getArticlesRelacionats(currentId: number | string, limit: number = 3): Article[] {
    const numericId = typeof currentId === 'string' ? parseInt(currentId, 10) : currentId;
    return this.getArticles()
      .filter(a => a.id !== numericId)
      .slice(0, limit);
  }
}
