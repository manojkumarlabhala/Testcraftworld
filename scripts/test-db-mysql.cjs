#!/usr/bin/env node
const mysql = require('mysql2/promise');

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('DATABASE_URL is not set. Copy .env.example to .env and fill in DATABASE_URL');
  process.exit(2);
}

(async () => {
  try {
    console.log('Attempting direct MySQL connection...');
    const connection = await mysql.createConnection(DATABASE_URL);
    const [rows] = await connection.execute('SELECT 1 as ok');
    console.log('MySQL connection success:', rows[0]);
    await connection.end();
    process.exit(0);
  } catch (err) {
    console.error('MySQL connection failed:', err && err.message ? err.message : err);
    process.exit(1);
  }
})();
