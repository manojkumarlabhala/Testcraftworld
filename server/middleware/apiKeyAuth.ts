import { Request, Response, NextFunction } from 'express';
import { validateAPIKey } from '../services/apiKeyService.js';

export interface AuthenticatedRequest extends Request {
  apiKey?: any;
  user?: any;
}

export async function apiKeyAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid authorization header' });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    const validation = await validateAPIKey(token);

    if (!validation.isValid) {
      return res.status(401).json({ error: 'Invalid or expired API key' });
    }

    // Attach API key and user info to request
    req.apiKey = validation.apiKey;
    req.user = validation.user;

    next();
  } catch (error) {
    console.error('API key authentication error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
}

export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}