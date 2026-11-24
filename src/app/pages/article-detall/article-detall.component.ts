import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ArticleService } from '../../services/article.service';
import { Article } from '../../models/article.model';
import { AuthService } from '../../core/services/auth.service';
import { TranslatePipe } from '../../core/pipes/translate.pipe';

/**
 * Pàgina completa de detall per a cada article del Blog (/article/:id).
 * Presenta el contingut en profunditat, anàlisi del sector local, taules de preus,
 * consells d'experts i accions per crear tasques o contractar professionals.
 */
@Component({
  selector: 'app-article-detall',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslatePipe],
  templateUrl: './article-detall.component.html',
  styleUrl: './article-detall.component.css'
})
export class ArticleDetallComponent implements OnInit {
  currentId?: string | number;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly articleService: ArticleService,
    private readonly authService: AuthService
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

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.currentId = id;
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }

  get article(): Article | undefined {
    return this.currentId ? this.articleService.getArticleById(this.currentId) : undefined;
  }

  get articlesRelacionats(): Article[] {
    return this.currentId ? this.articleService.getArticlesRelacionats(this.currentId, 3) : [];
  }

  carregarArticle(id: string | number): void {
    this.currentId = id;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  formatParagraph(text: string): string {
    // Permet formatar negreta senzilla (**text**)
    return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  }

  anarCrearTasca(): void {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate([this.getNavUrl('/login')], {
        queryParams: {
          message: 'Inicia sessió o crea un compte per publicar la teva tasca.',
          returnUrl: this.getNavUrl('/client/crear-tasca')
        }
      });
      return;
    }
    this.router.navigate([this.getNavUrl('/client/crear-tasca')]);
  }
}

