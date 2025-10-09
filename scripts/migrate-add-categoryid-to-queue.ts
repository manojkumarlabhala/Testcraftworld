import 'dotenv/config';
import { db } from '../server/db';
import mysql from 'mysql2/promise';

(async function(){
  try{
    const url = new URL(process.env.DATABASE_URL as string);
    // compute ssl option to satisfy mysql2 types
    const sslOption = process.env.DATABASE_SSL_BYPASS === 'true' ? undefined : { rejectUnauthorized: false };
    const connection = await mysql.createConnection({
      host: url.hostname,
      port: parseInt(url.port || '3306', 10),
      user: url.username,
      password: url.password,
      database: url.pathname.slice(1),
      // cast to any because mysql2 types accept different ssl shapes depending on environment
      ssl: sslOption as any
    });

    const [rows]: any = await connection.query("SHOW COLUMNS FROM auto_posts_queue LIKE 'category_id'");
    if (rows && rows.length) {
      console.log('category_id column already exists on auto_posts_queue');
    } else {
      console.log('Adding category_id column to auto_posts_queue');
      await connection.query(`ALTER TABLE auto_posts_queue ADD COLUMN category_id varchar(36) NULL`);
      console.log('Added category_id column');
    }

    await connection.end();
    process.exit(0);
  }catch(e){
    console.error('Migration failed', e);
    process.exit(1);
  }
})();
