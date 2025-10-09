import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import { randomUUID } from 'crypto';

const CACHE_DIR = path.join(process.cwd(), 'public', 'unsplash-cache');
if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });

export async function fetchUnsplashImage(query: string) {
  // If UNSPLASH_ACCESS_KEY provided use official API search, else fallback to source.unsplash
  const key = process.env.UNSPLASH_ACCESS_KEY;
  const safeQuery = encodeURIComponent(query);
  if (!key) {
    // return the source URL (no caching because it returns redirect)
    return `https://source.unsplash.com/featured/?${safeQuery}`;
  }

  // Use search API
  const searchUrl = `https://api.unsplash.com/search/photos?query=${safeQuery}&per_page=1&orientation=landscape`;
  const res = await fetch(searchUrl, { headers: { Authorization: `Client-ID ${key}` } });
  if (!res.ok) {
    throw new Error(`Unsplash search failed: ${res.status}`);
  }
  const data = await res.json();
  const first = data.results && data.results[0];
  if (!first) throw new Error('No image found');

  const imgUrl = first.urls?.regular || first.urls?.full || first.urls?.raw;
  // cache image locally
  const id = randomUUID();
  const ext = '.jpg';
  const dest = path.join(CACHE_DIR, id + ext);
  const imgRes = await fetch(imgUrl);
  if (!imgRes.ok) throw new Error('Failed to fetch image');
  const buffer = await imgRes.arrayBuffer();
  fs.writeFileSync(dest, Buffer.from(buffer));
  return `/unsplash-cache/${id + ext}`;
}
