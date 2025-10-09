#!/usr/bin/env node
/**
 * Simple integration test runner using supertest and Node assertions.
 * This avoids depending on the project's test runner configuration.
 */
const request = require('supertest');
const assert = require('assert');

(async () => {
  try {
    process.env.NODE_ENV = 'test';
    process.env.DATABASE_FALLBACK_TO_MEMORY = 'true';
    process.env.ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'test_admin_token';
    process.env.TEST_ADMIN_USERNAME = process.env.TEST_ADMIN_USERNAME || 'test_admin';
    process.env.TEST_ADMIN_PASSWORD = process.env.TEST_ADMIN_PASSWORD || 'admin123';

    // Force memory storage before routes initialize
    const storageModule = await import('../server/storage.js');
    if (storageModule && typeof storageModule.useMemoryStorage === 'function') {
      storageModule.useMemoryStorage(true);
    }

    const express = require('express');
    const routesModule = await import('../server/routes.js');
    const { registerRoutes } = routesModule;
    const app = express();
    app.use(express.json());
    const server = await registerRoutes(app);

    console.log('Running health check...');
    let res = await request(server).get('/api/health');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.status, 'ok');

    console.log('Creating admin via /api/admin/create-admin');
    res = await request(server)
      .post('/api/admin/create-admin')
      .set('Authorization', `Bearer ${process.env.ADMIN_TOKEN}`)
      .send({ username: 'integ_user', password: 'pw123', email: 'integ@test.local', reset: true });
    assert.strictEqual(res.status, 200);
    assert.ok(res.body.token);

    console.log('Logging in as created admin');
    res = await request(server).post('/api/admin/login').send({ username: 'integ_user', password: 'pw123' });
    assert.strictEqual(res.status, 200);
    assert.ok(res.body.token);

    console.log('Creating category');
    res = await request(server)
      .post('/api/admin/create-category')
      .set('Authorization', `Bearer ${process.env.ADMIN_TOKEN}`)
      .send({ name: 'Integration', slug: 'integration', description: 'Integration tests' });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.name, 'Integration');

    console.log('Creating admin post');
    res = await request(server)
      .post('/api/admin/create-post')
      .set('Authorization', `Bearer ${process.env.ADMIN_TOKEN}`)
      .send({ title: 'Test Post', slug: 'test-post', content: 'Hello world', published: false });
    assert.strictEqual(res.status, 200);
    assert.ok(res.body.id);

    console.log('Listing admin posts');
    res = await request(server).get('/api/admin/posts').set('Authorization', `Bearer ${process.env.ADMIN_TOKEN}`);
    assert.strictEqual(res.status, 200);
    assert.ok(Array.isArray(res.body));

    console.log('All integration checks passed');
    // Close server if returned
    if (server && server.close) server.close();
    process.exit(0);
  } catch (err) {
    console.error('Integration tests failed:', err);
    process.exit(2);
  }
})();
