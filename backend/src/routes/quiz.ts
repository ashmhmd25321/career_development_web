import express from 'express';
import { quizController } from '@/controllers/quizController';
import { authenticateToken } from '@/middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Quiz routes
router.get('/certifications/:certificationId/questions', quizController.getQuestions);
router.post('/attempts', quizController.startQuiz);
router.post('/attempts/:attemptId/responses', quizController.submitResponse);
router.post('/attempts/:attemptId/complete', quizController.completeQuiz);
router.get('/attempts/:attemptId', quizController.getAttempt);
router.get('/attempts', quizController.getUserAttempts);

export default router;

