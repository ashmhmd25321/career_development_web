import mysql from 'mysql2/promise';
import { logger } from '@/utils/logger';

interface DatabaseConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
}

const config: DatabaseConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '12345678',
  database: process.env.DB_NAME || 'career_development'
};

let connection: mysql.Connection;

export const connectDatabase = async (): Promise<void> => {
  try {
    connection = await mysql.createConnection(config);
    
    // Test the connection
    await connection.ping();
    
    logger.info('✅ Database connected successfully');
    logger.info(`📊 Connected to: ${config.database} on ${config.host}:${config.port}`);
  } catch (error) {
    logger.error('❌ Database connection failed:', error);
    throw error;
  }
};

export const getConnection = (): mysql.Connection => {
  if (!connection) {
    throw new Error('Database connection not established. Call connectDatabase() first.');
  }
  return connection;
};

export const closeDatabase = async (): Promise<void> => {
  if (connection) {
    await connection.end();
    logger.info('🔌 Database connection closed');
  }
};

// Graceful shutdown
process.on('SIGINT', async () => {
  await closeDatabase();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await closeDatabase();
  process.exit(0);
});
