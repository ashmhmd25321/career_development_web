import express from 'express';
import { careerPlanningController } from '@/controllers/careerPlanningController';
import { authenticateToken } from '@/middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Goals routes
router.get('/goals', careerPlanningController.getUserGoals);
router.post('/goals', careerPlanningController.createGoal);
router.get('/goals/:goalId', careerPlanningController.getGoalById);
router.patch('/goals/:goalId', careerPlanningController.updateGoal);
router.patch('/goals/:goalId/progress', careerPlanningController.updateGoalProgress);
router.delete('/goals/:goalId', careerPlanningController.deleteGoal);

// Milestones routes
router.get('/goals/:goalId/milestones', careerPlanningController.getGoalMilestones);
router.post('/milestones', careerPlanningController.createMilestone);
router.patch('/milestones/:milestoneId', careerPlanningController.updateMilestone);
router.delete('/milestones/:milestoneId', careerPlanningController.deleteMilestone);

// Statistics route
router.get('/stats', careerPlanningController.getCareerStats);

export default router;

