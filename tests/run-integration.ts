import request from 'supertest';
import assert from 'assert';

process.env.NODE_ENV = 'test';
// Provide a dummy DATABASE_URL to satisfy server/db.ts; storage will be forced to memory
process.env.DATABASE_URL = process.env.DATABASE_URL || 'mysql://test:test@127.0.0.1:3306/testdb';
process.env.DATABASE_FALLBACK_TO_MEMORY = 'true';
process.env.ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'test_admin_token';
process.env.TEST_ADMIN_USERNAME = process.env.TEST_ADMIN_USERNAME || 'test_admin';
process.env.TEST_ADMIN_PASSWORD = process.env.TEST_ADMIN_PASSWORD || 'admin123';

async function run() {
  try {
    // Force memory storage before routes initialize
    const storage = await import('../server/storage');
    if (storage && typeof (storage as any).useMemoryStorage === 'function') {
      (storage as any).useMemoryStorage(true);
    }

    const express = (await import('express')).default;
    const routesModule = await import('../server/routes');
    const { registerRoutes } = routesModule as any;
    const app = express();
    app.use(express.json());
  const server = await registerRoutes(app);
  // create an agent and cast to any to avoid TS complaints about the `Test` type
  const agent = (request(server as any) as any);

  console.log('Running health check...');
  let res = await agent.get('/api/health');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.status, 'ok');

    console.log('Creating admin via /api/admin/create-admin');
    res = await agent
      .post('/api/admin/create-admin')
      .set('Authorization', `Bearer ${process.env.ADMIN_TOKEN}`)
      .send({ username: 'integ_user', password: 'pw123', email: 'integ@test.local', reset: true });
    assert.strictEqual(res.status, 200);
    assert.ok(res.body.token);

    console.log('Logging in as created admin');
  res = await agent.post('/api/admin/login').send({ username: 'integ_user', password: 'pw123' });
    assert.strictEqual(res.status, 200);
    assert.ok(res.body.token);

    console.log('Creating category');
    res = await agent
      .post('/api/admin/create-category')
      .set('Authorization', `Bearer ${process.env.ADMIN_TOKEN}`)
      .send({ name: 'Integration', slug: 'integration', description: 'Integration tests' });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.name, 'Integration');

    console.log('Creating admin post');
    res = await agent
      .post('/api/admin/create-post')
      .set('Authorization', `Bearer ${process.env.ADMIN_TOKEN}`)
      .send({ title: 'Test Post', slug: 'test-post', content: 'Hello world', published: false });
    assert.strictEqual(res.status, 200);
    assert.ok(res.body.id);

    console.log('Listing admin posts');
  res = await agent.get('/api/admin/posts').set('Authorization', `Bearer ${process.env.ADMIN_TOKEN}`);
    assert.strictEqual(res.status, 200);
    assert.ok(Array.isArray(res.body));

    console.log('All integration checks passed');
    if (server && typeof server.close === 'function') server.close();
    process.exit(0);
  } catch (err) {
    console.error('Integration tests failed:', err);
    process.exit(2);
  }
}

run();
