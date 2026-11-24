import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ArticleService } from '../../services/article.service';
import { Article } from '../../models/article.model';
import { TranslationService } from '../../core/services/translation.service';
import { TranslatePipe } from '../../core/pipes/translate.pipe';

/**
 * Pàgina dedicada al Blog i Guies Tècniques (/blog).
 * Permet consultar la totalitat d'articles, filtrar per categoria,
 * cercar per text clau o etiquetes, i navegar cap al detall de cada article.
 */
@Component({
  selector: 'app-blog',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, TranslatePipe],
  templateUrl: './blog.component.html',
  styleUrl: './blog.component.css'
})
export class BlogComponent implements OnInit {
  /** Categoria seleccionada pel filtre */
  categoriaSeleccionada = 'Totes';
  /** Terme de cerca introduït per l'usuari */
  termeCerca = '';

  constructor(
    private readonly articleService: ArticleService,
    private readonly translationService: TranslationService,
    private readonly router: Router
  ) {}

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

  ngOnInit(): void {}

  /** Llista completa d'articles adaptats a l'idioma seleccionat */
  get articles(): Article[] {
    return this.articleService.getArticles();
  }

  /** Article principal destacat */
  get articleDestacat(): Article | undefined {
    const list = this.articles;
    return list.length > 0 ? list[0] : undefined;
  }

  /** Llista de categories úniques detectades als articles */
  get categoriesDisponibles(): string[] {
    const cats = new Set<string>();
    for (const a of this.articles) {
      if (a.categoria) {
        cats.add(a.categoria);
      }
    }
    return Array.from(cats);
  }

  /**
   * Retorna els articles filtrats segons la cerca i categoria seleccionada.
   */
  get articlesFiltrats(): Article[] {
    let result = this.articles;

    // Filtre per categoria
    if (this.categoriaSeleccionada !== 'Totes') {
      result = result.filter(a => a.categoria.toLowerCase() === this.categoriaSeleccionada.toLowerCase());
    }

    // Filtre per terme de cerca
    if (this.termeCerca.trim()) {
      const q = this.termeCerca.trim().toLowerCase();
      result = result.filter(a =>
        a.titol.toLowerCase().includes(q) ||
        a.resum.toLowerCase().includes(q) ||
        a.categoria.toLowerCase().includes(q) ||
        a.autor.nom.toLowerCase().includes(q) ||
        (a.tags && a.tags.some(t => t.toLowerCase().includes(q))) ||
        (a.sectorZona && a.sectorZona.toLowerCase().includes(q))
      );
    }

    return result;
  }

  /**
   * Canvia la categoria seleccionada.
   * @param cat Categoria o 'Totes'
   */
  seleccionarCategoria(cat: string): void {
    this.categoriaSeleccionada = cat;
  }

  /**
   * Clica sobre una etiqueta per filtrar directament per ella.
   */
  filtrarPerTag(tag: string, event: Event): void {
    event.stopPropagation();
    this.termeCerca = tag;
    window.scrollTo({ top: 350, behavior: 'smooth' });
  }

  /**
   * Restableix tots els filtres de cerca i categoria.
   */
  resetFiltres(): void {
    this.categoriaSeleccionada = 'Totes';
    this.termeCerca = '';
  }

  /**
   * Genera el títol dinàmic de la secció de resultats.
   */
  getTitolResultats(): string {
    if (this.categoriaSeleccionada !== 'Totes') {
      const translatedCat = this.translationService.translateCategory(this.categoriaSeleccionada);
      return `${this.translationService.t('BLOG.ALL_ARTICLES')}: ${translatedCat}`;
    }
    if (this.termeCerca) {
      return this.translationService.t('TASQUES_OFERTES.EYEBROW');
    }
    return this.translationService.t('BLOG.ALL_ARTICLES');
  }
}

