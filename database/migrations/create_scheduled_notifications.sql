-- Scheduled Notifications Table
CREATE TABLE IF NOT EXISTS scheduled_notifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('info', 'success', 'warning', 'error') DEFAULT 'info',
    category ENUM('job', 'application', 'event', 'system', 'message') DEFAULT 'system',
    scheduled_at TIMESTAMP NOT NULL,
    is_sent BOOLEAN DEFAULT FALSE,
    sent_at TIMESTAMP NULL,
    related_id INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_scheduled_at (scheduled_at),
    INDEX idx_sent (is_sent),
    INDEX idx_pending (is_sent, scheduled_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

