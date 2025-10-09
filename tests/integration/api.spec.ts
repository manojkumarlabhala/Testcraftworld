import { describe, it, beforeAll, afterAll, expect } from 'vitest';
import request from 'supertest';

let server: any;
let agent: any;

beforeAll(async () => {
  // Ensure tests run in a controlled environment
  process.env.NODE_ENV = 'test';
  // Provide a DATABASE_URL so modules that expect it don't throw; we'll force memory storage below
  process.env.DATABASE_URL = process.env.DATABASE_URL || 'mysql://test:test@127.0.0.1:3306/testdb';
  process.env.DATABASE_FALLBACK_TO_MEMORY = 'true';
  process.env.ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'test_admin_token';
  process.env.TEST_ADMIN_USERNAME = process.env.TEST_ADMIN_USERNAME || 'test_admin';
  process.env.TEST_ADMIN_PASSWORD = process.env.TEST_ADMIN_PASSWORD || 'admin123';

  // Dynamically import storage first so we can force memory storage before routes initialize
  const storageModule = await import('../../server/storage');
  // Force switching to in-memory storage for reliable, fast tests
  storageModule.useMemoryStorage(true);

  // Now import routes and create an express app
  const { registerRoutes } = await import('../../server/routes');
  const express = (await import('express')).default;
  const app = express();
  app.use(express.json());

  server = await registerRoutes(app);
  // create a supertest agent and cast to any to avoid TS method signature complaints in this test file
  agent = request(server as any) as any;
});

afterAll(() => {
  if (server && typeof server.close === 'function') {
    server.close();
  }
});

describe('Integration: basic API flows', () => {
  it('responds to /api/health', async () => {
    const res = await agent.get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'ok');
  });

  it('admin create -> login -> create category -> create post flow', async () => {
    const adminToken = process.env.ADMIN_TOKEN as string;

    // Create admin using the special admin-token protected endpoint
    const createRes = await agent
      .post('/api/admin/create-admin')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ username: 'integ_user', password: 'pw123', email: 'integ@test.local', reset: true });

    expect(createRes.status).toBe(200);
    expect(createRes.body).toHaveProperty('token');

    // Login as the created admin
  const loginRes = await agent.post('/api/admin/login').send({ username: 'integ_user', password: 'pw123' });
    expect(loginRes.status).toBe(200);
    expect(loginRes.body).toHaveProperty('token');
    const sessionToken = loginRes.body.token;

    // Create a category (requires ADMIN_TOKEN header)
    const catRes = await agent
      .post('/api/admin/create-category')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Integration', slug: 'integration', description: 'Integration tests' });

    expect(catRes.status).toBe(200);
    expect(catRes.body).toHaveProperty('name', 'Integration');

    // Create a post using admin create-post (protected by ADMIN_TOKEN)
    const postRes = await agent
      .post('/api/admin/create-post')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ title: 'Test Post', slug: 'test-post', content: 'Hello world', published: false });

    expect(postRes.status).toBe(200);
    expect(postRes.body).toHaveProperty('id');

    // List admin posts and ensure we get an array
    const adminListRes = await agent.get('/api/admin/posts').set('Authorization', `Bearer ${adminToken}`);
    expect(adminListRes.status).toBe(200);
    expect(Array.isArray(adminListRes.body)).toBe(true);
  });
});
