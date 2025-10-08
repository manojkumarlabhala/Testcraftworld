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

// For Coolify MySQL, use the connection string directly with SSL settings
const connectionConfig: mysql.PoolOptions = {
  uri: process.env.DATABASE_URL,
  connectionLimit: 10,
  queueLimit: 0
};

// For MySQL, create connection pool and pass to drizzle
const connection = mysql.createPool(connectionConfig);

export const db = drizzle(connection, { schema, mode: 'default' });
