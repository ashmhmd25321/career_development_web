import { Router } from 'express';
import { notificationController } from '../controllers/notificationController';
import { notificationPreferencesController } from '../controllers/notificationPreferencesController';
import { notificationSchedulerController } from '../controllers/notificationSchedulerController';
import { notificationAnalyticsController } from '../controllers/notificationAnalyticsController';
import { notificationTemplateController } from '../controllers/notificationTemplateController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// All notification routes require authentication
router.get('/', authenticateToken, notificationController.getNotifications);
router.get('/unread-count', authenticateToken, notificationController.getUnreadCount);
router.put('/:id/read', authenticateToken, notificationController.markAsRead);
router.put('/all/read', authenticateToken, notificationController.markAllAsRead);
router.delete('/:id', authenticateToken, notificationController.deleteNotification);
router.delete('/', authenticateToken, notificationController.deleteAllNotifications);

// Preferences routes
router.get('/preferences', authenticateToken, notificationPreferencesController.getPreferences);
router.put('/preferences', authenticateToken, notificationPreferencesController.updatePreferences);

// Scheduled notifications routes
router.post('/schedule', authenticateToken, notificationSchedulerController.scheduleNotification);
router.get('/scheduled', authenticateToken, notificationSchedulerController.getUserScheduledNotifications);
router.put('/scheduled/:id', authenticateToken, notificationSchedulerController.updateScheduledNotification);
router.delete('/scheduled/:id', authenticateToken, notificationSchedulerController.deleteScheduledNotification);
router.post('/scheduled/process', authenticateToken, notificationSchedulerController.processScheduledNotifications);

// Analytics routes
router.get('/analytics', authenticateToken, notificationAnalyticsController.getOverallAnalytics);
router.get('/analytics/user', authenticateToken, notificationAnalyticsController.getUserAnalytics);

// Template routes
router.get('/templates', authenticateToken, notificationTemplateController.getAllTemplates);
router.get('/templates/variables', authenticateToken, notificationTemplateController.getAvailableVariables);
router.get('/templates/:id', authenticateToken, notificationTemplateController.getTemplateById);
router.post('/templates', authenticateToken, notificationTemplateController.createTemplate);
router.put('/templates/:id', authenticateToken, notificationTemplateController.updateTemplate);
router.delete('/templates/:id', authenticateToken, notificationTemplateController.deleteTemplate);
router.post('/templates/:id/preview', authenticateToken, notificationTemplateController.previewTemplate);
router.post('/templates/:id/send', authenticateToken, notificationTemplateController.useTemplateToSend);

export default router;

