import { getStats } from '../src/storage.js';
import { config } from '../config.js';

const s = getStats();
console.log(`
📊 ESTADÍSTICAS DEL SITIO
==========================
🌐 Nicho: ${config.niche.primary}
📝 Total artículos: ${s.total}
✅ Publicados: ${s.published}
📋 Borradores: ${s.draft}
📖 Palabras totales: ${s.totalWords.toLocaleString()}

📂 Por categoría:
${Object.entries(s.byCategory)
  .map(([cat, count]) => `   ${cat}: ${count} artículos`)
  .join('\n')}

${s.latestPost ? `🆕 Último artículo: ${s.latestPost.title} (${new Date(s.latestPost.date).toLocaleDateString('es-MX')})` : ''}
`);
