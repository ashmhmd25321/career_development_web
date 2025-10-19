import { readFileSync } from 'fs';
import { join } from 'path';
import { connectDatabase, getConnection } from './connection';
import { logger } from '@/utils/logger';

const runMigrations = async (): Promise<void> => {
  try {
    await connectDatabase();
    const connection = getConnection();
    
    logger.info('🚀 Starting database migrations...');
    
    // Read and execute schema file
    const schemaPath = join(process.cwd(), '..', 'database', 'schema.sql');
    const schema = readFileSync(schemaPath, 'utf8');
    
    // Split schema into individual statements
    const statements = schema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    logger.info(`📝 Found ${statements.length} SQL statements to execute`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        try {
          // Use query instead of execute for non-prepared statements
          await connection.query(statement);
          logger.info(`✅ Executed statement ${i + 1}/${statements.length}`);
        } catch (error: any) {
          // Skip if table already exists or other non-critical errors
          if (error.code === 'ER_TABLE_EXISTS_ERROR' || 
              error.code === 'ER_DB_CREATE_EXISTS' ||
              error.code === 'ER_DUP_KEYNAME' ||
              error.code === 'ER_DUP_ENTRY') {
            logger.warn(`⚠️  Skipped statement ${i + 1}: ${error.message}`);
          } else {
            throw error;
          }
        }
      }
    }
    
    logger.info('🎉 Database migrations completed successfully!');
    
  } catch (error) {
    logger.error('❌ Migration failed:', error);
    throw error;
  }
};

// Run migrations if this file is executed directly
if (require.main === module) {
  runMigrations()
    .then(() => {
      logger.info('✅ Migrations completed');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('❌ Migrations failed:', error);
      process.exit(1);
    });
}

export { runMigrations };
