import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

// Configure WebSocket for Neon
neonConfig.webSocketConstructor = ws;

// Configure SSL handling for production - allow relaxed SSL in production for easier deployment
// Allow relaxing TLS verification when explicitly requested (useful for self-signed certs)
// or when running in production where the deployer has intentionally disabled cert checks.
if (
  process.env.DATABASE_SSL_BYPASS === 'true' ||
  process.env.NODE_ENV === 'production'
) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  console.warn(
    'Warning: TLS certificate validation for database connections has been disabled.\n' +
      'This is insecure in general — only use DATABASE_SSL_BYPASS=true in controlled environments.',
  );
}

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');
console.log('DATABASE_SSL_BYPASS:', process.env.DATABASE_SSL_BYPASS || 'false');

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle({ client: pool, schema });
