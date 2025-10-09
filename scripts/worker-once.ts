import 'dotenv/config';
import aiAgentService from '../server/services/aiAgentService.js';
import { fetchUnsplashImage } from '../server/services/unsplashService.js';
import { db } from '../server/db.js';
import { autoPostsQueue } from '../shared/schema.js';
import { categories } from '../shared/schema.js';
import { eq } from 'drizzle-orm';

function unsplashImageForQuery(query: string) {
  const encoded = encodeURIComponent(query);
  return `https://source.unsplash.com/featured/?${encoded}`;
}

async function runOnce() {
  const topics = await aiAgentService.discoverTrendingTopics();
  const t = topics[0] || 'General news in India';
  console.log('Using topic:', t);
  const article = await aiAgentService.generateArticleForTopic(t);
  let categoryId = null;
  try {
    const res = await db.select().from(categories).where(eq(categories.slug, 'entrance-exams-jobs')).limit(1);
    if (res && res[0]) categoryId = res[0].id;
  } catch (e) {}

  let imageUrl: string | null = (typeof article.featuredImage === 'string' ? article.featuredImage : null);
  if (!imageUrl) {
    const imgQuery = (article.tags && typeof article.tags === 'string') ? JSON.parse(article.tags)[0] : (article.title || '').split(' ').slice(0,4).join(' ');
    try {
      imageUrl = await fetchUnsplashImage(imgQuery || 'news');
    } catch (e) {
      imageUrl = unsplashImageForQuery(imgQuery || 'news');
    }
  }

  await db.insert(autoPostsQueue).values({
    id: article.id,
    title: article.title,
    slug: article.slug,
    content: article.content,
    excerpt: article.excerpt,
    featuredImage: imageUrl,
    tags: article.tags,
    status: 'queued',
    categoryId,
    autoPublish: false
  });
  console.log('Inserted queued article:', article.title);
}

(async () => {
  try {
    await runOnce();
    process.exit(0);
  } catch (e) {
    console.error('worker-once failed', e);
    process.exit(1);
  }
})();
