import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage, useMemoryStorage } from "./storage";
import { createSamplePosts } from "./createSamplePosts";
import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";
import adminAiRoutes from "./routes/adminAi.js";
import adminApiKeyRoutes from "./routes/adminApiKeys.js";
import adminQueueRoutes from './routes/adminQueue.js';

// Simple in-memory session store for admin sessions (development use)
const sessions = new Map<string, { userId: string; expires: number }>();

function isAuthorizedAdmin(req: any) {
  // In development mode, allow access without authentication for easier testing
  if (process.env.NODE_ENV === 'development') {
    return true;
  }

  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) return false;
  if (process.env.ADMIN_TOKEN && token === process.env.ADMIN_TOKEN) return true;
  const session = sessions.get(token);
  if (!session) return false;
  if (session.expires < Date.now()) {
    sessions.delete(token);
    return false;
  }
  return true;
}

export async function registerRoutes(app: any): Promise<Server> {
  // Initialize database if we're not in build time and DATABASE_URL is available
  if (process.env.DATABASE_URL && process.env.NODE_ENV !== 'build') {
    const maxRetries = 3;
    let retryCount = 0;

    while (retryCount < maxRetries) {
      try {
        console.log(`Attempting database initialization (attempt ${retryCount + 1}/${maxRetries})`);

        // Create fixed admin and user accounts for the website
        // Create main admin user (Testcraft World Admin)
        const adminExists = await storage.getUserByUsername(process.env.TEST_ADMIN_USERNAME || 'testcraftworld');
        if (!adminExists) {
          const hashed = await bcrypt.hash(process.env.TEST_ADMIN_PASSWORD || 'admin123', 10);
          await storage.createUser({
            username: process.env.TEST_ADMIN_USERNAME || 'testcraftworld',
            password: hashed,
            email: process.env.TEST_ADMIN_EMAIL || 'blogs_admin@testcraft.in',
            role: 'admin'
          });
          console.log('Fixed admin user created:', process.env.TEST_ADMIN_USERNAME || 'testcraftworld');
        }

        // Create main author user (Testcraft World Author)
        const authorExists = await storage.getUserByUsername(process.env.TEST_AUTHOR_USERNAME || 'author');
        if (!authorExists) {
          const hashed = await bcrypt.hash(process.env.TEST_AUTHOR_PASSWORD || 'author123', 10);
          await storage.createUser({
            username: process.env.TEST_AUTHOR_USERNAME || 'author',
            password: hashed,
            email: process.env.TEST_AUTHOR_EMAIL || 'testcraftworld@testcraft.in',
            role: 'author'
          });
          console.log('Fixed author user created:', process.env.TEST_AUTHOR_USERNAME || 'author');
        } else {
          console.log('Fixed author user already exists:', process.env.TEST_AUTHOR_USERNAME || 'author');
        }

        // Legacy admin user for backward compatibility
        const legacyAdminExists = await storage.getUserByUsername('admin');
        if (!legacyAdminExists) {
          const hashed = await bcrypt.hash(process.env.ADMIN_TOKEN || 'admin', 10);
          await storage.createUser({ username: 'admin', password: hashed, email: 'admin@testcraft.com', role: 'admin' });
          console.log('Legacy admin user created');
        }

        // Create default categories
        const defaultCategories = [
          { name: 'Technology', slug: 'technology', description: 'Latest technology news and trends' },
          { name: 'Business', slug: 'business', description: 'Business insights and strategies' },
          { name: 'Design', slug: 'design', description: 'Design trends and inspiration' },
          { name: 'Lifestyle', slug: 'lifestyle', description: 'Lifestyle tips and wellness' },
          { name: 'Marketing', slug: 'marketing', description: 'Marketing strategies and tips' }
        ];

        for (const categoryData of defaultCategories) {
          const categoryExists = await storage.getCategoryBySlug(categoryData.slug);
          if (!categoryExists) {
            await storage.createCategory(categoryData);
            console.log('Default category created:', categoryData.name);
          }
        }

        // Create sample posts for each category
        await createSamplePosts();

        console.log('Database initialization completed successfully');
        break; // Success, exit retry loop

      } catch (error) {
        retryCount++;
        console.error(`Database initialization attempt ${retryCount} failed:`, (error as any).message || error);

        // If the error is a timeout / network unreachable and the environment
        // allows falling back to memory storage, do that immediately instead
        // of retrying further. This helps the app start even when the DB
        // is temporarily unreachable (e.g. network firewall issues).
        const errMsg = (error as any)?.code || (error as any)?.message || '';
        if (errMsg && (errMsg === 'ETIMEDOUT' || errMsg === 'ENOTFOUND' || errMsg.includes('timeout'))) {
          if (process.env.DATABASE_FALLBACK_TO_MEMORY === 'true') {
            console.warn('Database appears unreachable (timeout). Falling back to in-memory storage as DATABASE_FALLBACK_TO_MEMORY=true');
            useMemoryStorage(true);
            break;
          } else {
            console.warn('Database unreachable (timeout). To enable automatic fallback to in-memory storage, set DATABASE_FALLBACK_TO_MEMORY=true');
          }
        }

        if (retryCount < maxRetries) {
          const delay = Math.min(1000 * Math.pow(2, retryCount), 10000); // Exponential backoff, max 10s
          console.log(`Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        } else {
          console.error('Database initialization failed after all retries, but continuing server startup');
          // Don't fail the server startup if database is not available during build
          if (process.env.NODE_ENV === 'production') {
            console.warn('Database initialization failed, but continuing server startup');
          }
        }
      }
    }
  } else {
    console.log('Skipping database initialization (build time or no DATABASE_URL)');
  }

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    (async () => {
      try {
        const intervalMs = parseInt(process.env.AGENT_INTERVAL_MS || '') || 1000 * 60 * 60;
        let lastRun: number | null = null;
        try {
          const schema = await import('@shared/schema');
          const db2 = (await import('./db')).db;
          const rows = await db2.select().from((schema as any).aiSettings).where((await import('drizzle-orm')).eq((schema as any).aiSettings.key, 'agent_last_run')).limit(1);
          if (rows && rows[0] && rows[0].value) lastRun = parseInt(rows[0].value);
        } catch (e) {
          // ignore DB read errors
        }
        const nextRun = lastRun ? new Date(lastRun + intervalMs).toISOString() : null;
        res.json({ status: "ok", timestamp: new Date().toISOString(), agent: { intervalMs, lastRun: lastRun ? new Date(lastRun).toISOString() : null, nextRun } });
      } catch (err) {
        res.json({ status: 'ok', timestamp: new Date().toISOString() });
      }
    })();
  });

  // DB status endpoint (helpful to quickly check if app is using DB or memory)
  app.get('/api/db-status', async (req, res) => {
    try {
      const usingMemory = (storage as any) instanceof (await import('./storage').then(m => m.MemStorage).catch(() => Object));
      let dbReachable = false;
      if (!usingMemory) {
        try {
          // quick query to ensure DB responds
          await (await import('./db')).db.select().from((await import('@shared/schema')).users).limit(1);
          dbReachable = true;
        } catch (err) {
          dbReachable = false;
        }
      }
      res.json({ storage: usingMemory ? 'memory' : 'database', dbReachable });
    } catch (err) {
      res.status(500).json({ error: 'failed to determine db status', details: String(err) });
    }
  });

  // Blog posts endpoints
  app.get("/api/posts", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = parseInt(req.query.offset as string) || 0;
      const posts = await storage.getPublishedPosts(limit, offset);
      const postsWithAuthors = await Promise.all(posts.map(async (post) => {
        if (post.authorId) {
          const author = await storage.getUser(post.authorId);
          const authorName = (author as any)?.displayName || (author as any)?.username || 'Unknown';
          return { ...post, authorName };
        }
        return { ...post, authorName: 'Anonymous' };
      }));
      res.json(postsWithAuthors);
    } catch (error) {
      console.error("Error fetching posts:", error);
      res.status(500).json({ error: "Failed to fetch posts" });
    }
  });

  app.get("/api/posts/:id", async (req, res) => {
    try {
      const post = await storage.getPost(req.params.id);
      if (!post) {
        return res.status(404).json({ error: "Post not found" });
      }
      let authorName = 'Anonymous';
      if (post.authorId) {
        const author = await storage.getUser(post.authorId);
        authorName = (author as any)?.displayName || (author as any)?.username || 'Unknown';
      }
      res.json({ ...post, authorName });
    } catch (error) {
      console.error("Error fetching post:", error);
      res.status(500).json({ error: "Failed to fetch post" });
    }
  });

  // Categories endpoints
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ error: "Failed to fetch categories" });
    }
  });

  // Comments endpoints
  app.get("/api/posts/:postId/comments", async (req, res) => {
    try {
      const post = await storage.getPost(req.params.postId);
      if (!post) return res.status(404).json({ error: 'Post not found' });

      // If the post was generated by the AI or explicitly disabled comments,
      // only show real user-submitted comments (those with an authorId).
      if ((post as any).generated || (post as any).commentsDisabled) {
        const comments = await storage.getCommentsByPost(req.params.postId);
        const userComments = comments.filter(c => !!(c as any).authorId);
        return res.json(userComments);
      }

      const comments = await storage.getCommentsByPost(req.params.postId);
      res.json(comments);
    } catch (error) {
      console.error("Error fetching comments:", error);
      res.status(500).json({ error: "Failed to fetch comments" });
    }
  });

  // Contact form submission
  app.post("/api/contact", async (req, res) => {
    try {
      const { name, email, message } = req.body;
      // In production: persist message or forward to email service
      console.log("Contact form:", { name, email, message });
      res.json({ status: "ok" });
    } catch (error) {
      console.error("Error handling contact form:", error);
      res.status(500).json({ error: "Failed to process contact form" });
    }
  });

  // Admin endpoints (basic token-protected)
  // Admin: create fresh admin credentials (removes existing users if requested)
  app.post("/api/admin/create-admin", async (req, res) => {
    try {
      const token = req.headers.authorization?.replace("Bearer ", "");
      if (!token || token !== process.env.ADMIN_TOKEN) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const { username, password, email, reset = false } = req.body;
      if (!username || !password) {
        return res.status(400).json({ error: "username and password required" });
      }

      if (reset) {
        await storage.deleteAllUsers();
      }

      const hashed = await bcrypt.hash(password, 10);
      const user = await storage.createUser({ username, password: hashed, email, role: "admin" });
      // create a session token for the created admin
      const oneTimeToken = randomUUID();
      sessions.set(oneTimeToken, { userId: user.id, expires: Date.now() + 1000 * 60 * 60 });
      res.json({ user: { id: user.id, username: user.username, email: user.email, role: user.role }, token: oneTimeToken });
    } catch (error) {
      console.error("Error creating admin:", error);
      res.status(500).json({ error: "Failed to create admin" });
    }
  });

  // Admin: login as user (returns a simple token for dev use)
  app.post("/api/admin/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) return res.status(400).json({ error: "username and password required" });
      const user = await storage.getUserByUsername(username);
      if (!user) return res.status(401).json({ error: "invalid credentials" });
      const match = await bcrypt.compare(password, (user as any).password || "");
      if (!match) return res.status(401).json({ error: "invalid credentials" });
      // Issue a simple session token (DEV only, ephemeral)
      const session = randomUUID();
      sessions.set(session, { userId: user.id, expires: Date.now() + 1000 * 60 * 60 });
      // For now return token; production should use proper session storage.
      res.json({ token: session, user: { id: user.id, username: user.username, role: user.role } });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  // logout
  app.post('/api/admin/logout', (req, res) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (token && sessions.has(token)) {
      sessions.delete(token);
    }
    res.json({ ok: true });
  });

  // General auth endpoints
  app.post('/api/auth/register', async (req, res) => {
    try {
      const { username, password, email } = req.body;
      if (!username || !password) return res.status(400).json({ error: 'username and password required' });
      const existing = await storage.getUserByUsername(username);
      if (existing) return res.status(409).json({ error: 'username already exists' });
      const hashed = await bcrypt.hash(password, 10);
      const user = await storage.createUser({ username, password: hashed, email, role: 'author' });
      // create session token
      const session = randomUUID();
      sessions.set(session, { userId: user.id, expires: Date.now() + 1000 * 60 * 60 });
      res.json({ token: session, user: { id: user.id, username: user.username, role: user.role } });
    } catch (error) {
      console.error('Register error:', error);
      res.status(500).json({ error: 'Registration failed' });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) return res.status(400).json({ error: 'username and password required' });
      const user = await storage.getUserByUsername(username);
      if (!user) return res.status(401).json({ error: 'invalid credentials' });
      const match = await bcrypt.compare(password, (user as any).password || '');
      if (!match) return res.status(401).json({ error: 'invalid credentials' });
      const session = randomUUID();
      sessions.set(session, { userId: user.id, expires: Date.now() + 1000 * 60 * 60 });
      res.json({ token: session, user: { id: user.id, username: user.username, role: user.role } });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Login failed' });
    }
  });

  app.post('/api/auth/logout', (req, res) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (token && sessions.has(token)) {
      sessions.delete(token);
    }
    res.json({ ok: true });
  });

  // Admin: list users
  app.get('/api/admin/users', async (req, res) => {
    try {
      if (!isAuthorizedAdmin(req)) return res.status(401).json({ error: 'Unauthorized' });
      const users = await storage.getUsers();
      // hide passwords
      const safe = users.map(u => ({ id: u.id, username: u.username, displayName: (u as any).displayName || u.username, email: u.email, role: u.role, createdAt: u.createdAt }));
      res.json(safe);
    } catch (err) {
      console.error('Error listing users:', err);
      res.status(500).json({ error: 'Failed to list users' });
    }
  });

  app.delete('/api/admin/users/:id', async (req, res) => {
    try {
      if (!isAuthorizedAdmin(req)) return res.status(401).json({ error: 'Unauthorized' });
      const ok = await storage.deleteUser(req.params.id);
      res.json({ ok });
    } catch (err) {
      console.error('Error deleting user:', err);
      res.status(500).json({ error: 'Failed to delete user' });
    }
  });

  // Admin: posts management
  app.get('/api/admin/posts', async (req, res) => {
    try {
      if (!isAuthorizedAdmin(req)) return res.status(401).json({ error: 'Unauthorized' });
      const posts = await storage.getPosts(1000, 0);
      // attach author display names for admin UI
      const postsWithAuthors = await Promise.all(posts.map(async (post) => {
        if (post.authorId) {
          const author = await storage.getUser(post.authorId);
          const authorName = (author as any)?.displayName || (author as any)?.username || 'Unknown';
          return { ...post, authorName };
        }
        return { ...post, authorName: 'Anonymous' };
      }));
      res.json(postsWithAuthors);
    } catch (err) {
      console.error('Error listing posts:', err);
      res.status(500).json({ error: 'Failed to list posts' });
    }
  });

  app.delete('/api/admin/posts/:id', async (req, res) => {
    try {
      if (!isAuthorizedAdmin(req)) return res.status(401).json({ error: 'Unauthorized' });
      const ok = await storage.deletePost(req.params.id);
      res.json({ ok });
    } catch (err) {
      console.error('Error deleting post:', err);
      res.status(500).json({ error: 'Failed to delete post' });
    }
  });

  app.put('/api/admin/posts/:id', async (req, res) => {
    try {
      if (!isAuthorizedAdmin(req)) return res.status(401).json({ error: 'Unauthorized' });
      const updated = await storage.updatePost(req.params.id, req.body);
      res.json(updated);
    } catch (err) {
      console.error('Error updating post:', err);
      res.status(500).json({ error: 'Failed to update post' });
    }
  });

  // Admin: re-validate a post's source link
  app.post('/api/admin/posts/:id/validate-source', async (req, res) => {
    try {
      if (!isAuthorizedAdmin(req)) return res.status(401).json({ error: 'Unauthorized' });
      const post = await storage.getPost(req.params.id);
      if (!post) return res.status(404).json({ error: 'Post not found' });
      const source = (post as any).sourceLink || (post as any).source_link;
      if (!source) return res.json({ ok: false, reason: 'No source link present' });

      // Basic validation: reachable and http(s)
      try {
        const fetch = (await import('node-fetch')).default;
        const url = new URL(source as string);
        if (!['http:', 'https:'].includes(url.protocol)) {
          // log failure
          const id = randomUUID();
          const db = (await import('./db')).db;
          const schema = await import('@shared/schema');
          await db.insert((schema as any).sourceValidationLogs).values({ id, postId: req.params.id, ok: false, reason: 'Invalid protocol', checkedBy: req.ip });
          return res.json({ ok: false, reason: 'Invalid protocol' });
        }
        const resp = await fetch(url.toString(), { method: 'HEAD', redirect: 'follow', timeout: 5000 });
        if (resp && resp.status >= 200 && resp.status < 400) {
          const id = randomUUID();
          const db = (await import('./db')).db;
          const schema = await import('@shared/schema');
          await db.insert((schema as any).sourceValidationLogs).values({ id, postId: req.params.id, ok: true, reason: null, checkedBy: req.ip });
          return res.json({ ok: true });
        }
        const resp2 = await fetch(url.toString(), { method: 'GET', redirect: 'follow', timeout: 5000 });
        if (resp2 && resp2.status >= 200 && resp2.status < 400) {
    const id = randomUUID();
    const db = (await import('./db')).db;
    const schema = await import('@shared/schema');
    await db.insert((schema as any).sourceValidationLogs).values({ id, postId: req.params.id, ok: true, reason: null, checkedBy: req.ip });
          return res.json({ ok: true });
        }
  const id = randomUUID();
  const db = (await import('./db')).db;
  const schema = await import('@shared/schema');
  await db.insert((schema as any).sourceValidationLogs).values({ id, postId: req.params.id, ok: false, reason: `Unreachable (status ${resp?.status || resp2?.status})`, checkedBy: req.ip });
        return res.json({ ok: false, reason: `Unreachable (status ${resp?.status || resp2?.status})` });
      } catch (err) {
  const id = randomUUID();
  const db = (await import('./db')).db;
  const schema = await import('@shared/schema');
  try { await db.insert((schema as any).sourceValidationLogs).values({ id, postId: req.params.id, ok: false, reason: String(err), checkedBy: req.ip }); } catch(e){}
        return res.json({ ok: false, reason: String(err) });
      }
    } catch (err) {
      console.error('Error validating source link:', err);
      res.status(500).json({ error: 'Validation failed', details: String(err) });
    }
  });

  // Fetch validation logs for a post
  app.get('/api/admin/posts/:id/validation-logs', async (req, res) => {
    try {
      if (!isAuthorizedAdmin(req)) return res.status(401).json({ error: 'Unauthorized' });
      const schema = await import('@shared/schema');
      const db = (await import('./db')).db;
  const { eq } = await import('drizzle-orm');
  const logs = await db.select().from((schema as any).sourceValidationLogs).where(eq((schema as any).sourceValidationLogs.postId, req.params.id));
      res.json(logs);
    } catch (err) {
      console.error('Error fetching validation logs:', err);
      res.status(500).json({ error: 'Failed to fetch logs' });
    }
  });

  // Force publish a post (admin action)
  app.post('/api/admin/posts/:id/force-publish', async (req, res) => {
    try {
      if (!isAuthorizedAdmin(req)) return res.status(401).json({ error: 'Unauthorized' });
      const updated = await storage.updatePost(req.params.id, { published: true } as any);
      res.json({ ok: !!updated, post: updated });
    } catch (err) {
      console.error('Error force-publishing post:', err);
      res.status(500).json({ error: 'Failed to publish post' });
    }
  });

  app.post("/api/admin/create-post", async (req, res) => {
    try {
      const token = req.headers.authorization?.replace("Bearer ", "");
      if (!token || token !== process.env.ADMIN_TOKEN) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      try {
        const post = await storage.createPost(req.body);
        return res.json(post);
      } catch (err) {
        console.error("DB createPost failed, switching to memory storage and retrying:", err);
        try {
          const mem = useMemoryStorage();
          const post = await mem.createPost(req.body);
          return res.json(post);
        } catch (err2) {
          console.error("Memory fallback also failed:", err2);
          return res.status(500).json({ error: "Failed to create post" });
        }
      }
    } catch (error) {
      console.error("Error creating post:", error);
      res.status(500).json({ error: "Failed to create post" });
    }
  });

  app.post("/api/admin/create-category", async (req, res) => {
    try {
      const token = req.headers.authorization?.replace("Bearer ", "");
      if (!token || token !== process.env.ADMIN_TOKEN) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      try {
        const category = await storage.createCategory(req.body);
        return res.json(category);
      } catch (err) {
        console.error("DB createCategory failed, switching to memory storage and retrying:", err);
        try {
          const mem = useMemoryStorage();
          const category = await mem.createCategory(req.body);
          return res.json(category);
        } catch (err2) {
          console.error("Memory fallback also failed:", err2);
          return res.status(500).json({ error: "Failed to create category" });
        }
      }
    } catch (error) {
      console.error("Error creating category:", error);
      res.status(500).json({ error: "Failed to create category" });
    }
  });

  // User endpoints
  app.post("/api/user/create-post", async (req, res) => {
    try {
      const token = req.headers.authorization?.replace("Bearer ", "");
      if (!token) return res.status(401).json({ error: "Unauthorized" });
      const session = sessions.get(token);
      if (!session || session.expires < Date.now()) return res.status(401).json({ error: "Unauthorized" });
      const user = await storage.getUser(session.userId);
      if (!user || (user.role !== 'admin' && user.role !== 'author')) return res.status(403).json({ error: "Forbidden" });
      const post = await storage.createPost({ ...req.body, authorId: user.id });
      res.json(post);
    } catch (error) {
      console.error("Error creating post:", error);
      res.status(500).json({ error: "Failed to create post" });
    }
  });

  // User profile endpoints (authenticated via session token)
  app.get('/api/user/me', async (req, res) => {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (!token) return res.status(401).json({ error: 'Unauthorized' });
      const session = sessions.get(token);
      if (!session || session.expires < Date.now()) return res.status(401).json({ error: 'Unauthorized' });
      const user = await storage.getUser(session.userId);
      if (!user) return res.status(404).json({ error: 'User not found' });
      res.json({ user: { id: user.id, username: user.username, email: user.email, role: user.role, displayName: (user as any).displayName || user.username, createdAt: user.createdAt } });
    } catch (err) {
      console.error('Error fetching /api/user/me', err);
      res.status(500).json({ error: 'Failed to fetch user' });
    }
  });

  app.put('/api/user/me', async (req, res) => {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (!token) return res.status(401).json({ error: 'Unauthorized' });
      const session = sessions.get(token);
      if (!session || session.expires < Date.now()) return res.status(401).json({ error: 'Unauthorized' });
      const { displayName, email } = req.body;
      const updates: any = {};
      if (displayName !== undefined) updates.displayName = displayName;
      if (email !== undefined) updates.email = email;
      const updated = await storage.updateUser ? await (storage as any).updateUser(session.userId, updates) : null;
      // Some storage implementations don't have updateUser; fallback to delete/create is risky, so just return fresh user
      const user = await storage.getUser(session.userId);
      res.json({ user: { id: user?.id, username: user?.username, email: user?.email, role: user?.role, displayName: (user as any)?.displayName || user?.username, createdAt: (user as any)?.createdAt } });
    } catch (err) {
      console.error('Error updating /api/user/me', err);
      res.status(500).json({ error: 'Failed to update user' });
    }
  });

  // Request to become author (immediately grant role 'author' in this simple implementation)
  app.post('/api/user/request-author', async (req, res) => {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (!token) return res.status(401).json({ error: 'Unauthorized' });
      const session = sessions.get(token);
      if (!session || session.expires < Date.now()) return res.status(401).json({ error: 'Unauthorized' });
      const user = await storage.getUser(session.userId);
      if (!user) return res.status(404).json({ error: 'User not found' });
      // Update role to author
      try {
        if ((storage as any).updateUser) {
          await (storage as any).updateUser(user.id, { role: 'author' });
        } else {
          // For DB storage we can call updatePost-like generic method if available
          if ((storage as any).updateUser === undefined && (storage as any).updatePost === undefined) {
            // best-effort: use storage.updatePost? no; just create a new user replacement is unsafe
          }
        }
      } catch (e) {
        // ignore update errors; we'll at least return success if storage persists on next fetch
      }
      res.json({ message: 'Role updated to author (if supported by storage)' });
    } catch (err) {
      console.error('Error requesting author role', err);
      res.status(500).json({ error: 'Failed to request author' });
    }
  });

  app.post('/api/user/start-reading', async (req, res) => {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (!token) return res.status(401).json({ error: 'Unauthorized' });
      const session = sessions.get(token);
      if (!session || session.expires < Date.now()) return res.status(401).json({ error: 'Unauthorized' });
      const user = await storage.getUser(session.userId);
      if (!user) return res.status(404).json({ error: 'User not found' });
      // Grant reader role
      try {
        if ((storage as any).updateUser) {
          await (storage as any).updateUser(user.id, { role: 'reader' });
        }
      } catch (e) {}
      res.json({ message: 'Role set to reader (if supported by storage)' });
    } catch (err) {
      console.error('Error starting reading', err);
      res.status(500).json({ error: 'Failed to change role' });
    }
  });

  // Admin AI routes
  app.use('/api/admin/ai', adminAiRoutes);

  // Admin: get/set per-category auto-publish settings (stored in ai_settings)
  app.get('/api/admin/category-auto-publish', async (req, res) => {
    try {
      if (!isAuthorizedAdmin(req)) return res.status(401).json({ error: 'Unauthorized' });
      const schema = await import('@shared/schema');
      const db = (await import('./db')).db;
      const { eq } = await import('drizzle-orm');
      const rows = await db.select().from((schema as any).aiSettings).where(eq((schema as any).aiSettings.key, 'category_auto_publish')).limit(1);
      if (!rows[0]) return res.json({ settings: {} });
      const parsed = JSON.parse(rows[0].value || '{}');
      res.json({ settings: parsed });
    } catch (err) {
      console.error('Error fetching category auto-publish settings:', err);
      res.status(500).json({ error: 'Failed to fetch settings' });
    }
  });

  app.post('/api/admin/category-auto-publish', async (req, res) => {
    try {
      if (!isAuthorizedAdmin(req)) return res.status(401).json({ error: 'Unauthorized' });
      const { settings } = req.body;
      if (!settings || typeof settings !== 'object') return res.status(400).json({ error: 'settings object required' });
      const schema = await import('@shared/schema');
      const db = (await import('./db')).db;
      const { eq } = await import('drizzle-orm');

      const existing = await db.select().from((schema as any).aiSettings).where(eq((schema as any).aiSettings.key, 'category_auto_publish')).limit(1);
      const value = JSON.stringify(settings);
      if (existing[0]) {
        await db.update((schema as any).aiSettings).set({ value } as any).where(eq((schema as any).aiSettings.key, 'category_auto_publish'));
      } else {
        const id = require('crypto').randomUUID();
        await db.insert((schema as any).aiSettings).values({ key: 'category_auto_publish', value, createdAt: new Date(), id } as any);
      }
      res.json({ ok: true });
    } catch (err) {
      console.error('Error saving category auto-publish settings:', err);
      res.status(500).json({ error: 'Failed to save settings' });
    }
  });

  // Admin API key routes
  app.use('/api/admin', adminApiKeyRoutes);

  // Admin queue routes (list and publish queued AI-generated posts)
  app.use('/api/admin/queue', adminQueueRoutes);

  const httpServer = createServer(app);

  return httpServer;
}
