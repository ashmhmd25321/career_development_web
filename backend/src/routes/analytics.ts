import { Router } from 'express';
import { analyticsController } from '@/controllers/analyticsController';
import { adminDashboardController } from '@/controllers/adminDashboardController';
import { authenticateToken, requireRole } from '@/middleware/auth';

const router = Router();

// All analytics routes require authentication
router.use(authenticateToken);

// Admin dashboard route (platform-wide metrics)
router.get('/admin/dashboard', requireRole(['admin']), adminDashboardController.getDashboardMetrics);

// Employer and Admin analytics routes
router.get('/jobs', requireRole(['employer', 'admin']), analyticsController.getJobAnalytics);
router.get('/performance', requireRole(['employer', 'admin']), analyticsController.getJobPerformanceMetrics);
router.get('/applications', requireRole(['employer', 'admin']), analyticsController.getApplicationAnalytics);

export default router;
