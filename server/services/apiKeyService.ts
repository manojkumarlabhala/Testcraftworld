import { randomBytes } from 'crypto';
import bcrypt from 'bcryptjs';
import { eq, and, lt } from 'drizzle-orm';
import { db } from '../db.js';
import { apiKeys, users } from '../../shared/schema.js';
import type { InsertApiKey, ApiKey } from '../../shared/schema.js';

export interface CreateApiKeyRequest {
  userId: string;
  name: string;
  permissions?: string[];
  expiresInDays?: number;
}

export interface ApiKeyWithSecret extends Omit<ApiKey, 'keyHash'> {
  secret: string;
}

export async function generateAPIKey(request: CreateApiKeyRequest): Promise<ApiKeyWithSecret> {
  // Generate a secure random API key
  const secret = `tc_${randomBytes(32).toString('hex')}`;

  // Hash the key for storage
  const keyHash = await bcrypt.hash(secret, 12);

  // Calculate expiration date
  const expiresAt = request.expiresInDays
    ? new Date(Date.now() + request.expiresInDays * 24 * 60 * 60 * 1000)
    : null;

  // Store in database
  const permissionsJson = request.permissions ? JSON.stringify(request.permissions) : null;
  const id = randomBytes(16).toString('hex');

  const apiKeyData = {
    id,
    userId: request.userId,
    name: request.name,
    keyHash,
    permissions: permissionsJson,
    expiresAt,
  };

  await db.insert(apiKeys).values(apiKeyData);
  const result = await db.select().from(apiKeys).where(eq(apiKeys.id, id)).limit(1);

  if (!result[0]) {
    throw new Error('Failed to create API key');
  }

  return {
    ...result[0],
    secret,
  };
}

export async function validateAPIKey(secret: string): Promise<{ isValid: boolean; apiKey?: ApiKey; user?: any }> {
  // Find API key by hash comparison
  const allKeys = await db.select().from(apiKeys);

  for (const key of allKeys) {
    const isMatch = await bcrypt.compare(secret, key.keyHash);
    if (isMatch) {
      // Check if expired
      if (key.expiresAt && new Date() > key.expiresAt) {
        return { isValid: false };
      }

      // Get user info
      const user = await db.select().from(users).where(eq(users.id, key.userId)).limit(1);

      // Update last used and usage count
      const updateFields: any = {
        lastUsedAt: new Date(),
        usageCount: (key.usageCount || 0) + 1,
      };
      await db.update(apiKeys)
        .set(updateFields)
        .where(eq(apiKeys.id, key.id));

      return {
        isValid: true,
        apiKey: key,
        user: user[0],
      };
    }
  }

  return { isValid: false };
}

export async function listAPIKeys(userId: string): Promise<ApiKey[]> {
  return await db.select().from(apiKeys).where(eq(apiKeys.userId, userId));
}

export async function revokeAPIKey(userId: string, keyId: string): Promise<boolean> {
  await db.delete(apiKeys)
    .where(and(eq(apiKeys.id, keyId), eq(apiKeys.userId, userId)));
  return true;
}

export async function cleanupExpiredKeys(): Promise<number> {
  await db.delete(apiKeys)
    .where(lt(apiKeys.expiresAt, new Date()));
  return 0; // MySQL doesn't return affected rows in the same way
}