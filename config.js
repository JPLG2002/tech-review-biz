export const config = {
  site: {
    title: 'TechReviewPro',
    tagline: 'Las mejores reseñas y comparativas de tecnología',
    url: 'https://techreviewpro.vercel.app',
    language: 'es',
    locale: 'es_MX',
    author: 'TechReviewPro Team',
  },

  niche: {
    primary: 'tecnologia',
    categories: [
      { id: 'laptops', name: 'Laptops', image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=800&auto=format&fit=crop', keywords: ['mejores laptops', 'laptop gaming', 'ultrabook'] },
      { id: 'audifonos', name: 'Audífonos', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800&auto=format&fit=crop', keywords: ['mejores audifonos', 'audifonos bluetooth', 'cascos gaming'] },
      { id: 'smartphones', name: 'Smartphones', image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=800&auto=format&fit=crop', keywords: ['mejores celulares', 'smartphone calidad precio', 'gama media'] },
      { id: 'monitores', name: 'Monitores', image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?q=80&w=800&auto=format&fit=crop', keywords: ['mejor monitor', 'monitor gaming', 'monitor 4k'] },
      { id: 'teclados', name: 'Teclados', image: 'https://images.unsplash.com/photo-1595225476474-87563907a212?q=80&w=800&auto=format&fit=crop', keywords: ['mejor teclado mecanico', 'teclado gaming', 'teclado inalambrico'] },
    ],
  },

  content: {
    postsPerRun: 1,
    maxPosts: 100,
    minWords: 1200,
    maxWords: 2000,
  },

  affiliate: {
    amazon: {
      tag: 'techreviewp07-20',
      baseUrl: 'https://amzn.to',
    },
    mercadolibre: {
      tag: 'tu-tag-ml',
      baseUrl: 'https://mercadolibre.com.mx',
    },
    defaultCta: 'Ver precio',
  },

  seo: {
    googleAnalyticsId: '',
    googleAdsId: '',
  },

  ai: {
    provider: 'gemini',
    baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions',
    model: 'gemini-flash-latest',
    temperature: 0.7,
    maxTokens: 2000,
    apiKey: process.env.OPENAI_API_KEY || process.env.GEMINI_API_KEY || '',
  },
};
