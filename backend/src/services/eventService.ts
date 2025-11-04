import { getConnection } from '../database/connection';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export interface Event {
  id: number;
  title: string;
  description?: string;
  event_type: 'workshop' | 'seminar' | 'networking' | 'career_fair' | 'webinar';
  organizer_id: number;
  organizer_name?: string;
  start_date: Date;
  end_date: Date;
  location?: string;
  location_type: 'online' | 'in-person' | 'hybrid';
  max_attendees?: number;
  registration_deadline?: Date;
  is_active: boolean;
  is_free: boolean;
  price: number;
  attendees_count?: number;
  is_registered?: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface EventRegistration {
  id: number;
  event_id: number;
  user_id: number;
  registration_date: Date;
  attendance_status: 'registered' | 'attended' | 'no_show';
  feedback?: string;
  rating?: number;
}

export interface CreateEventData {
  title: string;
  description?: string;
  event_type: 'workshop' | 'seminar' | 'networking' | 'career_fair' | 'webinar';
  organizer_id: number;
  start_date: Date;
  end_date: Date;
  location?: string;
  location_type: 'online' | 'in-person' | 'hybrid';
  max_attendees?: number;
  registration_deadline?: Date;
  is_free: boolean;
  price: number;
}

export interface UpdateEventData {
  title?: string;
  description?: string;
  event_type?: 'workshop' | 'seminar' | 'networking' | 'career_fair' | 'webinar';
  start_date?: Date;
  end_date?: Date;
  location?: string;
  location_type?: 'online' | 'in-person' | 'hybrid';
  max_attendees?: number;
  registration_deadline?: Date;
  is_free?: boolean;
  price?: number;
  is_active?: boolean;
}

export const eventService = {
  // Get all active events
  async getAllEvents(userId?: number): Promise<Event[]> {
    const connection = getConnection();
    
    const query = `
      SELECT 
        e.*,
        CONCAT(u.first_name, ' ', u.last_name) as organizer_name,
        COUNT(DISTINCT er.id) as attendees_count
      FROM events e
      LEFT JOIN users u ON e.organizer_id = u.id
      LEFT JOIN event_registrations er ON e.id = er.event_id
      WHERE e.is_active = TRUE
      AND e.start_date > NOW()
      GROUP BY e.id
      ORDER BY e.start_date ASC
    `;
    
    const [rows] = await connection.execute<RowDataPacket[]>(query);
    const events = rows.map(row => ({ ...row } as Event));
    
    // Check if user is registered for each event
    if (userId) {
      for (const event of events) {
        const [registrations] = await connection.execute<RowDataPacket[]>(
          'SELECT id FROM event_registrations WHERE event_id = ? AND user_id = ?',
          [event.id, userId]
        );
        event.is_registered = registrations.length > 0;
      }
    }
    
    return events;
  },

  // Get event by ID
  async getEventById(eventId: number, userId?: number): Promise<Event | null> {
    const connection = getConnection();
    
    const [rows] = await connection.execute<RowDataPacket[]>(
      `SELECT 
        e.*,
        CONCAT(u.first_name, ' ', u.last_name) as organizer_name,
        COUNT(DISTINCT er.id) as attendees_count
       FROM events e
       LEFT JOIN users u ON e.organizer_id = u.id
       LEFT JOIN event_registrations er ON e.id = er.event_id
       WHERE e.id = ?
       GROUP BY e.id`,
      [eventId]
    );
    
    if (rows.length === 0) return null;
    
    const event = { ...rows[0] } as Event;
    
    // Check if user is registered
    if (userId) {
      const [registrations] = await connection.execute<RowDataPacket[]>(
        'SELECT id FROM event_registrations WHERE event_id = ? AND user_id = ?',
        [eventId, userId]
      );
      event.is_registered = registrations.length > 0;
    }
    
    return event;
  },

  // Get events by organizer
  async getEventsByOrganizer(organizerId: number): Promise<Event[]> {
    const connection = getConnection();
    
    const [rows] = await connection.execute<RowDataPacket[]>(
      `SELECT 
        e.*,
        CONCAT(u.first_name, ' ', u.last_name) as organizer_name,
        COUNT(DISTINCT er.id) as attendees_count
       FROM events e
       LEFT JOIN users u ON e.organizer_id = u.id
       LEFT JOIN event_registrations er ON e.id = er.event_id
       WHERE e.organizer_id = ?
       GROUP BY e.id
       ORDER BY e.start_date DESC`,
      [organizerId]
    );
    
    return rows.map(row => ({ ...row } as Event));
  },

  // Create new event
  async createEvent(eventData: CreateEventData): Promise<Event> {
    const connection = getConnection();
    
    const query = `
      INSERT INTO events (
        title, description, event_type, organizer_id, start_date, end_date,
        location, location_type, max_attendees, registration_deadline,
        is_free, price
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const [result] = await connection.execute<ResultSetHeader>(
      query,
      [
        eventData.title,
        eventData.description || null,
        eventData.event_type,
        eventData.organizer_id,
        eventData.start_date,
        eventData.end_date,
        eventData.location || null,
        eventData.location_type,
        eventData.max_attendees || null,
        eventData.registration_deadline || null,
        eventData.is_free,
        eventData.price || 0
      ]
    );
    
    const createdEvent = await this.getEventById(result.insertId);
    if (!createdEvent) {
      throw new Error('Failed to retrieve created event');
    }
    
    return createdEvent;
  },

  // Update event
  async updateEvent(eventId: number, eventData: UpdateEventData): Promise<Event> {
    const connection = getConnection();
    
    const updates: string[] = [];
    const values: any[] = [];
    
    if (eventData.title !== undefined) {
      updates.push('title = ?');
      values.push(eventData.title);
    }
    if (eventData.description !== undefined) {
      updates.push('description = ?');
      values.push(eventData.description);
    }
    if (eventData.event_type !== undefined) {
      updates.push('event_type = ?');
      values.push(eventData.event_type);
    }
    if (eventData.start_date !== undefined) {
      updates.push('start_date = ?');
      values.push(eventData.start_date);
    }
    if (eventData.end_date !== undefined) {
      updates.push('end_date = ?');
      values.push(eventData.end_date);
    }
    if (eventData.location !== undefined) {
      updates.push('location = ?');
      values.push(eventData.location);
    }
    if (eventData.location_type !== undefined) {
      updates.push('location_type = ?');
      values.push(eventData.location_type);
    }
    if (eventData.max_attendees !== undefined) {
      updates.push('max_attendees = ?');
      values.push(eventData.max_attendees);
    }
    if (eventData.registration_deadline !== undefined) {
      updates.push('registration_deadline = ?');
      values.push(eventData.registration_deadline);
    }
    if (eventData.is_free !== undefined) {
      updates.push('is_free = ?');
      values.push(eventData.is_free);
    }
    if (eventData.price !== undefined) {
      updates.push('price = ?');
      values.push(eventData.price);
    }
    if (eventData.is_active !== undefined) {
      updates.push('is_active = ?');
      values.push(eventData.is_active);
    }
    
    if (updates.length === 0) {
      throw new Error('No fields to update');
    }
    
    values.push(eventId);
    
    await connection.execute(
      `UPDATE events SET ${updates.join(', ')}, updated_at = NOW() WHERE id = ?`,
      values
    );
    
    const updatedEvent = await this.getEventById(eventId);
    if (!updatedEvent) {
      throw new Error('Failed to retrieve updated event');
    }
    
    return updatedEvent;
  },

  // Delete event
  async deleteEvent(eventId: number): Promise<void> {
    const connection = getConnection();
    
    await connection.execute('DELETE FROM events WHERE id = ?', [eventId]);
  },

  // Register for event
  async registerForEvent(eventId: number, userId: number): Promise<EventRegistration> {
    const connection = getConnection();
    
    // Check if event exists and is active
    const event = await this.getEventById(eventId);
    if (!event) {
      throw new Error('Event not found');
    }
    if (!event.is_active) {
      throw new Error('Event is not active');
    }
    
    // Check registration deadline
    if (event.registration_deadline && new Date(event.registration_deadline) < new Date()) {
      throw new Error('Registration deadline has passed');
    }
    
    // Check if already registered
    const [existing] = await connection.execute<RowDataPacket[]>(
      'SELECT id FROM event_registrations WHERE event_id = ? AND user_id = ?',
      [eventId, userId]
    );
    
    if (existing.length > 0) {
      throw new Error('You are already registered for this event');
    }
    
    // Check if event is full
    if (event.max_attendees && event.attendees_count && event.attendees_count >= event.max_attendees) {
      throw new Error('Event is full');
    }
    
    // Get user info for notification
    const [userRows] = await connection.execute<RowDataPacket[]>(
      'SELECT first_name, last_name FROM users WHERE id = ?',
      [userId]
    );
    const registrantName = userRows.length > 0 
      ? `${userRows[0].first_name} ${userRows[0].last_name}` 
      : 'A user';
    
    // Register user
    const [result] = await connection.execute<ResultSetHeader>(
      'INSERT INTO event_registrations (event_id, user_id, registration_date) VALUES (?, ?, NOW())',
      [eventId, userId]
    );
    
    const registration = await this.getEventRegistration(result.insertId);
    if (!registration) {
      throw new Error('Failed to retrieve registration');
    }
    
    // Create notification for event organizer (employer)
    if (event.organizer_id) {
      try {
        const { notificationService } = await import('./notificationService');
        await notificationService.createNotification({
          user_id: event.organizer_id,
          title: 'New Event Registration',
          message: `${registrantName} has registered for your event "${event.title}".`,
          type: 'info',
          category: 'event',
          related_id: eventId
        });
      } catch (error) {
        // Log error but don't fail registration if notification fails
        console.error('Error creating notification for event registration:', error);
      }
    }
    
    return registration;
  },

  // Get event registration
  async getEventRegistration(registrationId: number): Promise<EventRegistration | null> {
    const connection = getConnection();
    
    const [rows] = await connection.execute<RowDataPacket[]>(
      'SELECT * FROM event_registrations WHERE id = ?',
      [registrationId]
    );
    
    return rows.length > 0 ? (rows[0] as EventRegistration) : null;
  },

  // Get user registrations
  async getUserRegistrations(userId: number): Promise<Event[]> {
    const connection = getConnection();
    
    const [rows] = await connection.execute<RowDataPacket[]>(
      `SELECT 
        e.*,
        CONCAT(u.first_name, ' ', u.last_name) as organizer_name,
        COUNT(DISTINCT er2.id) as attendees_count
       FROM event_registrations er
       JOIN events e ON er.event_id = e.id
       LEFT JOIN users u ON e.organizer_id = u.id
       LEFT JOIN event_registrations er2 ON e.id = er2.event_id
       WHERE er.user_id = ?
       GROUP BY e.id
       ORDER BY e.start_date ASC`,
      [userId]
    );
    
    const events = rows.map(row => ({ ...row, is_registered: true } as Event));
    
    return events;
  },

  // Cancel event registration
  async cancelRegistration(eventId: number, userId: number): Promise<void> {
    const connection = getConnection();
    
    await connection.execute(
      'DELETE FROM event_registrations WHERE event_id = ? AND user_id = ?',
      [eventId, userId]
    );
  },

  // Get event attendees
  async getEventAttendees(eventId: number): Promise<any[]> {
    const connection = getConnection();
    
    const [rows] = await connection.execute<RowDataPacket[]>(
      `SELECT 
        er.*,
        u.id as user_id,
        u.email,
        u.first_name,
        u.last_name,
        u.role
       FROM event_registrations er
       JOIN users u ON er.user_id = u.id
       WHERE er.event_id = ?
       ORDER BY er.registration_date ASC`,
      [eventId]
    );
    
    return rows.map(row => ({
      id: row.id,
      event_id: row.event_id,
      user_id: row.user_id,
      registration_date: row.registration_date,
      attendance_status: row.attendance_status,
      feedback: row.feedback,
      rating: row.rating,
      user: {
        id: row.user_id,
        email: row.email,
        first_name: row.first_name,
        last_name: row.last_name,
        role: row.role
      }
    }));
  },

  // Submit event feedback
  async submitFeedback(eventId: number, userId: number, feedback: string, rating: number, attendanceStatus: 'attended' | 'no_show' = 'attended'): Promise<EventRegistration> {
    const connection = getConnection();
    
    // Check if user is registered for this event
    const [existing] = await connection.execute<RowDataPacket[]>(
      'SELECT * FROM event_registrations WHERE event_id = ? AND user_id = ?',
      [eventId, userId]
    );
    
    if (existing.length === 0) {
      throw new Error('You must be registered for this event to submit feedback');
    }
    
    // Check if event has ended
    const [event] = await connection.execute<RowDataPacket[]>(
      'SELECT end_date FROM events WHERE id = ?',
      [eventId]
    );
    
    if (event.length === 0) {
      throw new Error('Event not found');
    }
    
    if (new Date(event[0].end_date) > new Date()) {
      throw new Error('Event has not ended yet. Feedback can only be submitted after the event ends.');
    }
    
    // Update registration with feedback
    await connection.execute(
      'UPDATE event_registrations SET feedback = ?, rating = ?, attendance_status = ? WHERE event_id = ? AND user_id = ?',
      [feedback, rating, attendanceStatus, eventId, userId]
    );
    
    const updated = await this.getEventRegistrationByUser(eventId, userId);
    if (!updated) {
      throw new Error('Failed to retrieve feedback');
    }
    
    return updated;
  },

  // Get event registration by user
  async getEventRegistrationByUser(eventId: number, userId: number): Promise<EventRegistration | null> {
    const connection = getConnection();
    
    const [rows] = await connection.execute<RowDataPacket[]>(
      'SELECT * FROM event_registrations WHERE event_id = ? AND user_id = ?',
      [eventId, userId]
    );
    
    return rows.length > 0 ? (rows[0] as EventRegistration) : null;
  },

  // Get event feedback (for organizers)
  async getEventFeedback(eventId: number, organizerId?: number): Promise<any[]> {
    const connection = getConnection();
    
    // Verify organizer if provided
    if (organizerId) {
      const [event] = await connection.execute<RowDataPacket[]>(
        'SELECT organizer_id FROM events WHERE id = ?',
        [eventId]
      );
      
      if (event.length === 0) {
        throw new Error('Event not found');
      }
      
      if (event[0].organizer_id !== organizerId) {
        throw new Error('Only the organizer can view feedback');
      }
    }
    
    const [rows] = await connection.execute<RowDataPacket[]>(
      `SELECT 
        er.*,
        u.id as user_id,
        u.email,
        u.first_name,
        u.last_name,
        u.role
       FROM event_registrations er
       JOIN users u ON er.user_id = u.id
       WHERE er.event_id = ? AND er.feedback IS NOT NULL
       ORDER BY er.registration_date DESC`,
      [eventId]
    );
    
    return rows.map(row => ({
      id: row.id,
      event_id: row.event_id,
      user_id: row.user_id,
      registration_date: row.registration_date,
      attendance_status: row.attendance_status,
      feedback: row.feedback,
      rating: row.rating,
      user: {
        id: row.user_id,
        email: row.email,
        first_name: row.first_name,
        last_name: row.last_name,
        role: row.role
      }
    }));
  },

  // Get event statistics (for analytics)
  async getEventStats(eventId: number, organizerId?: number): Promise<any> {
    const connection = getConnection();
    
    // Verify organizer if provided
    if (organizerId) {
      const [event] = await connection.execute<RowDataPacket[]>(
        'SELECT organizer_id FROM events WHERE id = ?',
        [eventId]
      );
      
      if (event.length === 0) {
        throw new Error('Event not found');
      }
      
      if (event[0].organizer_id !== organizerId) {
        throw new Error('Only the organizer can view statistics');
      }
    }
    
    const [stats] = await connection.execute<RowDataPacket[]>(
      `SELECT 
        COUNT(*) as total_registrations,
        COUNT(CASE WHEN attendance_status = 'attended' THEN 1 END) as attended_count,
        COUNT(CASE WHEN attendance_status = 'no_show' THEN 1 END) as no_show_count,
        COUNT(CASE WHEN feedback IS NOT NULL THEN 1 END) as feedback_count,
        AVG(rating) as average_rating,
        SUM(CASE WHEN attendance_status = 'attended' THEN 1 ELSE 0 END) * 100.0 / COUNT(*) as attendance_rate
       FROM event_registrations
       WHERE event_id = ?`,
      [eventId]
    );
    
    return {
      total_registrations: stats[0].total_registrations || 0,
      attended_count: stats[0].attended_count || 0,
      no_show_count: stats[0].no_show_count || 0,
      feedback_count: stats[0].feedback_count || 0,
      average_rating: stats[0].average_rating ? parseFloat(stats[0].average_rating) : null,
      attendance_rate: stats[0].attendance_rate ? parseFloat(stats[0].attendance_rate) : 0
    };
  }
};

