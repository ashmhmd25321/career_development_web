import mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env' });

async function fixAvatarColumn() {
  let connection;
  try {
    console.log('🔧 Connecting to database...');
    
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'career_development',
    });
    
    console.log('🔧 Modifying avatar_url column to MEDIUMTEXT...');
    
    // Modify the column to MEDIUMTEXT
    await connection.query(
      `ALTER TABLE users 
       MODIFY COLUMN avatar_url MEDIUMTEXT NULL`
    );
    
    console.log('✅ avatar_url column modified successfully');
    await connection.end();
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error modifying avatar_url column:', error.message);
    if (connection) {
      await connection.end();
    }
    process.exit(1);
  }
}

fixAvatarColumn();

