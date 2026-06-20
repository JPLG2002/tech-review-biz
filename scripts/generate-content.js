import { config } from '../config.js';
import { generatePost } from '../src/content-generator.js';
import { loadPosts, savePost, publishPost } from '../src/storage.js';

async function main() {
  console.log('🚀 Generador de Contenido Automatizado');
  console.log(`   Nicho: ${config.niche.primary}`);
  console.log(`   Artículos a generar: ${config.content.postsPerRun}\n`);

  const posts = loadPosts();
  const publishedCount = posts.filter(p => p.published).length;

  if (publishedCount >= config.content.maxPosts) {
    console.log(`✅ Límite alcanzado: ${config.content.maxPosts} artículos publicados.`);
    console.log('   Aumenta config.content.maxPosts si quieres más.');
    process.exit(0);
  }

  const availableCats = config.niche.categories.filter(() => true);
  const errors = [];

  for (let i = 0; i < config.content.postsPerRun; i++) {
    const cat = availableCats[i % availableCats.length];
    try {
      const post = await generatePost(cat.id);
      post.wordCount = post.content.split(/\s+/).length;

      savePost(post);
      console.log(`   ✓ "${post.title}" — ${post.wordCount} palabras\n`);
    } catch (err) {
      errors.push({ category: cat.id, error: err.message });
      console.error(`   ✗ Error en ${cat.id}: ${err.message}\n`);
    }
  }

  if (errors.length === 0) {
    console.log('✅ Contenido generado exitosamente.');
  } else {
    console.log(`⚠️  ${errors.length} error(es) durante la generación.`);
  }

  // Auto-publish if it's the first run or configured
  const updatedPosts = loadPosts();
  const pending = updatedPosts.filter(p => !p.published);
  for (const p of pending) {
    publishPost(p.slug);
  }
  console.log(`📝 ${pending.length} artículo(s) publicado(s).`);
}

main().catch(err => {
  console.error('❌ Error fatal:', err.message);
  process.exit(1);
});
