import mysql from 'mysql2/promise';
import { drizzle } from 'drizzle-orm/mysql2';
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');
console.log('DATABASE_SSL_BYPASS:', process.env.DATABASE_SSL_BYPASS || 'false');

// Parse the DATABASE_URL to extract connection details
const url = new URL(process.env.DATABASE_URL);

// For Coolify MySQL, configure SSL properly
const connectionConfig: mysql.PoolOptions = {
  host: url.hostname,
  port: parseInt(url.port),
  user: url.username,
  password: url.password,
  database: url.pathname.slice(1), // Remove leading slash
  connectionLimit: 10,
  queueLimit: 0
};

// Configure SSL based on DATABASE_SSL_BYPASS
if (process.env.DATABASE_SSL_BYPASS !== 'true') {
  connectionConfig.ssl = {
    rejectUnauthorized: false
  };
}

// For MySQL, create connection pool and pass to drizzle
const connection = mysql.createPool(connectionConfig);

export const db = drizzle(connection, { schema, mode: 'default' });
