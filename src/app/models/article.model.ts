/**
 * Model de dades per als articles i guies tècniques del Blog d'AVISA.
 * Optimitzat per a SEO, contingut en profunditat i enllaços als serveis locals.
 */
export interface SeccioArticle {
  subtitol: string;
  paragrafs: string[];
  taulaPreus?: { concepte: string; preuAproximat: string; consell: string }[];
  puntsClau?: string[];
  destacatConsell?: string;
}

export interface Article {
  id: number;
  slug: string;
  titol: string;
  subtitol: string;
  resum: string;
  categoria: string;
  tempsLectura: string;
  data: string;
  autor: {
    nom: string;
    carrec: string;
    avatar: string;
  };
  imatge: string;
  imatgePeu?: string;
  seccions: SeccioArticle[];
  tags: string[];
  sectorZona: string;
  categoriaServeiRecomanat: string;
}
