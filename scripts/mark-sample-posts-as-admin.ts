import 'dotenv/config';
import { storage } from '../server/storage';

async function run() {
  try {
    const adminUsername = process.env.TEST_ADMIN_USERNAME || 'testcraftworld';
    const admin = await storage.getUserByUsername(adminUsername);
    if (!admin) {
      console.error('Admin user not found:', adminUsername);
      process.exit(1);
    }

    console.log('Admin found:', admin.username, admin.id);

    // fetch a large set of posts
    const posts = await storage.getPosts(1000, 0);
    console.log(`Found ${posts.length} posts`);

    let updated = 0;
    for (const p of posts) {
      const changes: any = {};
      let need = false;

      if (!p.authorId || p.authorId !== admin.id) {
        changes.authorId = admin.id;
        need = true;
      }

      if (!p.published) {
        changes.published = true;
        need = true;
      }

      if (need) {
        await storage.updatePost(p.id, changes);
        console.log(`Updated post: ${p.title}`);
        updated++;
      }
    }

    console.log(`Done. Updated ${updated} posts.`);
    process.exit(0);
  } catch (err) {
    console.error('Failed:', err);
    process.exit(1);
  }
}

run();
