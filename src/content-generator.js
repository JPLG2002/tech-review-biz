import { config } from '../config.js';
import { generateContent } from './ai-client.js';

const topics = {
  laptops: [
    'Las 5 mejores laptops para programar en 2026',
    'Mejores laptops gaming calidad-precio 2026',
    'Laptop vs MacBook: ¿cuál comprar en 2026?',
    'Las mejores laptops ultraligeras para viajar',
    'Top 10 laptops para estudiantes universitarios',
    'Comparativa: Dell XPS vs MacBook Air vs Surface Laptop',
    'Mejores laptops con 32GB de RAM para trabajo pesado',
    'Laptops con mejor batería en 2026',
    '¿Vale la pena una laptop touchscreen?',
    'Guía de compra: qué buscar en una laptop en 2026',
  ],
  audifonos: [
    'Top 5 audífonos bluetooth con mejor cancelación de ruido',
    'Mejores audífonos para gaming en 2026',
    'Audífonos inalámbricos vs alámbricos: ¿cuáles elegir?',
    'Las mejores bocinas bluetooth portátiles',
    'Comparativa: AirPods Pro vs Galaxy Buds vs Sony XM6',
    'Mejores audífonos para hacer ejercicio 2026',
    'Audífonos con mejor calidad de sonido por precio',
    'Guía completa de códecs de audio: LDAC, aptX, AAC',
    'Top 10 audífonos económicos con buena calidad',
    '¿Vale la pena comprar audífonos de marca versus genéricos?',
  ],
  smartphones: [
    'Mejores smartphones calidad-precio 2026',
    'Top 10 celulares con mejor cámara en 2026',
    'Comparativa: iPhone vs Samsung Galaxy vs Google Pixel',
    'Mejores celulares para jugar en 2026',
    'Smartphones con mejor batería del año',
    '¿Teléfono plegable o tradicional? Pros y contras',
    'Mejores celulares gama media 2026',
    'Guía de compra de smartphones para adultos mayores',
    'Top 5 celulares con resistencia al agua',
    'Diferencias entre versiones: Pro, Ultra, Plus ¿cuál comprar?',
  ],
  monitores: [
    'Mejores monitores para programar 2026',
    'Top monitores gaming 4K 144Hz',
    'Monitor curvo vs plano: ¿cuál elegir?',
    'Mejores monitores ultra-wide para productividad',
    'Guía completa de tipos de panel: IPS, VA, TN',
    'Monitor 4K vs 1440p para gaming y trabajo',
    'Los mejores monitores económicos para home office',
    'Configuración de doble monitor: guía completa',
    'Comparativa: Monitores Dell vs LG vs Samsung',
    'Monitores con mejor color para edición de video',
  ],
  teclados: [
    'Mejores teclados mecánicos para programar 2026',
    'Top 5 teclados gaming con switches intercambiables',
    'Teclado mecánico vs membrana: ¿cuál necesitas?',
    'Guía de switches: Cherry MX, Gateron, Kailh',
    'Mejores teclados inalámbricos para productividad',
    'Teclados 60% vs TKL vs Full-size: guía de tamaños',
    'Top 10 teclados económicos para empezar',
    'Los mejores teclados ergonómicos para escribir',
    'Guía de custom keyboards: cómo armarlos desde cero',
    'Comparativa: Logitech vs Razer vs Corsair vs Keychron',
  ],
};

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function buildPrompt(category, topic) {
  return `Escribe un artículo SEO optimizado para el nicho de tecnología.

Tema: ${topic}
Categoría: ${category}

Formato requerido:
- Título principal (H1)
- Introducción atractiva
- Para cada producto recomiéndalo con: nombre, pros, contras, precio aproximado, y los DOS enlaces de compra obligatorios.
- Tabla comparativa
- Sección de preguntas frecuentes (FAQ)
- Conclusión con recomendación final

REQUISITO OBLIGATORIO: El artículo debe tener al menos ${config.content.minWords} palabras.
IMPORTANTE: Al final de CADA producto, pon SIEMPRE estos dos botones juntos:
[Ver precio en Amazon](https://amzn.to/XXXXX)
[Ver en Mercado Libre](https://mercadolibre.com.mx/XXXXX)
Escribe en español neutro (latinoamerica).`;
}

export async function generatePost(categoryId) {
  const category = config.niche.categories.find(c => c.id === categoryId);
  if (!category) throw new Error(`Categoría "${categoryId}" no encontrada`);

  const topic = randomItem(topics[categoryId]);
  if (!topic) throw new Error(`No hay topics para ${categoryId}`);

  console.log(`Generando: "${topic}" [${category.name}]...`);

  const prompt = buildPrompt(category.name, topic);
  const content = await generateContent(prompt);

  const slug = topic
    .toLowerCase()
    .replace(/[¿?!¡:;,.'"()]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .substring(0, 80);

  const post = {
    title: topic,
    slug,
    category: categoryId,
    categoryName: category.name,
    content,
    date: new Date().toISOString(),
    excerpt: content.substring(0, 160).replace(/\n/g, ' ').trim() + '...',
    wordCount: content.split(/\s+/).length,
    links: extractAffiliateLinks(content),
    published: false,
  };

  return post;
}

export { topics };

function extractAffiliateLinks(content) {
  // Extrae links de amzn.to y mercadolibre.com.mx
  const matches = content.match(/\[([^\]]+)\]\((https:\/\/(amzn\.to|mercadolibre\.com\.mx)\/[^\)]+)\)/g) || [];
  return matches.map(m => {
    const [, text] = m.match(/\[([^\]]+)\]/) || ['', ''];
    const [, url] = m.match(/\(([^\)]+)\)/) || ['', ''];
    return { text, url };
  });
}
