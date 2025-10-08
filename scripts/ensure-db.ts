import 'dotenv/config';
import { ensureSchemaAndDefaults } from '../server/db';

(async () => {
  try {
    console.log('Running ensureSchemaAndDefaults...');
    await ensureSchemaAndDefaults();
    console.log('ensureSchemaAndDefaults completed successfully');
    process.exit(0);
  } catch (err) {
    console.error('ensureSchemaAndDefaults failed:', err);
    process.exit(1);
  }
})();
