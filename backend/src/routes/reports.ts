import { Router } from 'express';
import { reportController } from '@/controllers/reportController';
import { scheduledReportController } from '@/controllers/scheduledReportController';
import { reportShareController } from '@/controllers/reportShareController';
import { authenticateToken, requireRole } from '@/middleware/auth';

const router = Router();

// Public routes for shared reports (no auth required)
router.get('/shared/:token', reportShareController.getSharedReport);
router.get('/shared/:token/download', reportShareController.downloadSharedReport);

// All other report routes require authentication
router.use(authenticateToken);

// Report CRUD routes
router.post('/', reportController.createReport);
router.get('/', reportController.getUserReports);
router.get('/:id', reportController.getReportById);
router.get('/:id/download', reportController.downloadReport);
router.delete('/:id', reportController.deleteReport);
router.get('/:id/analytics', reportController.getReportAnalytics);

// Scheduled reports routes
router.post('/scheduled', requireRole(['admin', 'employer']), scheduledReportController.createScheduledReport);
router.get('/scheduled', scheduledReportController.getUserScheduledReports);
router.get('/scheduled/:id', scheduledReportController.getScheduledReportById);
router.put('/scheduled/:id', scheduledReportController.updateScheduledReport);
router.delete('/scheduled/:id', scheduledReportController.deleteScheduledReport);
router.post('/scheduled/:id/run-now', scheduledReportController.runScheduledReportNow);

// Report sharing routes
router.post('/:id/share', reportShareController.shareReport);
router.get('/shared/:token', reportShareController.getSharedReport);
router.get('/shared/:token/download', reportShareController.downloadSharedReport);
router.delete('/share/:id', reportShareController.revokeShare);

export default router;

