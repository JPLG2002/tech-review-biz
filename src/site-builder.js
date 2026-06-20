import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { marked } from 'marked';
import { config } from '../config.js';
import { loadPosts, savePost } from './storage.js';

function readTemplate(name) {
  return readFileSync(join(process.cwd(), 'templates', name), 'utf-8');
}

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('es-MX', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
}

function htmlEscape(t) {
  return String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function renderTemplate(tpl, vars) {
  let r = tpl;
  for (const [k, v] of Object.entries(vars)) {
    r = r.replace(new RegExp(`{{${k}}}`, 'g'), v);
  }
  return r;
}

function analyticsSnippet() {
  const ga = config.seo.googleAnalyticsId;
  if (!ga) return '';
  return `
<script async src="https://www.googletagmanager.com/gtag/js?id=${ga}"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${ga}');</script>`;
}

export function buildSite() {
  const posts = loadPosts();
  const published = posts.filter(p => p.published);
  const outDir = join(process.cwd(), 'public');

  // Clean public but keep /css
  const cssDir = join(outDir, 'css');
  if (!existsSync(cssDir)) mkdirSync(cssDir, { recursive: true });

  // Copy CSS
  const cssSrc = join(process.cwd(), 'public', 'css', 'style.css');
  const cssDst = join(outDir, 'css', 'style.css');
  if (existsSync(cssSrc)) {
    writeFileSync(cssDst, readFileSync(cssSrc, 'utf-8'));
  }

  const baseTpl = readTemplate('base.html');
  const gaSnippet = analyticsSnippet();

  function wrapInBase(title, desc, content, canonical = '') {
    return renderTemplate(baseTpl, {
      TITLE: htmlEscape(title),
      DESCRIPTION: htmlEscape(desc),
      CANONICAL: canonical || `${config.site.url}/`,
      CONTENT: content,
      ANALYTICS: gaSnippet,
    });
  }

  // Sort by date descending
  published.sort((a, b) => new Date(b.date) - new Date(a.date));

  // --- Build index ---
  const indexTpl = readTemplate('index.html');

  const categoryCards = config.niche.categories.map(c =>
    `<a href="/${c.id}" class="category-card">${c.name}</a>`
  ).join('\n');

  const postCards = published.slice(0, 12).map(p => `
    <a href="/${p.slug}" class="post-card">
      <div class="cat-label">${htmlEscape(p.categoryName)}</div>
      <h3>${htmlEscape(p.title)}</h3>
      <p>${htmlEscape(p.excerpt)}</p>
      <span class="date">${formatDate(p.date)}</span>
    </a>
  `).join('\n');

  const indexHtml = renderTemplate(indexTpl, {
    CATEGORIES: categoryCards,
    POSTS: postCards,
  });

  writeFileSync(join(outDir, 'index.html'), wrapInBase(
    config.site.title,
    config.site.tagline,
    indexHtml,
    config.site.url,
  ));
  console.log('✓ index.html generado');

  // --- Build category pages ---
  const catTpl = readTemplate('category.html');

  for (const cat of config.niche.categories) {
    const catPosts = published.filter(p => p.category === cat.id);
    if (catPosts.length === 0) continue;

    catPosts.sort((a, b) => new Date(b.date) - new Date(a.date));

    const cards = catPosts.map(p => `
      <a href="/${p.slug}" class="post-card">
        <div class="cat-label">${htmlEscape(p.categoryName)}</div>
        <h3>${htmlEscape(p.title)}</h3>
        <p>${htmlEscape(p.excerpt)}</p>
        <span class="date">${formatDate(p.date)}</span>
      </a>
    `).join('\n');

    const catHtml = renderTemplate(catTpl, {
      CATEGORY_NAME: cat.name,
      CATEGORY_DESCRIPTION: `Los mejores artículos y reseñas sobre ${cat.name.toLowerCase()}.`,
      POSTS: cards,
    });

    writeFileSync(join(outDir, `${cat.id}.html`), wrapInBase(
      `${cat.name} - ${config.site.title}`,
      `Reseñas y guías de compra de ${cat.name.toLowerCase()}.`,
      catHtml,
      `${config.site.url}/${cat.id}`,
    ));
    console.log(`✓ ${cat.id}.html generado (${catPosts.length} artículos)`);
  }

  // --- Build individual post pages ---
  const postTpl = readTemplate('post.html');

  for (const p of published) {
    const htmlContent = marked(p.content);
    const postHtml = renderTemplate(postTpl, {
      TITLE: htmlEscape(p.title),
      CONTENT: htmlContent,
      CATEGORY: p.categoryName,
      DATE: p.date,
      DATE_FORMATTED: formatDate(p.date),
    });

    writeFileSync(join(outDir, `${p.slug}.html`), wrapInBase(
      `${p.title} - ${config.site.title}`,
      p.excerpt,
      postHtml,
      `${config.site.url}/${p.slug}`,
    ));
    console.log(`✓ ${p.slug}.html generado`);
  }

  // --- Generate sitemap ---
  generateSitemap(published, outDir);

  // --- Generate RSS ---
  generateRss(published, outDir);

  // --- Generate robots.txt ---
  writeFileSync(join(outDir, 'robots.txt'),
    `User-agent: *
Allow: /
Sitemap: ${config.site.url}/sitemap.xml
`);

  console.log(`\n✅ Sitio generado: ${outDir}/`);
  console.log(`   ${published.length} artículos publicados`);
}

function generateSitemap(posts, outDir) {
  const urls = [
    { url: '/', changefreq: 'daily', priority: 1.0 },
    ...config.niche.categories.map(c => ({
      url: `/${c.id}`, changefreq: 'daily', priority: 0.8,
    })),
    ...posts.map(p => ({
      url: `/${p.slug}`, changefreq: 'weekly', priority: 0.6,
      lastmod: p.date,
    })),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url>
    <loc>${config.site.url}${u.url}</loc>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
    ${u.lastmod ? `    <lastmod>${new Date(u.lastmod).toISOString()}</lastmod>` : ''}
  </url>`).join('\n')}
</urlset>`;

  writeFileSync(join(outDir, 'sitemap.xml'), xml);
  console.log(`✓ sitemap.xml generado (${urls.length} URLs)`);
}

function generateRss(posts, outDir) {
  const items = posts.slice(0, 20).map(p => `
  <item>
    <title>${htmlEscape(p.title)}</title>
    <link>${config.site.url}/${p.slug}</link>
    <description>${htmlEscape(p.excerpt)}</description>
    <pubDate>${new Date(p.date).toUTCString()}</pubDate>
    <guid>${config.site.url}/${p.slug}</guid>
  </item>`).join('\n');

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${config.site.title}</title>
    <link>${config.site.url}</link>
    <description>${config.site.tagline}</description>
    <language>es-mx</language>
    <atom:link href="${config.site.url}/rss.xml" rel="self" type="application/rss+xml"/>
    ${items}
  </channel>
</rss>`;

  writeFileSync(join(outDir, 'rss.xml'), rss);
  console.log('✓ rss.xml generado');
}
