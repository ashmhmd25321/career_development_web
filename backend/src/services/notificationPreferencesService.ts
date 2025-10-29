import { getConnection } from '../database/connection';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export interface NotificationPreferences {
  id: number;
  user_id: number;
  email_enabled: boolean;
  push_enabled: boolean;
  in_app_enabled: boolean;
  job_notifications: boolean;
  application_notifications: boolean;
  event_notifications: boolean;
  system_notifications: boolean;
  message_notifications: boolean;
  info_notifications: boolean;
  success_notifications: boolean;
  warning_notifications: boolean;
  error_notifications: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface UpdatePreferencesData {
  email_enabled?: boolean;
  push_enabled?: boolean;
  in_app_enabled?: boolean;
  job_notifications?: boolean;
  application_notifications?: boolean;
  event_notifications?: boolean;
  system_notifications?: boolean;
  message_notifications?: boolean;
  info_notifications?: boolean;
  success_notifications?: boolean;
  warning_notifications?: boolean;
  error_notifications?: boolean;
}

const toCamelCase = (row: any): NotificationPreferences => {
  return {
    id: row.id,
    user_id: row.user_id,
    email_enabled: row.email_enabled === 1 || row.email_enabled === true,
    push_enabled: row.push_enabled === 1 || row.push_enabled === true,
    in_app_enabled: row.in_app_enabled === 1 || row.in_app_enabled === true,
    job_notifications: row.job_notifications === 1 || row.job_notifications === true,
    application_notifications: row.application_notifications === 1 || row.application_notifications === true,
    event_notifications: row.event_notifications === 1 || row.event_notifications === true,
    system_notifications: row.system_notifications === 1 || row.system_notifications === true,
    message_notifications: row.message_notifications === 1 || row.message_notifications === true,
    info_notifications: row.info_notifications === 1 || row.info_notifications === true,
    success_notifications: row.success_notifications === 1 || row.success_notifications === true,
    warning_notifications: row.warning_notifications === 1 || row.warning_notifications === true,
    error_notifications: row.error_notifications === 1 || row.error_notifications === true,
    created_at: row.created_at,
    updated_at: row.updated_at
  };
};

export const notificationPreferencesService = {
  // Get user preferences (create default if doesn't exist)
  async getUserPreferences(userId: number): Promise<NotificationPreferences> {
    const connection = getConnection();
    
    const [rows] = await connection.execute<RowDataPacket[]>(
      'SELECT * FROM notification_preferences WHERE user_id = ?',
      [userId]
    );
    
    if (rows.length > 0) {
      return toCamelCase(rows[0]);
    }
    
    // Create default preferences if doesn't exist
    return await this.createDefaultPreferences(userId);
  },

  // Create default preferences
  async createDefaultPreferences(userId: number): Promise<NotificationPreferences> {
    const connection = getConnection();
    
    await connection.execute(
      `INSERT INTO notification_preferences (
        user_id,
        email_enabled, push_enabled, in_app_enabled,
        job_notifications, application_notifications, event_notifications,
        system_notifications, message_notifications,
        info_notifications, success_notifications, warning_notifications, error_notifications
      ) VALUES (?, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE)`,
      [userId]
    );
    
    const [rows] = await connection.execute<RowDataPacket[]>(
      'SELECT * FROM notification_preferences WHERE user_id = ?',
      [userId]
    );
    
    return toCamelCase(rows[0]);
  },

  // Update preferences
  async updatePreferences(userId: number, preferences: UpdatePreferencesData): Promise<NotificationPreferences> {
    const connection = getConnection();
    
    const updates: string[] = [];
    const values: any[] = [];
    
    if (preferences.email_enabled !== undefined) {
      updates.push('email_enabled = ?');
      values.push(preferences.email_enabled);
    }
    if (preferences.push_enabled !== undefined) {
      updates.push('push_enabled = ?');
      values.push(preferences.push_enabled);
    }
    if (preferences.in_app_enabled !== undefined) {
      updates.push('in_app_enabled = ?');
      values.push(preferences.in_app_enabled);
    }
    if (preferences.job_notifications !== undefined) {
      updates.push('job_notifications = ?');
      values.push(preferences.job_notifications);
    }
    if (preferences.application_notifications !== undefined) {
      updates.push('application_notifications = ?');
      values.push(preferences.application_notifications);
    }
    if (preferences.event_notifications !== undefined) {
      updates.push('event_notifications = ?');
      values.push(preferences.event_notifications);
    }
    if (preferences.system_notifications !== undefined) {
      updates.push('system_notifications = ?');
      values.push(preferences.system_notifications);
    }
    if (preferences.message_notifications !== undefined) {
      updates.push('message_notifications = ?');
      values.push(preferences.message_notifications);
    }
    if (preferences.info_notifications !== undefined) {
      updates.push('info_notifications = ?');
      values.push(preferences.info_notifications);
    }
    if (preferences.success_notifications !== undefined) {
      updates.push('success_notifications = ?');
      values.push(preferences.success_notifications);
    }
    if (preferences.warning_notifications !== undefined) {
      updates.push('warning_notifications = ?');
      values.push(preferences.warning_notifications);
    }
    if (preferences.error_notifications !== undefined) {
      updates.push('error_notifications = ?');
      values.push(preferences.error_notifications);
    }
    
    if (updates.length === 0) {
      return await this.getUserPreferences(userId);
    }
    
    values.push(userId);
    
    await connection.execute(
      `UPDATE notification_preferences SET ${updates.join(', ')} WHERE user_id = ?`,
      values
    );
    
    return await this.getUserPreferences(userId);
  },

  // Check if notification should be sent
  async shouldSendNotification(
    userId: number,
    type: 'info' | 'success' | 'warning' | 'error',
    category: 'job' | 'application' | 'event' | 'system' | 'message',
    deliveryMethod: 'email' | 'push' | 'in_app' = 'in_app'
  ): Promise<boolean> {
    const preferences = await this.getUserPreferences(userId);
    
    // Check delivery method
    if (deliveryMethod === 'email' && !preferences.email_enabled) return false;
    if (deliveryMethod === 'push' && !preferences.push_enabled) return false;
    if (deliveryMethod === 'in_app' && !preferences.in_app_enabled) return false;
    
    // Check category
    if (category === 'job' && !preferences.job_notifications) return false;
    if (category === 'application' && !preferences.application_notifications) return false;
    if (category === 'event' && !preferences.event_notifications) return false;
    if (category === 'system' && !preferences.system_notifications) return false;
    if (category === 'message' && !preferences.message_notifications) return false;
    
    // Check type
    if (type === 'info' && !preferences.info_notifications) return false;
    if (type === 'success' && !preferences.success_notifications) return false;
    if (type === 'warning' && !preferences.warning_notifications) return false;
    if (type === 'error' && !preferences.error_notifications) return false;
    
    return true;
  }
};

