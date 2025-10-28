import express from 'express';
import { learningController } from '@/controllers/learningController';
import { authenticateToken } from '@/middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Resources routes
router.get('/resources', learningController.getAllResources);
router.get('/resources/:id', learningController.getResourceById);
router.get('/resources/:resourceId/progress', learningController.getUserProgress);
router.patch('/resources/:resourceId/progress', learningController.updateProgress);

// Certifications routes
router.get('/certifications', learningController.getAllCertifications);
router.get('/certifications/my', learningController.getUserCertifications);
router.post('/certifications', learningController.addUserCertification);

// Learning paths routes
router.get('/paths', learningController.getAllPaths);
router.get('/paths/:id', learningController.getPathById);

// Statistics route
router.get('/stats', learningController.getLearningStats);

export default router;

