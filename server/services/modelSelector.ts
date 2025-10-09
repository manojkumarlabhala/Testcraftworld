import { GoogleGenerativeAI } from '@google/generative-ai';
import { db } from '../db';
import * as schema from '@shared/schema';

// Lightweight model selector that probes a short list of candidate models
// and returns the first one that successfully responds to a tiny probe request.
// The selected model is cached in-memory for the process lifetime.

const apiKey = process.env.GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(apiKey);

let cachedModel: string | null = null;

// Default ordered candidate list prefers smaller/cheaper models first.
// Admins can override with GEMINI_PREFERRED_MODELS (comma-separated, highest priority first).
const DEFAULT_CANDIDATES = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-2.5-pro', 'gemini-pro'];

function parseCandidates(): string[] {
  const env = process.env.GEMINI_PREFERRED_MODELS;
  if (!env) return DEFAULT_CANDIDATES;
  return env.split(',').map(s => s.trim()).filter(Boolean);
}

async function probeModel(modelName: string, timeoutMs = 5000): Promise<boolean> {
  try {
    // The SDK may throw on unsupported model; attempt a tiny generateContent probe
    const model = genAI.getGenerativeModel({ model: modelName });
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: 'Ping' }] }],
        generationConfig: { maxOutputTokens: 4, temperature: 0 },
        signal: (controller as any).signal,
      } as any);
      // If we got a response object, model is usable
      if (result && result.response) {
        clearTimeout(id);
        return true;
      }
    } finally {
      clearTimeout(id);
    }
  } catch (err: any) {
    // Treat any error as probe failure; upstream will log diagnostic
    return false;
  }
  return false;
}

export async function getBestModel(): Promise<string> {
  if (cachedModel) return cachedModel;
  const candidates = parseCandidates();
  for (const m of candidates) {
    try {
      const ok = await probeModel(m);
      if (ok) {
        cachedModel = m;
        console.log('modelSelector: selected model', m);
        return m;
      }
    } catch (err) {
      // swallow and try next
      console.warn('modelSelector: probe failed for', m, err?.message || err);
    }
  }
  // Fallback to first candidate if none succeeded; let aiService handle errors
  cachedModel = candidates[0] || DEFAULT_CANDIDATES[0];
  console.warn('modelSelector: no model probe succeeded; using fallback', cachedModel);
  return cachedModel;
}

export function clearModelCache() {
  cachedModel = null;
}

export default { getBestModel, clearModelCache, getModelForTopic };

// Determine a model for a given topic using env mapping or heuristics.
export async function getModelForTopic(topic: string): Promise<string> {
  // Allow an environment-provided mapping JSON like: {"entrance":"gemini-2.5-pro","default":"gemini-1.5-flash"}
  try {
    const raw = process.env.GEMINI_PRIORITY_MODELS;
    // If not set in env, try to read from DB ai_settings table
    let effectiveRaw: string | undefined = raw;
    if (!effectiveRaw) {
      try {
        const rows = await db.select().from(schema.aiSettings);
        for (const r of rows) {
          if ((r as any).key === 'GEMINI_PRIORITY_MODELS') {
            effectiveRaw = (r as any).value;
            break;
          }
        }
      } catch (e) {
        // ignore DB read errors and fall back to env/file
      }
    }
    const useRaw = effectiveRaw || raw;
    if (useRaw) {
      try {
        const map = JSON.parse(useRaw);
        // Check for any key that appears in topic (case-insensitive)
        const lower = (topic || '').toLowerCase();
        for (const k of Object.keys(map)) {
          if (k === 'default') continue;
          if (lower.includes(k.toLowerCase())) return map[k];
        }
        if (map.default) return map.default;
      } catch (e) {
        // not JSON, try CSV style key:model pairs
        const parts = (useRaw || '').split(',').map(s => s.trim()).filter(Boolean);
        for (const p of parts) {
          const [k, v] = p.split(':').map(x => x.trim());
          if (!k || !v) continue;
          if (k.toLowerCase() === 'default') return v;
          if ((topic || '').toLowerCase().includes(k.toLowerCase())) return v;
        }
      }
    }
  } catch (e) {}

  // Default heuristics: news-like or entrance/job topics get high-quality model
  if (/\b(entrance|exam|result|results|job|hiring|recruitment|sarkari|sarkari naukri)\b/i.test(topic)) {
    return 'gemini-2.5-pro';
  }

  // Otherwise prefer a cost-effective model
  return (await getBestModel()) || 'gemini-1.5-flash';
}
