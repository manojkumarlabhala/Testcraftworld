import { Router } from 'express';
import { generateAPIKey, listAPIKeys, revokeAPIKey } from '../services/apiKeyService.js';
import { apiKeyAuth, requireAdmin, AuthenticatedRequest } from '../middleware/apiKeyAuth.js';

const router = Router();

// Apply authentication middleware to all routes
router.use(apiKeyAuth);
router.use(requireAdmin);

router.post('/generate-api-key', async (req: AuthenticatedRequest, res) => {
  try {
    const { name, permissions, expiresInDays } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'API key name is required' });
    }

    if (!req.user?.id) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const apiKey = await generateAPIKey({
      userId: req.user.id,
      name,
      permissions,
      expiresInDays,
    });

    res.json({
      id: apiKey.id,
      name: apiKey.name,
      secret: apiKey.secret, // Only shown once
      permissions: apiKey.permissions,
      expiresAt: apiKey.expiresAt,
      createdAt: apiKey.createdAt,
    });
  } catch (error) {
    console.error('Generate API key error:', error);
    res.status(500).json({ error: 'Failed to generate API key' });
  }
});

router.get('/api-keys', async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const apiKeys = await listAPIKeys(req.user.id);

    // Don't return the hash, just metadata
    const sanitizedKeys = apiKeys.map(key => ({
      id: key.id,
      name: key.name,
      permissions: key.permissions,
      expiresAt: key.expiresAt,
      lastUsedAt: key.lastUsedAt,
      createdAt: key.createdAt,
      usageCount: key.usageCount,
    }));

    res.json({ apiKeys: sanitizedKeys });
  } catch (error) {
    console.error('List API keys error:', error);
    res.status(500).json({ error: 'Failed to retrieve API keys' });
  }
});

router.delete('/api-keys/:id', async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;

    if (!req.user?.id) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const success = await revokeAPIKey(req.user.id, id);

    if (!success) {
      return res.status(404).json({ error: 'API key not found or already revoked' });
    }

    res.json({ message: 'API key revoked successfully' });
  } catch (error) {
    console.error('Revoke API key error:', error);
    res.status(500).json({ error: 'Failed to revoke API key' });
  }
});

export default router;