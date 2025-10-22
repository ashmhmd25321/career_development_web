import { Router } from 'express';
import { RecommendationController } from '@/controllers/recommendationController';
import { authenticateToken } from '@/middleware/auth';

const router = Router();

// Get personalized recommendations for authenticated user
router.get('/user', authenticateToken, RecommendationController.getUserRecommendations);

// Get featured jobs (public)
router.get('/featured', RecommendationController.getFeaturedJobs);

// Get trending jobs (public)
router.get('/trending', RecommendationController.getTrendingJobs);

// Get similar jobs based on a specific job (public)
router.get('/similar/:jobId', RecommendationController.getSimilarJobs);

export default router;
