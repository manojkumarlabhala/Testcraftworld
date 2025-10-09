import mysql from 'mysql2/promise';
import { drizzle } from 'drizzle-orm/mysql2';
import { eq } from 'drizzle-orm';
import * as schema from "@shared/schema";
import { randomUUID } from 'crypto';
import bcrypt from 'bcryptjs';

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
    // After a successful connection, ensure schema and defaults exist
    (async () => {
      try {
        await ensureSchemaAndDefaults();
      } catch (err) {
        console.error('Error ensuring schema/defaults:', err);
      }
    })();
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

// Ensure tables exist and create default categories/users if missing
export async function ensureSchemaAndDefaults() {
  try {
    const databaseName = connectionConfig.database as string;
    const requiredTables = ['users', 'categories', 'posts', 'comments', 'post_tags', 'api_keys'];

    for (const table of requiredTables) {
      const [rows]: any = await connection.query(
        'SELECT COUNT(*) as cnt FROM information_schema.tables WHERE table_schema = ? AND table_name = ?',
        [databaseName, table]
      );
      const cnt = rows && rows[0] ? rows[0].cnt : rows[0]?.cnt ?? 0;
      if (!cnt) {
        console.log(`Table '${table}' not found in database '${databaseName}'. Creating...`);
        // Run CREATE TABLE statements for each table
        await createTableIfMissing(table);
        console.log(`Created table '${table}'`);
      } else {
        console.log(`Table '${table}' already exists`);
      }
    }

    // Seed default categories and users if missing (using drizzle)
    try {
      // Create default categories if they don't exist
      const defaultCategories = [
        { name: 'Technology', slug: 'technology', description: 'Latest technology news and trends' },
        { name: 'Business', slug: 'business', description: 'Business insights and strategies' },
        { name: 'Design', slug: 'design', description: 'Design trends and inspiration' },
        { name: 'Lifestyle', slug: 'lifestyle', description: 'Lifestyle tips and wellness' },
        { name: 'Marketing', slug: 'marketing', description: 'Marketing strategies and tips' }
      ];

      for (const c of defaultCategories) {
        const existing = await db.select().from(schema.categories).where(eq(schema.categories.slug, c.slug)).limit(1);
        if (!existing[0]) {
          const id = randomUUID();
          await db.insert(schema.categories).values({ ...c, id, createdAt: new Date() } as any);
          console.log('Inserted default category:', c.slug);
        }
      }

      // Create admin and author users if missing
      const adminUsername = process.env.TEST_ADMIN_USERNAME || 'testcraftworld';
      const authorUsername = process.env.TEST_AUTHOR_USERNAME || 'author';
      const adminExists = await db.select().from(schema.users).where(eq(schema.users.username, adminUsername)).limit(1);
      if (!adminExists[0]) {
        const id = randomUUID();
        const hashed = await bcrypt.hash(process.env.TEST_ADMIN_PASSWORD || 'admin123', 10);
        await db.insert(schema.users).values({ id, username: adminUsername, password: hashed, email: process.env.TEST_ADMIN_EMAIL || null, role: 'admin', createdAt: new Date() } as any);
        console.log('Inserted default admin user:', adminUsername);
      }

      const authorExists = await db.select().from(schema.users).where(eq(schema.users.username, authorUsername)).limit(1);
      if (!authorExists[0]) {
        const id = randomUUID();
        const hashed = await bcrypt.hash(process.env.TEST_AUTHOR_PASSWORD || 'author123', 10);
        await db.insert(schema.users).values({ id, username: authorUsername, password: hashed, email: process.env.TEST_AUTHOR_EMAIL || null, role: 'author', createdAt: new Date() } as any);
        console.log('Inserted default author user:', authorUsername);
      }
    } catch (seedErr) {
      console.error('Error seeding default categories/users:', seedErr);
    }

  } catch (err) {
    console.error('ensureSchemaAndDefaults failed:', err);
    throw err;
  }
}

async function createTableIfMissing(table: string) {
  // Minimal CREATE TABLE statements matching `shared/schema.ts` definitions.
  switch (table) {
    case 'users':
      await connection.query(`
        CREATE TABLE IF NOT EXISTS users (
          id varchar(36) PRIMARY KEY,
          username varchar(255) NOT NULL UNIQUE,
          password text NOT NULL,
          email varchar(255),
          role varchar(50) DEFAULT 'reader',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB;
      `);
      break;
    case 'categories':
      await connection.query(`
        CREATE TABLE IF NOT EXISTS categories (
          id varchar(36) PRIMARY KEY,
          name varchar(255) NOT NULL UNIQUE,
          slug varchar(255) NOT NULL UNIQUE,
          description text,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB;
      `);
      break;
    case 'posts':
      await connection.query(`
        CREATE TABLE IF NOT EXISTS posts (
          id varchar(36) PRIMARY KEY,
          title varchar(500) NOT NULL,
          slug varchar(255) NOT NULL UNIQUE,
          excerpt text,
          content text NOT NULL,
          featured_image varchar(500),
          author_id varchar(36),
          category_id varchar(36),
          published tinyint(1) DEFAULT 0,
          published_at TIMESTAMP NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (author_id) REFERENCES users(id),
          FOREIGN KEY (category_id) REFERENCES categories(id)
        ) ENGINE=InnoDB;
      `);
      break;
    case 'comments':
      await connection.query(`
        CREATE TABLE IF NOT EXISTS comments (
          id varchar(36) PRIMARY KEY,
          post_id varchar(36),
          author_id varchar(36),
          content text NOT NULL,
          parent_id varchar(36),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (post_id) REFERENCES posts(id),
          FOREIGN KEY (author_id) REFERENCES users(id)
        ) ENGINE=InnoDB;
      `);
      break;
    case 'post_tags':
      await connection.query(`
        CREATE TABLE IF NOT EXISTS post_tags (
          id varchar(36) PRIMARY KEY,
          post_id varchar(36),
          tag varchar(100) NOT NULL,
          FOREIGN KEY (post_id) REFERENCES posts(id)
        ) ENGINE=InnoDB;
      `);
      break;
    case 'api_keys':
      await connection.query(`
        CREATE TABLE IF NOT EXISTS api_keys (
          id varchar(36) PRIMARY KEY,
          user_id varchar(36),
          name varchar(255) NOT NULL,
          key_hash text NOT NULL,
          permissions text,
          expires_at TIMESTAMP NULL,
          last_used_at TIMESTAMP NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          usage_count int DEFAULT 0,
          FOREIGN KEY (user_id) REFERENCES users(id)
        ) ENGINE=InnoDB;
      `);
      break;
    default:
      console.warn('Unknown table requested for creation:', table);
  }
}
