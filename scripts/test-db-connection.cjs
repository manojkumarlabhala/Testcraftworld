#!/usr/bin/env node
const { Pool, neonConfig } = require('@neondatabase/serverless');
const ws = require('ws');

neonConfig.webSocketConstructor = ws;

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('DATABASE_URL is not set. Copy .env.example to .env and fill in DATABASE_URL');
  process.exit(2);
}

async function testConnection(retries = 3) {
  const pool = new Pool({ connectionString: DATABASE_URL });
  for (let i = 0; i <= retries; i++) {
    try {
      console.log(`Attempt ${i + 1} to connect to database...`);
      const client = await pool.connect();
      try {
        const res = await client.query('SELECT 1 as ok');
        console.log('Connection successful:', res.rows[0]);
        client.release();
        await pool.end();
        return 0;
      } catch (qerr) {
        console.error('Query error:', qerr && qerr.message ? qerr.message : qerr);
        client.release();
      }
    } catch (err) {
      console.error('Connection error:', err && err.message ? err.message : err);
    }
    const waitMs = Math.pow(2, i) * 1000;
    console.log(`Waiting ${waitMs}ms before next retry...`);
    await new Promise((r) => setTimeout(r, waitMs));
  }
  console.error('All connection attempts failed. See the errors above.');
  try { await pool.end(); } catch(e) {}
  return 1;
}

testConnection(process.env.DB_RETRIES ? parseInt(process.env.DB_RETRIES) : 3)
  .then((code) => process.exit(code))
  .catch((e) => { console.error('Fatal error testing DB:', e); process.exit(3); });
