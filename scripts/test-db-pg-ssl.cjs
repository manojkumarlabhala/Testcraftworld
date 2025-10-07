#!/usr/bin/env node
const { Client } = require('pg');
const { URL } = require('url');

const raw = process.env.DATABASE_URL;
if (!raw) {
  console.error('DATABASE_URL is not set. Copy .env.example to .env and fill in DATABASE_URL');
  process.exit(2);
}

// Parse and build config so we can pass explicit ssl options
const u = new URL(raw);
const config = {
  host: u.hostname,
  port: u.port || 5432,
  user: u.username,
  password: u.password,
  database: u.pathname ? u.pathname.slice(1) : undefined,
  ssl: {
    rejectUnauthorized: false,
  },
};

console.log('Attempting PG connection with ssl.rejectUnauthorized=false to', config.host + ':' + config.port);

(async () => {
  const client = new Client(config);
  try {
    await client.connect();
    const res = await client.query('SELECT 1 as ok');
    console.log('PG SSL override success:', res.rows[0]);
    await client.end();
    process.exit(0);
  } catch (err) {
    console.error('PG SSL override failed:', err && err.message ? err.message : err);
    try { await client.end(); } catch(e){}
    process.exit(1);
  }
})();
