import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

const DB_PATH = join(process.cwd(), 'data', 'posts.json');

export function loadPosts() {
  if (!existsSync(DB_PATH)) return [];
  try {
    const raw = readFileSync(DB_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function savePost(post) {
  const posts = loadPosts();
  const idx = posts.findIndex(p => p.slug === post.slug);
  if (idx >= 0) {
    posts[idx] = { ...posts[idx], ...post };
  } else {
    posts.push(post);
  }
  writeFileSync(DB_PATH, JSON.stringify(posts, null, 2));
  return post;
}

export function publishPost(slug) {
  const posts = loadPosts();
  const post = posts.find(p => p.slug === slug);
  if (post) {
    post.published = true;
    writeFileSync(DB_PATH, JSON.stringify(posts, null, 2));
  }
  return post;
}

export function getStats() {
  const posts = loadPosts();
  const published = posts.filter(p => p.published);
  const totalWords = posts.reduce((s, p) => s + (p.wordCount || 0), 0);
  const byCategory = {};
  for (const p of published) {
    byCategory[p.category] = (byCategory[p.category] || 0) + 1;
  }
  return {
    total: posts.length,
    published: published.length,
    draft: posts.length - published.length,
    totalWords,
    byCategory,
    latestPost: published.length > 0
      ? published.sort((a, b) => new Date(b.date) - new Date(a.date))[0]
      : null,
  };
}
