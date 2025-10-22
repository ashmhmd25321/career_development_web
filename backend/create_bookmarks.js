import { getConnection } from './src/database/connection';

async function createBookmarksTable() {
  try {
    const connection = getConnection();
    
    const sql = `
      CREATE TABLE IF NOT EXISTS job_bookmarks (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        job_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
        UNIQUE KEY unique_bookmark (user_id, job_id),
        INDEX idx_user (user_id),
        INDEX idx_job (job_id),
        INDEX idx_created_at (created_at)
      )
    `;
    
    await connection.query(sql);
    console.log('✅ job_bookmarks table created successfully');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating bookmarks table:', error);
    process.exit(1);
  }
}

createBookmarksTable();
