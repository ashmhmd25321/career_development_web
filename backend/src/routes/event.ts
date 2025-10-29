import { Router } from 'express';
import { eventController } from '../controllers/eventController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Public routes (with auth optional)
router.get('/', authenticateToken, eventController.getAllEvents);
router.get('/:id', authenticateToken, eventController.getEventById);

// Protected routes (require auth)
router.get('/organizer/my-events', authenticateToken, eventController.getEventsByOrganizer);
router.post('/', authenticateToken, eventController.createEvent);
router.put('/:id', authenticateToken, eventController.updateEvent);
router.delete('/:id', authenticateToken, eventController.deleteEvent);

// Registration routes
router.post('/:id/register', authenticateToken, eventController.registerForEvent);
router.get('/user/my-registrations', authenticateToken, eventController.getUserRegistrations);
router.delete('/:id/register', authenticateToken, eventController.cancelRegistration);

// Attendees route (organizer only)
router.get('/:id/attendees', authenticateToken, eventController.getEventAttendees);

export default router;

