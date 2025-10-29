import { getConnection } from '../database/connection';
import { RowDataPacket } from 'mysql2';

export interface NotificationAnalytics {
  totalNotifications: number;
  readCount: number;
  unreadCount: number;
  readRate: number;
  unreadRate: number;
  notificationsByCategory: Array<{ category: string; count: number; readCount: number }>;
  notificationsByType: Array<{ type: string; count: number; readCount: number }>;
  notificationTrends: Array<{ date: string; sent: number; read: number }>;
  averageTimeToRead: number | null; // in minutes
  mostEngagedUsers: Array<{
    user_id: number;
    user_name: string;
    notification_count: number;
    read_count: number;
    read_rate: number;
  }>;
  deliveryMethodStats: {
    email_enabled_count: number;
    push_enabled_count: number;
    in_app_enabled_count: number;
  };
}

export const notificationAnalyticsService = {
  // Get overall analytics (admin only)
  async getOverallAnalytics(): Promise<NotificationAnalytics> {
    const connection = getConnection();
    
    // Total notifications
    const [totalNotifications] = await connection.execute<RowDataPacket[]>(
      'SELECT COUNT(*) as count FROM notifications'
    );
    
    // Read count
    const [readCount] = await connection.execute<RowDataPacket[]>(
      'SELECT COUNT(*) as count FROM notifications WHERE is_read = TRUE'
    );
    
    // Unread count
    const [unreadCount] = await connection.execute<RowDataPacket[]>(
      'SELECT COUNT(*) as count FROM notifications WHERE is_read = FALSE'
    );
    
    const total = totalNotifications[0]?.count || 0;
    const read = readCount[0]?.count || 0;
    const unread = unreadCount[0]?.count || 0;
    const readRate = total > 0 ? (read / total) * 100 : 0;
    const unreadRate = total > 0 ? (unread / total) * 100 : 0;
    
    // Notifications by category
    const [byCategory] = await connection.execute<RowDataPacket[]>(
      `SELECT 
        category,
        COUNT(*) as count,
        COUNT(CASE WHEN is_read = TRUE THEN 1 END) as readCount
       FROM notifications
       GROUP BY category`
    );
    
    // Notifications by type
    const [byType] = await connection.execute<RowDataPacket[]>(
      `SELECT 
        type,
        COUNT(*) as count,
        COUNT(CASE WHEN is_read = TRUE THEN 1 END) as readCount
       FROM notifications
       GROUP BY type`
    );
    
    // Notification trends (last 30 days)
    const [trends] = await connection.execute<RowDataPacket[]>(
      `SELECT 
        DATE(created_at) as date,
        COUNT(*) as sent,
        COUNT(CASE WHEN is_read = TRUE THEN 1 END) as read
       FROM notifications
       WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
       GROUP BY DATE(created_at)
       ORDER BY date ASC`
    );
    
    // Average time to read (in minutes)
    const [avgTime] = await connection.execute<RowDataPacket[]>(
      `SELECT 
        AVG(TIMESTAMPDIFF(MINUTE, created_at, read_at)) as avgMinutes
       FROM notifications
       WHERE is_read = TRUE AND read_at IS NOT NULL`
    );
    
    // Most engaged users (top 10)
    const [mostEngaged] = await connection.execute<RowDataPacket[]>(
      `SELECT 
        u.id as user_id,
        CONCAT(u.first_name, ' ', u.last_name) as user_name,
        COUNT(n.id) as notification_count,
        COUNT(CASE WHEN n.is_read = TRUE THEN 1 END) as read_count,
        CASE 
          WHEN COUNT(n.id) > 0 THEN 
            COUNT(CASE WHEN n.is_read = TRUE THEN 1 END) * 100.0 / COUNT(n.id)
          ELSE 0
        END as read_rate
       FROM users u
       LEFT JOIN notifications n ON u.id = n.user_id
       GROUP BY u.id, u.first_name, u.last_name
       HAVING notification_count > 0
       ORDER BY notification_count DESC, read_rate DESC
       LIMIT 10`
    );
    
    // Delivery method preferences stats
    const [deliveryStats] = await connection.execute<RowDataPacket[]>(
      `SELECT 
        COUNT(CASE WHEN email_enabled = TRUE THEN 1 END) as email_enabled_count,
        COUNT(CASE WHEN push_enabled = TRUE THEN 1 END) as push_enabled_count,
        COUNT(CASE WHEN in_app_enabled = TRUE THEN 1 END) as in_app_enabled_count
       FROM notification_preferences`
    );
    
    return {
      totalNotifications: total,
      readCount: read,
      unreadCount: unread,
      readRate: readRate,
      unreadRate: unreadRate,
      notificationsByCategory: byCategory.map((row: any) => ({
        category: row.category,
        count: row.count || 0,
        readCount: row.readCount || 0
      })),
      notificationsByType: byType.map((row: any) => ({
        type: row.type,
        count: row.count || 0,
        readCount: row.readCount || 0
      })),
      notificationTrends: trends.map((row: any) => ({
        date: row.date.toISOString().split('T')[0],
        sent: row.sent || 0,
        read: row.read || 0
      })),
      averageTimeToRead: avgTime[0]?.avgMinutes ? parseFloat(avgTime[0].avgMinutes) : null,
      mostEngagedUsers: mostEngaged.map((row: any) => ({
        user_id: row.user_id,
        user_name: row.user_name,
        notification_count: row.notification_count || 0,
        read_count: row.read_count || 0,
        read_rate: row.read_rate ? parseFloat(row.read_rate) : 0
      })),
      deliveryMethodStats: {
        email_enabled_count: deliveryStats[0]?.email_enabled_count || 0,
        push_enabled_count: deliveryStats[0]?.push_enabled_count || 0,
        in_app_enabled_count: deliveryStats[0]?.in_app_enabled_count || 0
      }
    };
  },

  // Get user-specific analytics
  async getUserAnalytics(userId: number): Promise<Partial<NotificationAnalytics>> {
    const connection = getConnection();
    
    // Total notifications for user
    const [totalNotifications] = await connection.execute<RowDataPacket[]>(
      'SELECT COUNT(*) as count FROM notifications WHERE user_id = ?',
      [userId]
    );
    
    // Read count
    const [readCount] = await connection.execute<RowDataPacket[]>(
      'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = TRUE',
      [userId]
    );
    
    // Unread count
    const [unreadCount] = await connection.execute<RowDataPacket[]>(
      'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = FALSE',
      [userId]
    );
    
    // Notifications by category
    const [byCategory] = await connection.execute<RowDataPacket[]>(
      `SELECT 
        category,
        COUNT(*) as count,
        COUNT(CASE WHEN is_read = TRUE THEN 1 END) as readCount
       FROM notifications
       WHERE user_id = ?
       GROUP BY category`,
      [userId]
    );
    
    // Notifications by type
    const [byType] = await connection.execute<RowDataPacket[]>(
      `SELECT 
        type,
        COUNT(*) as count,
        COUNT(CASE WHEN is_read = TRUE THEN 1 END) as readCount
       FROM notifications
       WHERE user_id = ?
       GROUP BY type`,
      [userId]
    );
    
    // Average time to read (in minutes)
    const [avgTime] = await connection.execute<RowDataPacket[]>(
      `SELECT 
        AVG(TIMESTAMPDIFF(MINUTE, created_at, read_at)) as avgMinutes
       FROM notifications
       WHERE user_id = ? AND is_read = TRUE AND read_at IS NOT NULL`,
      [userId]
    );
    
    const total = totalNotifications[0]?.count || 0;
    const read = readCount[0]?.count || 0;
    const unread = unreadCount[0]?.count || 0;
    const readRate = total > 0 ? (read / total) * 100 : 0;
    
    return {
      totalNotifications: total,
      readCount: read,
      unreadCount: unread,
      readRate: readRate,
      unreadRate: 100 - readRate,
      notificationsByCategory: byCategory.map((row: any) => ({
        category: row.category,
        count: row.count || 0,
        readCount: row.readCount || 0
      })),
      notificationsByType: byType.map((row: any) => ({
        type: row.type,
        count: row.count || 0,
        readCount: row.readCount || 0
      })),
      averageTimeToRead: avgTime[0]?.avgMinutes ? parseFloat(avgTime[0].avgMinutes) : null
    };
  }
};

