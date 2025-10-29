import { Request, Response } from 'express';
import { eventService } from '../services/eventService';
import { logger } from '../utils/logger';
import { AuthRequest } from '../middleware/auth';

export const eventController = {
  // Get all events
  getAllEvents: async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
      const userId = req.user?.id;
      const events = await eventService.getAllEvents(userId);
      return res.json(events);
    } catch (error) {
      logger.error('Error getting events:', error);
      return res.status(500).json({ error: 'Failed to get events' });
    }
  },

  // Get event by ID
  getEventById: async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      
      const event = await eventService.getEventById(parseInt(id), userId);
      
      if (!event) {
        return res.status(404).json({ error: 'Event not found' });
      }
      
      return res.json(event);
    } catch (error) {
      logger.error('Error getting event:', error);
      return res.status(500).json({ error: 'Failed to get event' });
    }
  },

  // Get events by organizer
  getEventsByOrganizer: async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      
      const events = await eventService.getEventsByOrganizer(userId);
      return res.json(events);
    } catch (error) {
      logger.error('Error getting events by organizer:', error);
      return res.status(500).json({ error: 'Failed to get events' });
    }
  },

  // Create new event
  createEvent: async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      
      // Only employers and admins can create events
      if (req.user?.role !== 'employer' && req.user?.role !== 'admin') {
        return res.status(403).json({ error: 'Only employers and admins can create events' });
      }
      
      const eventData = {
        ...req.body,
        organizer_id: userId,
        start_date: new Date(req.body.start_date),
        end_date: new Date(req.body.end_date),
        registration_deadline: req.body.registration_deadline ? new Date(req.body.registration_deadline) : undefined,
      };
      
      const event = await eventService.createEvent(eventData);
      return res.status(201).json(event);
    } catch (error: any) {
      logger.error('Error creating event:', error);
      return res.status(500).json({ error: error.message || 'Failed to create event' });
    }
  },

  // Update event
  updateEvent: async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      
      // Check if user is the organizer or an admin
      const event = await eventService.getEventById(parseInt(id));
      if (!event) {
        return res.status(404).json({ error: 'Event not found' });
      }
      
      if (event.organizer_id !== userId && req.user?.role !== 'admin') {
        return res.status(403).json({ error: 'You can only update your own events' });
      }
      
      const eventData: any = { ...req.body };
      if (eventData.start_date) eventData.start_date = new Date(eventData.start_date);
      if (eventData.end_date) eventData.end_date = new Date(eventData.end_date);
      if (eventData.registration_deadline) eventData.registration_deadline = new Date(eventData.registration_deadline);
      
      const updatedEvent = await eventService.updateEvent(parseInt(id), eventData);
      return res.json(updatedEvent);
    } catch (error: any) {
      logger.error('Error updating event:', error);
      return res.status(500).json({ error: error.message || 'Failed to update event' });
    }
  },

  // Delete event
  deleteEvent: async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      
      // Check if user is the organizer or an admin
      const event = await eventService.getEventById(parseInt(id));
      if (!event) {
        return res.status(404).json({ error: 'Event not found' });
      }
      
      if (event.organizer_id !== userId && req.user?.role !== 'admin') {
        return res.status(403).json({ error: 'You can only delete your own events' });
      }
      
      await eventService.deleteEvent(parseInt(id));
      return res.json({ message: 'Event deleted successfully' });
    } catch (error) {
      logger.error('Error deleting event:', error);
      return res.status(500).json({ error: 'Failed to delete event' });
    }
  },

  // Register for event
  registerForEvent: async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      
      const registration = await eventService.registerForEvent(parseInt(id), userId);
      return res.status(201).json(registration);
    } catch (error: any) {
      logger.error('Error registering for event:', error);
      return res.status(500).json({ error: error.message || 'Failed to register for event' });
    }
  },

  // Get user registrations
  getUserRegistrations: async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      
      const events = await eventService.getUserRegistrations(userId);
      return res.json(events);
    } catch (error) {
      logger.error('Error getting user registrations:', error);
      return res.status(500).json({ error: 'Failed to get registrations' });
    }
  },

  // Cancel registration
  cancelRegistration: async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      
      await eventService.cancelRegistration(parseInt(id), userId);
      return res.json({ message: 'Registration cancelled successfully' });
    } catch (error) {
      logger.error('Error cancelling registration:', error);
      return res.status(500).json({ error: 'Failed to cancel registration' });
    }
  },

  // Get event attendees
  getEventAttendees: async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      
      // Check if user is the organizer or an admin
      const event = await eventService.getEventById(parseInt(id));
      if (!event) {
        return res.status(404).json({ error: 'Event not found' });
      }
      
      if (event.organizer_id !== userId && req.user?.role !== 'admin') {
        return res.status(403).json({ error: 'Only the organizer can view attendees' });
      }
      
      const attendees = await eventService.getEventAttendees(parseInt(id));
      return res.json(attendees);
    } catch (error) {
      logger.error('Error getting attendees:', error);
      return res.status(500).json({ error: 'Failed to get attendees' });
    }
  }
};

