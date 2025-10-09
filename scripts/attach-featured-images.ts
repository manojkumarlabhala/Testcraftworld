import dotenv from 'dotenv';
dotenv.config();

import { storage } from '../server/storage';

function unsplashSource(query: string) {
  const encoded = encodeURIComponent(query);
  return `https://source.unsplash.com/featured/?${encoded}`;
}

function guessQueryForPost(post: any) {
  // Prefer category, then title keywords
  if (post.categoryId && typeof post.categoryId === 'string') {
    return post.categoryId.replace(/[-_]/g, ' ');
  }
    if (post.title && typeof post.title === 'string') {
      // Take first 4 significant words
      const words = post.title.split(/\s+/).filter((w: string) => w.length > 3).slice(0, 4);
    if (words.length) return words.join(' ');
  }
  return 'news';
}

async function run() {
  try {
    console.log('Attaching featured images to posts missing images...');
    const all = await storage.getPosts(1000, 0);
    let count = 0;
    for (const post of all) {
      if (post.featuredImage) continue;
      const query = guessQueryForPost(post);
      const url = unsplashSource(query);
      await storage.updatePost(post.id, { featuredImage: url } as any);
      console.log('Updated', post.slug, '->', url);
      count++;
    }
    console.log(`Attached images to ${count} posts`);
  } catch (err) {
    console.error('Failed to attach images:', err);
  }
}

run();
