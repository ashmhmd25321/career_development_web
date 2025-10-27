import express from 'express';
import { skillController } from '@/controllers/skillController';
import { requireAuth, requireRole } from '@/middleware/auth';

const router = express.Router();

// Public routes
router.get('/', skillController.getAllSkills);
router.get('/categories', skillController.getCategories);
router.get('/category/:category', skillController.getSkillsByCategory);
router.get('/:id', skillController.getSkillById);

// Student routes
router.get('/user/my-skills', requireAuth, skillController.getUserSkills);
router.post('/user/add', requireAuth, skillController.addUserSkill);
router.patch('/user/:skillId/update', requireAuth, skillController.updateUserSkill);
router.patch('/user/:skillId/assess', requireAuth, skillController.assessSkill);
router.delete('/user/:skillId/remove', requireAuth, skillController.removeUserSkill);
router.get('/user/recommendations', requireAuth, skillController.getRecommendedSkills);

// Admin routes
router.post('/create', requireAuth, requireRole(['admin']), skillController.createSkill);

export default router;

