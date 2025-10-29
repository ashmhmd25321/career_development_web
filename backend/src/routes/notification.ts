import { Router } from 'express';
import { notificationController } from '../controllers/notificationController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// All notification routes require authentication
router.get('/', authenticateToken, notificationController.getNotifications);
router.get('/unread-count', authenticateToken, notificationController.getUnreadCount);
router.put('/:id/read', authenticateToken, notificationController.markAsRead);
router.put('/all/read', authenticateToken, notificationController.markAllAsRead);
router.delete('/:id', authenticateToken, notificationController.deleteNotification);
router.delete('/', authenticateToken, notificationController.deleteAllNotifications);

export default router;

