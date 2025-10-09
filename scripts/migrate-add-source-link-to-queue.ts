import 'dotenv/config';
import mysql from 'mysql2/promise';

(async function(){
  try{
    const url = new URL(process.env.DATABASE_URL as string);
    const sslOption = process.env.DATABASE_SSL_BYPASS === 'true' ? undefined : { rejectUnauthorized: false };
    const connection = await mysql.createConnection({
      host: url.hostname,
      port: parseInt(url.port || '3306', 10),
      user: url.username,
      password: url.password,
      database: url.pathname.slice(1),
      ssl: sslOption as any
    });

    const [rows]: any = await connection.query("SHOW COLUMNS FROM auto_posts_queue LIKE 'source_link'");
    if (rows && rows.length) {
      console.log('source_link column already exists on auto_posts_queue');
    } else {
      console.log('Adding source_link column to auto_posts_queue');
      await connection.query(`ALTER TABLE auto_posts_queue ADD COLUMN source_link varchar(1000) NULL`);
      console.log('Added source_link column to auto_posts_queue');
    }

    await connection.end();
    process.exit(0);
  }catch(e){
    console.error('Migration failed', e);
    process.exit(1);
  }
})();
