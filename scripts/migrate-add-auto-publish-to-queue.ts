import 'dotenv/config';
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

    const [rows]: any = await connection.query("SHOW COLUMNS FROM auto_posts_queue LIKE 'auto_publish'");
    if (rows && rows.length) {
      console.log('auto_publish column already exists on auto_posts_queue');
    } else {
      console.log('Adding auto_publish column to auto_posts_queue');
      await connection.query(`ALTER TABLE auto_posts_queue ADD COLUMN auto_publish tinyint(1) DEFAULT 0`);
      console.log('Added auto_publish column');
    }

    await connection.end();
    process.exit(0);
  }catch(e){
    console.error('Migration failed', e);
    process.exit(1);
  }
})();
