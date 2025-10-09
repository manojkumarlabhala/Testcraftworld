import { Router } from 'express';
import { apiKeyAuth, requireAdmin, AuthenticatedRequest } from '../middleware/apiKeyAuth.js';
import { db } from '../db.js';
import { autoPostsQueue } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { storage } from '../storage.js';

const router = Router();

router.use(apiKeyAuth);
router.use(requireAdmin);

// List queued items (status: queued or reviewed)
router.get('/queue', async (req: AuthenticatedRequest, res) => {
  try {
    const items = await db.select().from(autoPostsQueue).where(eq(autoPostsQueue.status, 'queued'));
    res.json({ items });
  } catch (err) {
    console.error('Failed to list queue items:', err);
    res.status(500).json({ error: 'Failed to list queue' });
  }
});

// Publish a queued item by id
router.post('/queue/publish/:id', async (req: AuthenticatedRequest, res) => {
  const id = req.params.id;
  try {
    const rows = await db.select().from(autoPostsQueue).where(eq(autoPostsQueue.id, id)).limit(1);
    if (!rows[0]) return res.status(404).json({ error: 'Queue item not found' });
    const item = rows[0];

    // find admin user to attribute the post to
    const adminUser = await storage.getUserByUsername(process.env.TEST_ADMIN_USERNAME || 'testcraftworld');
    if (!adminUser) return res.status(500).json({ error: 'Admin user not found' });

    const post = await storage.createPost({
      title: item.title,
      slug: item.slug,
      content: item.content,
      excerpt: item.excerpt,
      featuredImage: item.featuredImage || null,
      categoryId: null,
      authorId: adminUser.id,
      published: true
    });

    // cast to any to satisfy drizzle typings for dynamic update
    await db.update(autoPostsQueue).set({ status: 'published', processedAt: new Date() } as any).where(eq(autoPostsQueue.id, id));
    res.json({ ok: true, post });
  } catch (err) {
    console.error('Failed to publish queued item:', err);
    res.status(500).json({ error: 'Failed to publish item' });
  }
});

// Bulk publish by ids
router.post('/queue/publish', async (req: AuthenticatedRequest, res) => {
  const ids: string[] = req.body.ids || [];
  if (!Array.isArray(ids) || ids.length === 0) return res.status(400).json({ error: 'ids array required' });
  try {
    const adminUser = await storage.getUserByUsername(process.env.TEST_ADMIN_USERNAME || 'testcraftworld');
    if (!adminUser) return res.status(500).json({ error: 'Admin user not found' });

    const results: any[] = [];
    for (const id of ids) {
      try {
        const rows = await db.select().from(autoPostsQueue).where(eq(autoPostsQueue.id, id)).limit(1);
        if (!rows[0]) {
          results.push({ id, ok: false, error: 'not found' });
          continue;
        }
        const item = rows[0];
        const post = await storage.createPost({
          title: item.title,
          slug: item.slug,
          content: item.content,
          excerpt: item.excerpt,
          featuredImage: item.featuredImage || null,
          categoryId: null,
          authorId: adminUser.id,
          published: true
        });
        await db.update(autoPostsQueue).set({ status: 'published', processedAt: new Date() } as any).where(eq(autoPostsQueue.id, id));
        results.push({ id, ok: true, postId: post.id });
      } catch (err) {
        console.error('Bulk publish error for', id, err);
        await db.update(autoPostsQueue).set({ status: 'failed', processedAt: new Date() } as any).where(eq(autoPostsQueue.id, id));
        results.push({ id, ok: false, error: String(err) });
      }
    }
    res.json({ results });
  } catch (err) {
    console.error('Bulk publish failed:', err);
    res.status(500).json({ error: 'Bulk publish failed' });
  }
});

// Bulk decline (mark failed) by ids
router.post('/queue/decline', async (req: AuthenticatedRequest, res) => {
  const ids: string[] = req.body.ids || [];
  if (!Array.isArray(ids) || ids.length === 0) return res.status(400).json({ error: 'ids array required' });
  try {
    const results: any[] = [];
    for (const id of ids) {
      try {
        const rows = await db.select().from(autoPostsQueue).where(eq(autoPostsQueue.id, id)).limit(1);
        if (!rows[0]) {
          results.push({ id, ok: false, error: 'not found' });
          continue;
        }
        await db.update(autoPostsQueue).set({ status: 'failed', processedAt: new Date() } as any).where(eq(autoPostsQueue.id, id));
        results.push({ id, ok: true });
      } catch (err) {
        console.error('Bulk decline error for', id, err);
        results.push({ id, ok: false, error: String(err) });
      }
    }
    res.json({ results });
  } catch (err) {
    console.error('Bulk decline failed:', err);
    res.status(500).json({ error: 'Bulk decline failed' });
  }
});

export default router;
