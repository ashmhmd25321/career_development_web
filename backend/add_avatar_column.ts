import mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env' });

async function addAvatarColumn() {
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
    
    console.log('🔧 Checking if avatar_url column exists...');
    
    // Check if column already exists
    const [columns]: any = await connection.query(
      `SELECT COLUMN_NAME 
       FROM INFORMATION_SCHEMA.COLUMNS 
       WHERE TABLE_SCHEMA = DATABASE() 
       AND TABLE_NAME = 'users' 
       AND COLUMN_NAME = 'avatar_url'`
    );
    
    if (Array.isArray(columns) && columns.length > 0) {
      console.log('✅ avatar_url column already exists');
      await connection.end();
      process.exit(0);
      return;
    }
    
    console.log('🔧 Adding avatar_url column to users table...');
    
    // Add the column
    await connection.query(
      `ALTER TABLE users 
       ADD COLUMN avatar_url MEDIUMTEXT NULL 
       AFTER location`
    );
    
    console.log('✅ avatar_url column added successfully');
    await connection.end();
    process.exit(0);
  } catch (error: any) {
    if (error.code === 'ER_DUP_FIELDNAME') {
      console.log('✅ avatar_url column already exists');
    } else {
      console.error('❌ Error adding avatar_url column:', error.message);
    }
    if (connection) {
      await connection.end();
    }
    process.exit(1);
  }
}

addAvatarColumn();

