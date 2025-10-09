import 'dotenv/config';
import { db } from '../server/db.js';
import { users, apiKeys } from '../shared/schema.js';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';

async function main() {
  try {
    const adminRows = await db.select().from(users).where(eq(users.username, process.env.TEST_ADMIN_USERNAME || 'testcraftworld'));
    if (!adminRows || adminRows.length === 0) {
      console.error('Admin user not found');
      process.exit(1);
    }
    const admin = adminRows[0];

    const secret = `tc_${randomBytes(32).toString('hex')}`;
    const keyHash = await bcrypt.hash(secret, 12);
    const id = randomBytes(16).toString('hex');
    const apiKey = {
      id,
      userId: admin.id,
      name: 'local-admin-key',
      keyHash,
      permissions: JSON.stringify(['queue:read','queue:write','posts:publish']),
      expiresAt: null,
      createdAt: new Date(),
      lastUsedAt: null,
      usageCount: 0,
    } as any;

    await db.insert(apiKeys).values(apiKey);
    console.log('API key created. Secret (store this now, shown only once):');
    console.log(secret);
    process.exit(0);
  } catch (err) {
    console.error('Failed to create API key:', err);
    process.exit(1);
  }
}

main();
