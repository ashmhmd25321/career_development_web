import { Router } from 'express';
import { applicationController } from '../controllers/applicationController';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

// Get applications for a specific job (employer only)
router.get('/job/:jobId', authenticateToken, requireRole(['employer', 'admin']), applicationController.getJobApplications);

// Get user's own applications (student/employer can view their own)
router.get('/my-applications', authenticateToken, applicationController.getUserApplications);

// Get application by ID
router.get('/:applicationId', authenticateToken, applicationController.getApplicationById);

// Create new application (students only)
router.post('/', authenticateToken, requireRole(['student']), applicationController.createApplication);

// Update application status (employer only)
router.patch('/:applicationId/status', authenticateToken, requireRole(['employer', 'admin']), applicationController.updateApplicationStatus);

// Delete application (students can delete their own applications)
router.delete('/:applicationId', authenticateToken, applicationController.deleteApplication);

export default router;
