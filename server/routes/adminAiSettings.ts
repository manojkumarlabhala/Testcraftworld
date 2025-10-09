import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import { db } from '../db';
import * as schema from '@shared/schema';

const router = Router();
const SETTINGS_PATH = path.join(process.cwd(), '.ai_settings.json');

function readSettingsFileFallback() {
  try {
    if (!fs.existsSync(SETTINGS_PATH)) return {};
    const raw = fs.readFileSync(SETTINGS_PATH, 'utf8');
    return JSON.parse(raw || '{}');
  } catch (e) {
    return {};
  }
}

async function readSettingsDb() {
  try {
    const rows = await db.select().from(schema.aiSettings);
    const out: Record<string, any> = {};
    for (const r of rows) {
      try { out[r.key] = JSON.parse((r as any).value); } catch (e) { out[r.key] = (r as any).value; }
    }
    return out;
  } catch (e) {
    return null;
  }
}

async function writeSettingsDb(obj: any) {
  try {
    // Upsert each key
    for (const k of Object.keys(obj)) {
      const val = typeof obj[k] === 'string' ? obj[k] : JSON.stringify(obj[k]);
      // MySQL upsert via ON DUPLICATE KEY UPDATE
      await db.insert(schema.aiSettings).values({ key: k, value: val } as any).onDuplicateKeyUpdate({ value: val } as any);
    }
    return true;
  } catch (e) {
    console.error('Failed to write settings to DB', e);
    return false;
  }
}

router.get('/settings', async (req, res) => {
  try {
    const fromDb = await readSettingsDb();
    if (fromDb) return res.json(fromDb);
    const s = readSettingsFileFallback();
    res.json(s);
  } catch (e) {
    res.status(500).json({ error: 'failed to read settings' });
  }
});

router.post('/settings', async (req, res) => {
  try {
    const payload = req.body || {};
    const ok = await writeSettingsDb(payload);
    if (!ok) {
      // fallback to file write
      try {
        fs.writeFileSync(SETTINGS_PATH, JSON.stringify(payload, null, 2), 'utf8');
        return res.json({ ok: true, fallback: true });
      } catch (e) {
        return res.status(500).json({ error: 'failed to save settings' });
      }
    }
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

export default router;
