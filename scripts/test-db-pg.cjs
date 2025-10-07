#!/usr/bin/env node
const { Client } = require('pg');

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('DATABASE_URL is not set. Copy .env.example to .env and fill in DATABASE_URL');
  process.exit(2);
}

(async () => {
  const client = new Client({ connectionString: DATABASE_URL });
  try {
    console.log('Attempting direct PG connection...');
    await client.connect();
    const res = await client.query('SELECT 1 as ok');
    console.log('PG connection success:', res.rows[0]);
    await client.end();
    process.exit(0);
  } catch (err) {
    console.error('PG connection failed:', err && err.message ? err.message : err);
    try { await client.end(); } catch(e){}
    process.exit(1);
  }
})();
