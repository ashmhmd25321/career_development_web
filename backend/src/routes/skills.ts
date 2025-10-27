import express from 'express';
import { skillController } from '@/controllers/skillController';
import { authenticateToken, requireRole } from '@/middleware/auth';

const router = express.Router();

// Public routes
router.get('/', skillController.getAllSkills);
router.get('/categories', skillController.getCategories);
router.get('/category/:category', skillController.getSkillsByCategory);
router.get('/:id', skillController.getSkillById);

// Student routes
router.get('/user/my-skills', authenticateToken, skillController.getUserSkills);
router.post('/user/add', authenticateToken, skillController.addUserSkill);
router.patch('/user/:skillId/update', authenticateToken, skillController.updateUserSkill);
router.patch('/user/:skillId/assess', authenticateToken, skillController.assessSkill);
router.delete('/user/:skillId/remove', authenticateToken, skillController.removeUserSkill);
router.get('/user/recommendations', authenticateToken, skillController.getRecommendedSkills);

// Admin routes
router.post('/create', authenticateToken, requireRole(['admin']), skillController.createSkill);

export default router;

