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

    const [rows]: any = await connection.query("SHOW TABLES LIKE 'source_validation_logs'");
    if (rows && rows.length) {
      console.log('source_validation_logs table already exists');
    } else {
      console.log('Creating source_validation_logs table');
      await connection.query(`
        CREATE TABLE IF NOT EXISTS source_validation_logs (
          id varchar(36) PRIMARY KEY,
          post_id varchar(36),
          ok tinyint(1) DEFAULT 0,
          reason text,
          checked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          checked_by varchar(255)
        ) ENGINE=InnoDB;
      `);
      console.log('Created source_validation_logs table');
    }

    await connection.end();
    process.exit(0);
  }catch(e){
    console.error('Migration failed', e);
    process.exit(1);
  }
})();
