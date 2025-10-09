import 'dotenv/config';
import { db } from '../server/db.js';
import { autoPostsQueue, users } from '../shared/schema.js';
import { storage } from '../server/storage.js';
import { eq } from 'drizzle-orm';
import fetch from 'node-fetch';

async function validateUrl(urlStr: string | undefined | null) {
  if (!urlStr) return false;
  try {
    // Basic URL sanity
    const url = new URL(urlStr);
    if (!['http:', 'https:'].includes(url.protocol)) return false;
    // Try a HEAD request to ensure reachability; fallback to GET if HEAD not allowed
    const res = await fetch(url.toString(), { method: 'HEAD', redirect: 'follow', timeout: 5000 });
    if (res && res.status >= 200 && res.status < 400) return true;
    // Some servers disallow HEAD; try GET as a fallback
    const res2 = await fetch(url.toString(), { method: 'GET', redirect: 'follow', timeout: 5000 });
    return res2.status >= 200 && res2.status < 400;
  } catch (e) {
    return false;
  }
}

async function processQueue() {
  const queued = await db.select().from(autoPostsQueue).where(eq(autoPostsQueue.status, 'queued'));
  if (!queued.length) {
    console.log('No queued items');
    return;
  }

  const adminUser = await storage.getUserByUsername(process.env.TEST_ADMIN_USERNAME || 'testcraftworld');
  if (!adminUser) {
    console.error('Admin user not found');
    return;
  }

  for (const item of queued) {
    try {
      const publishImmediate = process.env.AGENT_PUBLISH_IMMEDIATE === 'true';
  const autoPublishFlag = !!item.autoPublish;

      // Auto-publish if the environment forces it, or if the queue item is marked autoPublish,
      // or if the item's category is the entrance-exams-jobs category. We'll also
      // support auto-publishing all Entrance Exams & Jobs items by default.
      let shouldPublish = publishImmediate || autoPublishFlag;
      try {
        if (!shouldPublish && item.categoryId) {
          const cat = await db.select().from(require('../shared/schema').categories).where(eq((require('../shared/schema').categories).id, item.categoryId)).limit(1);
          if (cat && cat[0] && cat[0].slug === 'entrance-exams-jobs') {
            shouldPublish = true; // always publish entrance exams & jobs
          }
        }
      } catch (e) {
        // ignore
      }

      if (!shouldPublish) {
        // mark as reviewed for manual approval
        await db.update(autoPostsQueue).set({ status: 'reviewed', processedAt: new Date() } as any).where(eq(autoPostsQueue.id, item.id));
        console.log('Marked queued post for review (not publishing):', item.title);
        continue;
      }

      // If the queued item has a source link and auto-publish is enabled,
      // validate the link before publishing. If validation fails, mark for review.
      const sourceLink = (item as any).sourceLink || (item as any).source_link || null;
      if (sourceLink && shouldPublish) {
        const ok = await validateUrl(sourceLink as string);
        if (!ok) {
          console.log('Source link validation failed, marking for review:', sourceLink);
          await db.update(autoPostsQueue).set({ status: 'reviewed', processedAt: new Date() } as any).where(eq(autoPostsQueue.id, item.id));
          continue;
        }
      }

      // create post via storage directly (including optional sourceLink)
      const post = await storage.createPost({
        title: item.title,
        slug: item.slug,
        content: item.content,
        excerpt: item.excerpt,
        featuredImage: item.featuredImage || null,
        sourceLink: sourceLink || null,
        categoryId: item.categoryId || null,
        authorId: adminUser.id,
        published: true,
        generated: true,
        commentsDisabled: true
      });

      // update queue item to published
      await db.update(autoPostsQueue).set({ status: 'published', processedAt: new Date() } as any).where(eq(autoPostsQueue.id, item.id));
      console.log('Published queued post:', post.title);
    } catch (err) {
      console.error('Failed to publish queued item:', item.title, err);
  await db.update(autoPostsQueue).set({ status: 'failed', processedAt: new Date() }).where(eq(autoPostsQueue.id, item.id));
    }
  }
}
export { processQueue };

// Allow running directly from command line for debugging in both ESM and CJS builds.
const _isDirectRun = (typeof require !== 'undefined' && require.main === module) ||
  (process.argv[1] && (process.argv[1].endsWith('ai-agent-processor.ts') || process.argv[1].endsWith('ai-agent-processor.js')));

if (_isDirectRun) {
  (async () => {
    try {
      await processQueue();
      process.exit(0);
    } catch (e) {
      console.error(e);
      process.exit(1);
    }
  })();
}
