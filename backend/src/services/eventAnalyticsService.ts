import { getConnection } from '../database/connection';
import { RowDataPacket } from 'mysql2';

export interface EventAnalytics {
  totalEvents: number;
  totalRegistrations: number;
  totalAttendees: number;
  averageAttendanceRate: number;
  totalRevenue: number;
  eventsByType: Array<{ type: string; count: number }>;
  eventsByStatus: {
    upcoming: number;
    past: number;
    cancelled: number;
  };
  registrationTrends: Array<{ date: string; count: number }>;
  topEvents: Array<{
    id: number;
    title: string;
    registrations: number;
    attendance_rate: number;
    average_rating: number | null;
  }>;
}

export const eventAnalyticsService = {
  // Get overall analytics (for admin)
  async getOverallAnalytics(): Promise<EventAnalytics> {
    const connection = getConnection();
    
    // Total events
    const [totalEvents] = await connection.execute<RowDataPacket[]>(
      'SELECT COUNT(*) as count FROM events WHERE is_active = TRUE'
    );
    
    // Total registrations
    const [totalRegistrations] = await connection.execute<RowDataPacket[]>(
      'SELECT COUNT(*) as count FROM event_registrations'
    );
    
    // Total attendees
    const [totalAttendees] = await connection.execute<RowDataPacket[]>(
      `SELECT COUNT(*) as count FROM event_registrations WHERE attendance_status = 'attended'`
    );
    
    // Average attendance rate
    const [avgAttendance] = await connection.execute<RowDataPacket[]>(
      `SELECT 
        AVG(CASE 
          WHEN total_reg > 0 THEN (attended_reg * 100.0 / total_reg)
          ELSE 0 
        END) as avg_rate
       FROM (
         SELECT 
           e.id,
           COUNT(DISTINCT er.id) as total_reg,
           COUNT(DISTINCT CASE WHEN er.attendance_status = 'attended' THEN er.id END) as attended_reg
         FROM events e
         LEFT JOIN event_registrations er ON e.id = er.event_id
         WHERE e.is_active = TRUE
         GROUP BY e.id
       ) as event_stats`
    );
    
    // Total revenue (from paid events)
    const [totalRevenue] = await connection.execute<RowDataPacket[]>(
      `SELECT 
        COALESCE(SUM(event_revenue), 0) as revenue
       FROM (
         SELECT 
           e.id,
           e.price * COUNT(DISTINCT er.id) as event_revenue
         FROM events e
         LEFT JOIN event_registrations er ON e.id = er.event_id
         WHERE e.is_active = TRUE AND e.is_free = FALSE
         GROUP BY e.id, e.price
       ) as revenue_calc`
    );
    
    // Events by type
    const [eventsByType] = await connection.execute<RowDataPacket[]>(
      `SELECT event_type as type, COUNT(*) as count 
       FROM events 
       WHERE is_active = TRUE 
       GROUP BY event_type`
    );
    
    // Events by status
    const now = new Date();
    const [eventsByStatus] = await connection.execute<RowDataPacket[]>(
      `SELECT 
        COUNT(CASE WHEN start_date > ? THEN 1 END) as upcoming,
        COUNT(CASE WHEN end_date < ? THEN 1 END) as past,
        COUNT(CASE WHEN is_active = FALSE THEN 1 END) as cancelled
       FROM events`,
      [now, now]
    );
    
    // Registration trends (last 30 days)
    const [registrationTrends] = await connection.execute<RowDataPacket[]>(
      `SELECT 
        DATE(registration_date) as date,
        COUNT(*) as count
       FROM event_registrations
       WHERE registration_date >= DATE_SUB(NOW(), INTERVAL 30 DAY)
       GROUP BY DATE(registration_date)
       ORDER BY date ASC`
    );
    
    // Top events (by registrations)
    const [topEvents] = await connection.execute<RowDataPacket[]>(
      `SELECT 
        e.id,
        e.title,
        COUNT(DISTINCT er.id) as registrations,
        CASE 
          WHEN COUNT(DISTINCT er.id) > 0 THEN 
            COUNT(DISTINCT CASE WHEN er.attendance_status = 'attended' THEN er.id END) * 100.0 / COUNT(DISTINCT er.id)
          ELSE 0
        END as attendance_rate,
        AVG(er.rating) as average_rating
       FROM events e
       LEFT JOIN event_registrations er ON e.id = er.event_id
       WHERE e.is_active = TRUE
       GROUP BY e.id, e.title
       ORDER BY registrations DESC
       LIMIT 10`
    );
    
    const revenue = totalRevenue.reduce((sum: number, row: any) => sum + (parseFloat(row.revenue) || 0), 0);
    
    return {
      totalEvents: totalEvents[0]?.count || 0,
      totalRegistrations: totalRegistrations[0]?.count || 0,
      totalAttendees: totalAttendees[0]?.count || 0,
      averageAttendanceRate: avgAttendance[0]?.avg_rate ? parseFloat(avgAttendance[0].avg_rate) : 0,
      totalRevenue: revenue,
      eventsByType: eventsByType.map((row: any) => ({
        type: row.type,
        count: row.count
      })),
      eventsByStatus: {
        upcoming: eventsByStatus[0]?.upcoming || 0,
        past: eventsByStatus[0]?.past || 0,
        cancelled: eventsByStatus[0]?.cancelled || 0
      },
      registrationTrends: registrationTrends.map((row: any) => ({
        date: row.date.toISOString().split('T')[0],
        count: row.count
      })),
      topEvents: topEvents.map((row: any) => ({
        id: row.id,
        title: row.title,
        registrations: row.registrations || 0,
        attendance_rate: row.attendance_rate ? parseFloat(row.attendance_rate) : 0,
        average_rating: row.average_rating ? parseFloat(row.average_rating) : null
      }))
    };
  },

  // Get organizer analytics
  async getOrganizerAnalytics(organizerId: number): Promise<EventAnalytics & { myEvents: number }> {
    const connection = getConnection();
    
    // My events count
    const [myEvents] = await connection.execute<RowDataPacket[]>(
      'SELECT COUNT(*) as count FROM events WHERE organizer_id = ? AND is_active = TRUE',
      [organizerId]
    );
    
    // Total registrations for my events
    const [totalRegistrations] = await connection.execute<RowDataPacket[]>(
      `SELECT COUNT(*) as count 
       FROM event_registrations er
       JOIN events e ON er.event_id = e.id
       WHERE e.organizer_id = ?`,
      [organizerId]
    );
    
    // Total attendees for my events
    const [totalAttendees] = await connection.execute<RowDataPacket[]>(
      `SELECT COUNT(*) as count 
       FROM event_registrations er
       JOIN events e ON er.event_id = e.id
       WHERE e.organizer_id = ? AND er.attendance_status = 'attended'`,
      [organizerId]
    );
    
    // Average attendance rate
    const [avgAttendance] = await connection.execute<RowDataPacket[]>(
      `SELECT 
        AVG(CASE 
          WHEN total_reg > 0 THEN (attended_reg * 100.0 / total_reg)
          ELSE 0 
        END) as avg_rate
       FROM (
         SELECT 
           e.id,
           COUNT(DISTINCT er.id) as total_reg,
           COUNT(DISTINCT CASE WHEN er.attendance_status = 'attended' THEN er.id END) as attended_reg
         FROM events e
         LEFT JOIN event_registrations er ON e.id = er.event_id
         WHERE e.organizer_id = ? AND e.is_active = TRUE
         GROUP BY e.id
       ) as event_stats`,
      [organizerId]
    );
    
    // Total revenue
    const [totalRevenue] = await connection.execute<RowDataPacket[]>(
      `SELECT 
        COALESCE(SUM(event_revenue), 0) as revenue
       FROM (
         SELECT 
           e.id,
           e.price * COUNT(DISTINCT er.id) as event_revenue
         FROM events e
         LEFT JOIN event_registrations er ON e.id = er.event_id
         WHERE e.organizer_id = ? AND e.is_active = TRUE AND e.is_free = FALSE
         GROUP BY e.id, e.price
       ) as revenue_calc`,
      [organizerId]
    );
    
    // Events by type
    const [eventsByType] = await connection.execute<RowDataPacket[]>(
      `SELECT event_type as type, COUNT(*) as count 
       FROM events 
       WHERE organizer_id = ? AND is_active = TRUE 
       GROUP BY event_type`,
      [organizerId]
    );
    
    // Events by status
    const now = new Date();
    const [eventsByStatus] = await connection.execute<RowDataPacket[]>(
      `SELECT 
        COUNT(CASE WHEN start_date > ? THEN 1 END) as upcoming,
        COUNT(CASE WHEN end_date < ? THEN 1 END) as past,
        COUNT(CASE WHEN is_active = FALSE THEN 1 END) as cancelled
       FROM events
       WHERE organizer_id = ?`,
      [now, now, organizerId]
    );
    
    // Registration trends
    const [registrationTrends] = await connection.execute<RowDataPacket[]>(
      `SELECT 
        DATE(er.registration_date) as date,
        COUNT(*) as count
       FROM event_registrations er
       JOIN events e ON er.event_id = e.id
       WHERE e.organizer_id = ? AND er.registration_date >= DATE_SUB(NOW(), INTERVAL 30 DAY)
       GROUP BY DATE(er.registration_date)
       ORDER BY date ASC`,
      [organizerId]
    );
    
    // Top events
    const [topEvents] = await connection.execute<RowDataPacket[]>(
      `SELECT 
        e.id,
        e.title,
        COUNT(DISTINCT er.id) as registrations,
        CASE 
          WHEN COUNT(DISTINCT er.id) > 0 THEN 
            COUNT(DISTINCT CASE WHEN er.attendance_status = 'attended' THEN er.id END) * 100.0 / COUNT(DISTINCT er.id)
          ELSE 0
        END as attendance_rate,
        AVG(er.rating) as average_rating
       FROM events e
       LEFT JOIN event_registrations er ON e.id = er.event_id
       WHERE e.organizer_id = ? AND e.is_active = TRUE
       GROUP BY e.id, e.title
       ORDER BY registrations DESC
       LIMIT 10`,
      [organizerId]
    );
    
    const revenue = totalRevenue.reduce((sum: number, row: any) => sum + (parseFloat(row.revenue) || 0), 0);
    
    return {
      totalEvents: myEvents[0]?.count || 0,
      myEvents: myEvents[0]?.count || 0,
      totalRegistrations: totalRegistrations[0]?.count || 0,
      totalAttendees: totalAttendees[0]?.count || 0,
      averageAttendanceRate: avgAttendance[0]?.avg_rate ? parseFloat(avgAttendance[0].avg_rate) : 0,
      totalRevenue: revenue,
      eventsByType: eventsByType.map((row: any) => ({
        type: row.type,
        count: row.count
      })),
      eventsByStatus: {
        upcoming: eventsByStatus[0]?.upcoming || 0,
        past: eventsByStatus[0]?.past || 0,
        cancelled: eventsByStatus[0]?.cancelled || 0
      },
      registrationTrends: registrationTrends.map((row: any) => ({
        date: row.date.toISOString().split('T')[0],
        count: row.count
      })),
      topEvents: topEvents.map((row: any) => ({
        id: row.id,
        title: row.title,
        registrations: row.registrations || 0,
        attendance_rate: row.attendance_rate ? parseFloat(row.attendance_rate) : 0,
        average_rating: row.average_rating ? parseFloat(row.average_rating) : null
      }))
    };
  }
};

