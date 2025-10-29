import { getConnection } from '../database/connection';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export interface Notification {
  id: number;
  user_id: number;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  category: 'job' | 'application' | 'event' | 'system' | 'message';
  is_read: boolean;
  related_id?: number;
  created_at: Date;
  read_at?: Date;
}

export interface CreateNotificationData {
  user_id: number;
  title: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  category?: 'job' | 'application' | 'event' | 'system' | 'message';
  related_id?: number;
}

export const notificationService = {
  // Get user notifications
  async getNotifications(userId: number): Promise<Notification[]> {
    const connection = getConnection();
    
    const [rows] = await connection.execute<RowDataPacket[]>(
      `SELECT * FROM notifications 
       WHERE user_id = ? 
       ORDER BY created_at DESC 
       LIMIT 50`,
      [userId]
    );
    
    return rows.map(row => ({ ...row } as Notification));
  },

  // Get unread notifications count
  async getUnreadCount(userId: number): Promise<number> {
    const connection = getConnection();
    
    const [rows] = await connection.execute<RowDataPacket[]>(
      'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = FALSE',
      [userId]
    );
    
    return rows[0]?.count || 0;
  },

  // Get notification by ID
  async getNotificationById(notificationId: number): Promise<Notification | null> {
    const connection = getConnection();
    
    const [rows] = await connection.execute<RowDataPacket[]>(
      'SELECT * FROM notifications WHERE id = ?',
      [notificationId]
    );
    
    return rows.length > 0 ? ({ ...rows[0] } as Notification) : null;
  },

  // Create notification
  async createNotification(notificationData: CreateNotificationData): Promise<Notification> {
    const connection = getConnection();
    
    const query = `
      INSERT INTO notifications (
        user_id, title, message, type, category, related_id
      ) VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    const [result] = await connection.execute<ResultSetHeader>(
      query,
      [
        notificationData.user_id,
        notificationData.title,
        notificationData.message,
        notificationData.type || 'info',
        notificationData.category || 'system',
        notificationData.related_id || null
      ]
    );
    
    const notification = await this.getNotificationById(result.insertId);
    if (!notification) {
      throw new Error('Failed to retrieve created notification');
    }
    
    return { ...notification };
  },

  // Mark notification as read
  async markAsRead(notificationId: number, userId: number): Promise<void> {
    const connection = getConnection();
    
    await connection.execute(
      `UPDATE notifications 
       SET is_read = TRUE, read_at = NOW() 
       WHERE id = ? AND user_id = ?`,
      [notificationId, userId]
    );
  },

  // Mark all notifications as read
  async markAllAsRead(userId: number): Promise<void> {
    const connection = getConnection();
    
    await connection.execute(
      `UPDATE notifications 
       SET is_read = TRUE, read_at = NOW() 
       WHERE user_id = ? AND is_read = FALSE`,
      [userId]
    );
  },

  // Delete notification
  async deleteNotification(notificationId: number, userId: number): Promise<void> {
    const connection = getConnection();
    
    await connection.execute(
      'DELETE FROM notifications WHERE id = ? AND user_id = ?',
      [notificationId, userId]
    );
  },

  // Delete all notifications
  async deleteAllNotifications(userId: number): Promise<void> {
    const connection = getConnection();
    
    await connection.execute(
      'DELETE FROM notifications WHERE user_id = ?',
      [userId]
    );
  }
};

