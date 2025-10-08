import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage, useMemoryStorage } from "./storage";
import { createSamplePosts } from "./createSamplePosts";
import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";

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
        console.error(`Database initialization attempt ${retryCount} failed:`, error.message);

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
    res.json({ status: "ok", timestamp: new Date().toISOString() });
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
          return { ...post, authorName: author?.username || 'Unknown' };
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
        authorName = author?.username || 'Unknown';
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
      const safe = users.map(u => ({ id: u.id, username: u.username, email: u.email, role: u.role, createdAt: u.createdAt }));
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
      res.json(posts);
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

  const httpServer = createServer(app);

  return httpServer;
}
