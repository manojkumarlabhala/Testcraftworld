import 'dotenv/config';
import aiAgentService from '../server/services/aiAgentService.js';
import fetch from 'node-fetch';
import { fetchUnsplashImage } from '../server/services/unsplashService.js';
import { db } from '../server/db.js';
import { autoPostsQueue, users } from '../shared/schema.js';
import { categories } from '../shared/schema.js';
import { eq } from 'drizzle-orm';

function unsplashImageForQuery(query: string) {
  const encoded = encodeURIComponent(query);
  return `https://source.unsplash.com/featured/?${encoded}`;
}

function sleep(ms: number) {
  return new Promise(res => setTimeout(res, ms));
}

async function pushToQueue(item: any) {
  await db.insert(autoPostsQueue).values({
    id: item.id,
    title: item.title,
    slug: item.slug,
    content: item.content,
    excerpt: item.excerpt,
    featuredImage: item.featuredImage,
    tags: item.tags,
    status: 'queued'
  });
}

// Acquire a simple advisory lock via the DB by inserting a row in a locks table.
// We'll create the table on demand.
async function acquireLock(name: string, ttl = 1000 * 60 * 20) {
    try {
    await db.execute("CREATE TABLE IF NOT EXISTS worker_locks (name varchar(255) primary key, expires_at bigint)");
  } catch (e) {
    // ignore if not supported by adapter
  }
  const now = Date.now();
    try {
    // Try to insert lock row. If exists, check expiry.
    const safeName = String(name).replace(/'/g, "''");
    await db.execute(`INSERT INTO worker_locks (name, expires_at) VALUES ('${safeName}', ${now + ttl})`);
    return true;
  } catch (e) {
    try {
      const safeName = String(name).replace(/'/g, "''");
      const rows: any = await db.execute(`SELECT expires_at FROM worker_locks WHERE name = '${safeName}'`);
      const expires = rows && rows[0] && rows[0][0] ? rows[0][0].expires_at : null;
      if (!expires || expires < now) {
        await db.execute(`UPDATE worker_locks SET expires_at = ${now + ttl} WHERE name = '${safeName}'`);
        return true;
      }
    } catch (e2) {
      // ignore
    }
  }
  return false;
}

async function releaseLock(name: string) {
  try {
    const safeName = String(name).replace(/'/g, "''");
    await db.execute(`DELETE FROM worker_locks WHERE name = '${safeName}'`);
  } catch (e) {
    // ignore
  }
}

async function runOnce() {
  let topics = await aiAgentService.discoverTrendingTopics();
  const priorityTopic = 'Entrance exam announcements, job updates from India (entrance exam news, result notifications, and public/pvt sector job updates with source links)';
  if (!topics.includes(priorityTopic)) {
    topics = [priorityTopic, ...topics];
  } else {
    topics = [priorityTopic, ...topics.filter(t => t !== priorityTopic)];
  }
  for (const t of topics) {
    let attempt = 0;
    while (attempt < 3) {
      try {
        const article = await aiAgentService.generateArticleForTopic(t);
        let categoryId = null;
        
        // Determine category based on topic and content
        try {
          const allCategories = await db.select().from(categories);
          const titleLower = (article.title || '').toLowerCase();
          const contentLower = (article.content || '').toLowerCase();
          const topicLower = t.toLowerCase();
          
          // Priority: Entrance Exams & Jobs
          if (topicLower.includes('entrance') || topicLower.includes('job') || topicLower.includes('exam') || 
              titleLower.includes('entrance') || titleLower.includes('exam') || titleLower.includes('job')) {
            const entranceCategory = allCategories.find((c: any) => c.slug === 'entrance-exams-jobs');
            if (entranceCategory) categoryId = entranceCategory.id;
          }
          // News category
          else if (topicLower.includes('news') || topicLower.includes('breaking') || topicLower.includes('announcement') ||
                   titleLower.includes('news') || titleLower.includes('breaking') || contentLower.includes('breaking')) {
            const newsCategory = allCategories.find((c: any) => c.slug === 'news');
            if (newsCategory) categoryId = newsCategory.id;
          }
          // Technology category
          else if (topicLower.includes('technology') || topicLower.includes('tech') || topicLower.includes('ai') || 
                   topicLower.includes('digital') || titleLower.includes('tech') || titleLower.includes('ai')) {
            const techCategory = allCategories.find((c: any) => c.slug === 'technology');
            if (techCategory) categoryId = techCategory.id;
          }
          // Business category
          else if (topicLower.includes('business') || topicLower.includes('startup') || topicLower.includes('entrepreneur') ||
                   titleLower.includes('business') || titleLower.includes('startup')) {
            const businessCategory = allCategories.find((c: any) => c.slug === 'business');
            if (businessCategory) categoryId = businessCategory.id;
          }
          // Marketing category
          else if (topicLower.includes('marketing') || topicLower.includes('social media') || topicLower.includes('seo') ||
                   titleLower.includes('marketing') || contentLower.includes('marketing')) {
            const marketingCategory = allCategories.find((c: any) => c.slug === 'marketing');
            if (marketingCategory) categoryId = marketingCategory.id;
          }
          // Design category
          else if (topicLower.includes('design') || topicLower.includes('ui') || topicLower.includes('ux') ||
                   titleLower.includes('design') || contentLower.includes('design')) {
            const designCategory = allCategories.find((c: any) => c.slug === 'design');
            if (designCategory) categoryId = designCategory.id;
          }
          // Lifestyle category
          else if (topicLower.includes('lifestyle') || topicLower.includes('health') || topicLower.includes('wellness') ||
                   titleLower.includes('lifestyle') || titleLower.includes('health')) {
            const lifestyleCategory = allCategories.find((c: any) => c.slug === 'lifestyle');
            if (lifestyleCategory) categoryId = lifestyleCategory.id;
          }
          // Default to Others category for unmatched content
          else {
            const othersCategory = allCategories.find((c: any) => c.slug === 'others');
            if (othersCategory) categoryId = othersCategory.id;
          }
        } catch (e) {
          console.error('Error determining category:', e);
        }

        const titleLower = (article.title || '').toLowerCase();
        const newsLike = /\b(news|announcement|result|results|job|hiring|recruitment)\b/.test(titleLower);
        const isTop5 = topics.slice(0,5).includes(t);
        const autoPublish = (categoryId !== null && categoryId) || newsLike || isTop5 || t.includes('Entrance');

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
          autoPublish: !!autoPublish
        });
        console.log('Queued article for topic:', t);
        await sleep(1500);
        break;
      } catch (err) {
        attempt++;
        console.error(`Worker error for topic ${t} attempt ${attempt}`, err);
        await sleep(1000 * attempt);
      }
    }
  }
}

export async function runLoop(intervalMs = 1000 * 60 * 60) {
  const lockName = 'ai-agent-worker-lock';
  while (true) {
    try {
      const locked = await acquireLock(lockName, Math.max(intervalMs, 1000 * 60 * 10));
      if (!locked) {
        console.log('Another worker is running, skipping this interval');
      } else {
        try {
          await runOnce();
        } finally {
          await releaseLock(lockName);
        }
      }
    } catch (e) {
      console.error('RunLoop error', e);
    }
    await sleep(intervalMs);
  }
}

// Allow direct execution in both ESM and compiled CJS builds.
// Use require.main === module when available (CJS), otherwise fall back to process.argv checks.
const _isDirectRun = (typeof require !== 'undefined' && require.main === module) ||
  (process.argv[1] && (process.argv[1].endsWith('ai-agent-worker.ts') || process.argv[1].endsWith('ai-agent-worker.js')));

if (_isDirectRun) {
  (async () => {
    try {
      const ms = parseInt(process.env.AGENT_INTERVAL_MS || '') || 1000 * 60 * 60;
      await runLoop(ms);
    } catch (e) {
      console.error(e);
      process.exit(1);
    }
  })();
}
