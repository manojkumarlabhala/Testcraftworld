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
console.log('Parsed database connection details:');
console.log('- Host:', url.hostname);
console.log('- Port:', url.port);
console.log('- Database:', url.pathname.slice(1));
console.log('- Username:', url.username ? 'Set' : 'Not set');

// For Coolify MySQL, configure SSL properly
const connectionConfig: mysql.PoolOptions = {
  host: url.hostname,
  port: parseInt(url.port),
  user: url.username,
  password: url.password,
  database: url.pathname.slice(1), // Remove leading slash
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 60000, // 60 seconds
};

// Configure SSL based on DATABASE_SSL_BYPASS
if (process.env.DATABASE_SSL_BYPASS !== 'true') {
  connectionConfig.ssl = {
    rejectUnauthorized: false
  };
  console.log('SSL configured with rejectUnauthorized: false');
} else {
  console.log('SSL bypassed for database connection');
}

// For MySQL, create connection pool and pass to drizzle
const connection = mysql.createPool(connectionConfig);

// Test the connection
connection.getConnection()
  .then(conn => {
    console.log('Database connection successful');
    conn.release();
  })
  .catch(err => {
    console.error('Database connection failed:', err.message);
    console.error('Connection config:', {
      host: connectionConfig.host,
      port: connectionConfig.port,
      database: connectionConfig.database,
      user: connectionConfig.user ? 'Set' : 'Not set',
      ssl: connectionConfig.ssl ? 'Configured' : 'Not configured'
    });
  });

export const db = drizzle(connection, { schema, mode: 'default' });
