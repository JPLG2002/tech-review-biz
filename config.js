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
      { id: 'laptops', name: 'Laptops', keywords: ['mejores laptops', 'laptop gaming', 'ultrabook'] },
      { id: 'audifonos', name: 'Audífonos', keywords: ['mejores audifonos', 'audifonos bluetooth', 'cascos gaming'] },
      { id: 'smartphones', name: 'Smartphones', keywords: ['mejores celulares', 'smartphone calidad precio', 'gama media'] },
      { id: 'monitores', name: 'Monitores', keywords: ['mejor monitor', 'monitor gaming', 'monitor 4k'] },
      { id: 'teclados', name: 'Teclados', keywords: ['mejor teclado mecanico', 'teclado gaming', 'teclado inalambrico'] },
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
      tag: 'tu-tag-amazon-20',
      baseUrl: 'https://amzn.to',
    },
    defaultCta: 'Ver precio en Amazon',
  },

  seo: {
    googleAnalyticsId: '',
    googleAdsId: '',
  },

  ai: {
    provider: 'gemini',
    baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions',
    model: 'gemini-3.5-flash',
    temperature: 0.7,
    maxTokens: 2000,
    apiKey: process.env.OPENAI_API_KEY || process.env.GEMINI_API_KEY || '',
  },
};
