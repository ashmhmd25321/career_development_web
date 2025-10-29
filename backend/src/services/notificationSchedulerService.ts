import { getConnection } from '../database/connection';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { notificationService } from './notificationService';
import { notificationPreferencesService } from './notificationPreferencesService';

export interface ScheduledNotification {
  id: number;
  user_id: number;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  category: 'job' | 'application' | 'event' | 'system' | 'message';
  scheduled_at: Date;
  is_sent: boolean;
  sent_at?: Date;
  related_id?: number;
  created_at: Date;
}

export interface CreateScheduledNotificationData {
  user_id: number;
  title: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  category?: 'job' | 'application' | 'event' | 'system' | 'message';
  scheduled_at: Date;
  related_id?: number;
}

export const notificationSchedulerService = {
  // Schedule a notification
  async scheduleNotification(data: CreateScheduledNotificationData): Promise<ScheduledNotification> {
    const connection = getConnection();
    
    // Validate scheduled_at is in the future
    if (new Date(data.scheduled_at) <= new Date()) {
      throw new Error('Scheduled time must be in the future');
    }
    
    const query = `
      INSERT INTO scheduled_notifications (
        user_id, title, message, type, category, scheduled_at, related_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    const [result] = await connection.execute<ResultSetHeader>(
      query,
      [
        data.user_id,
        data.title,
        data.message,
        data.type || 'info',
        data.category || 'system',
        data.scheduled_at,
        data.related_id || null
      ]
    );
    
    const scheduled = await this.getScheduledNotification(result.insertId);
    if (!scheduled) {
      throw new Error('Failed to retrieve scheduled notification');
    }
    
    return scheduled;
  },

  // Get scheduled notification by ID
  async getScheduledNotification(id: number): Promise<ScheduledNotification | null> {
    const connection = getConnection();
    
    const [rows] = await connection.execute<RowDataPacket[]>(
      'SELECT * FROM scheduled_notifications WHERE id = ?',
      [id]
    );
    
    return rows.length > 0 ? (rows[0] as ScheduledNotification) : null;
  },

  // Get user's scheduled notifications
  async getUserScheduledNotifications(userId: number): Promise<ScheduledNotification[]> {
    const connection = getConnection();
    
    const [rows] = await connection.execute<RowDataPacket[]>(
      `SELECT * FROM scheduled_notifications 
       WHERE user_id = ? 
       ORDER BY scheduled_at ASC`,
      [userId]
    );
    
    return rows.map(row => ({ ...row } as ScheduledNotification));
  },

  // Get all pending notifications (for cron job)
  async getPendingNotifications(): Promise<ScheduledNotification[]> {
    const connection = getConnection();
    
    const now = new Date();
    
    const [rows] = await connection.execute<RowDataPacket[]>(
      `SELECT * FROM scheduled_notifications 
       WHERE is_sent = FALSE 
       AND scheduled_at <= ? 
       ORDER BY scheduled_at ASC`,
      [now]
    );
    
    return rows.map(row => ({ ...row } as ScheduledNotification));
  },

  // Process and send scheduled notifications
  async processScheduledNotifications(): Promise<number> {
    const pending = await this.getPendingNotifications();
    let sentCount = 0;
    
    for (const scheduled of pending) {
      try {
        // Check user preferences before sending
        const shouldSend = await notificationPreferencesService.shouldSendNotification(
          scheduled.user_id,
          scheduled.type,
          scheduled.category,
          'in_app'
        );
        
        if (shouldSend) {
          // Create actual notification
          await notificationService.createNotification({
            user_id: scheduled.user_id,
            title: scheduled.title,
            message: scheduled.message,
            type: scheduled.type,
            category: scheduled.category,
            related_id: scheduled.related_id
          });
        }
        
        // Mark as sent
        await this.markAsSent(scheduled.id);
        sentCount++;
      } catch (error) {
        console.error(`Error processing scheduled notification ${scheduled.id}:`, error);
        // Continue with next notification even if one fails
      }
    }
    
    return sentCount;
  },

  // Mark notification as sent
  async markAsSent(id: number): Promise<void> {
    const connection = getConnection();
    
    await connection.execute(
      `UPDATE scheduled_notifications 
       SET is_sent = TRUE, sent_at = NOW() 
       WHERE id = ?`,
      [id]
    );
  },

  // Delete scheduled notification
  async deleteScheduledNotification(id: number, userId?: number): Promise<void> {
    const connection = getConnection();
    
    if (userId) {
      // Only allow deleting own notifications unless admin
      await connection.execute(
        'DELETE FROM scheduled_notifications WHERE id = ? AND user_id = ?',
        [id, userId]
      );
    } else {
      await connection.execute(
        'DELETE FROM scheduled_notifications WHERE id = ?',
        [id]
      );
    }
  },

  // Update scheduled notification
  async updateScheduledNotification(
    id: number,
    userId: number,
    updates: Partial<CreateScheduledNotificationData>
  ): Promise<ScheduledNotification> {
    const connection = getConnection();
    
    // Verify ownership
    const existing = await this.getScheduledNotification(id);
    if (!existing) {
      throw new Error('Scheduled notification not found');
    }
    
    if (existing.user_id !== userId) {
      throw new Error('You can only update your own scheduled notifications');
    }
    
    // Can only update if not sent
    if (existing.is_sent) {
      throw new Error('Cannot update a notification that has already been sent');
    }
    
    const updateFields: string[] = [];
    const values: any[] = [];
    
    if (updates.title !== undefined) {
      updateFields.push('title = ?');
      values.push(updates.title);
    }
    if (updates.message !== undefined) {
      updateFields.push('message = ?');
      values.push(updates.message);
    }
    if (updates.type !== undefined) {
      updateFields.push('type = ?');
      values.push(updates.type);
    }
    if (updates.category !== undefined) {
      updateFields.push('category = ?');
      values.push(updates.category);
    }
    if (updates.scheduled_at !== undefined) {
      // Validate it's in the future
      if (new Date(updates.scheduled_at) <= new Date()) {
        throw new Error('Scheduled time must be in the future');
      }
      updateFields.push('scheduled_at = ?');
      values.push(updates.scheduled_at);
    }
    if (updates.related_id !== undefined) {
      updateFields.push('related_id = ?');
      values.push(updates.related_id);
    }
    
    if (updateFields.length === 0) {
      return existing;
    }
    
    values.push(id);
    
    await connection.execute(
      `UPDATE scheduled_notifications SET ${updateFields.join(', ')} WHERE id = ?`,
      values
    );
    
    const updated = await this.getScheduledNotification(id);
    if (!updated) {
      throw new Error('Failed to retrieve updated notification');
    }
    
    return updated;
  }
};

