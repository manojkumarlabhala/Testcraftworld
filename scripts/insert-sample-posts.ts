import { createSamplePosts } from '../server/createSamplePosts';

async function run() {
  try {
    await createSamplePosts();
    console.log('Insert script finished successfully');
    process.exit(0);
  } catch (err) {
    console.error('Insert script failed:', err);
    process.exit(1);
  }
}

run();