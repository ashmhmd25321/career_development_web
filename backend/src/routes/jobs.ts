import { Router } from 'express';
import { jobController } from '@/controllers/jobController';
import { authenticateToken, requireRole } from '@/middleware/auth';

const router = Router();

// Public routes (no authentication required)
router.get('/', jobController.getJobs); // Get all jobs with filters
router.get('/:id', jobController.getJobById); // Get job by ID

// Protected routes (authentication required)
router.use(authenticateToken); // Apply authentication middleware to all routes below

// Employer and Admin routes
router.get('/employer/my-jobs', requireRole(['employer', 'admin']), jobController.getEmployerJobs);
router.post('/', requireRole(['employer', 'admin']), jobController.createJob);
router.put('/:id', jobController.updateJob); // Job owner or admin can update
router.delete('/:id', jobController.deleteJob); // Job owner or admin can delete
router.get('/employer/stats', requireRole(['employer', 'admin']), jobController.getJobStats);

export default router;
