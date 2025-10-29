-- Reports table
CREATE TABLE IF NOT EXISTS reports (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  report_type VARCHAR(50) NOT NULL COMMENT 'user_analytics, job_analytics, application_analytics, engagement_analytics, custom',
  report_name VARCHAR(255) NOT NULL,
  description TEXT,
  report_config JSON NOT NULL COMMENT 'Report configuration with filters, fields, format, etc.',
  format VARCHAR(20) NOT NULL DEFAULT 'csv' COMMENT 'csv, pdf, excel, json',
  status VARCHAR(20) NOT NULL DEFAULT 'pending' COMMENT 'pending, generating, completed, failed',
  file_path VARCHAR(500),
  file_size INT COMMENT 'File size in bytes',
  expires_at DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_report_type (report_type),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Scheduled reports table
CREATE TABLE IF NOT EXISTS scheduled_reports (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  report_template_id INT,
  report_name VARCHAR(255) NOT NULL,
  report_type VARCHAR(50) NOT NULL,
  report_config JSON NOT NULL,
  schedule_type VARCHAR(20) NOT NULL COMMENT 'daily, weekly, monthly, custom',
  schedule_config JSON COMMENT 'For custom schedules: cron expression, etc.',
  format VARCHAR(20) NOT NULL DEFAULT 'csv',
  recipients JSON COMMENT 'Array of email addresses to send reports to',
  is_active BOOLEAN DEFAULT TRUE,
  last_run_at DATETIME,
  next_run_at DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (report_template_id) REFERENCES reports(id) ON DELETE SET NULL,
  INDEX idx_user_id (user_id),
  INDEX idx_is_active (is_active),
  INDEX idx_next_run_at (next_run_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Report shares table
CREATE TABLE IF NOT EXISTS report_shares (
  id INT PRIMARY KEY AUTO_INCREMENT,
  report_id INT NOT NULL,
  shared_by_user_id INT NOT NULL,
  shared_with_user_id INT COMMENT 'NULL for public share',
  share_token VARCHAR(100) UNIQUE NOT NULL COMMENT 'Unique token for shared access',
  access_level VARCHAR(20) NOT NULL DEFAULT 'view' COMMENT 'view, download',
  expires_at DATETIME,
  is_active BOOLEAN DEFAULT TRUE,
  view_count INT DEFAULT 0,
  download_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE,
  FOREIGN KEY (shared_by_user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (shared_with_user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_report_id (report_id),
  INDEX idx_share_token (share_token),
  INDEX idx_shared_by_user_id (shared_by_user_id),
  INDEX idx_shared_with_user_id (shared_with_user_id),
  INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Report analytics table
CREATE TABLE IF NOT EXISTS report_analytics (
  id INT PRIMARY KEY AUTO_INCREMENT,
  report_id INT NOT NULL,
  user_id INT COMMENT 'NULL for anonymous views',
  action_type VARCHAR(20) NOT NULL COMMENT 'viewed, downloaded, shared',
  metadata JSON COMMENT 'Additional metadata about the action',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_report_id (report_id),
  INDEX idx_user_id (user_id),
  INDEX idx_action_type (action_type),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

