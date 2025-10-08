#!/usr/bin/env node
const mysql = require('mysql2/promise');
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
  port: u.port || 3306,
  user: u.username,
  password: u.password,
  database: u.pathname ? u.pathname.slice(1) : undefined,
  ssl: {
    rejectUnauthorized: false,
  },
};

console.log('Attempting MySQL connection with ssl.rejectUnauthorized=false to', config.host + ':' + config.port);

(async () => {
  try {
    const connection = await mysql.createConnection(config);
    const [rows] = await connection.execute('SELECT 1 as ok');
    console.log('MySQL SSL override success:', rows[0]);
    await connection.end();
    process.exit(0);
  } catch (err) {
    console.error('MySQL SSL override failed:', err && err.message ? err.message : err);
    process.exit(1);
  }
})();
