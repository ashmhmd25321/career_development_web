import { Router } from 'express';
import { jobCategoryController } from '@/controllers/jobCategoryController';
import { authenticateToken, requireRole } from '@/middleware/auth';

const router = Router();

// Public routes (no authentication required)
router.get('/', jobCategoryController.getCategories); // Get all job categories
router.get('/:id', jobCategoryController.getCategoryById); // Get job category by ID

// Protected routes (authentication required)
router.use(authenticateToken); // Apply authentication middleware to all routes below

// Admin routes
router.post('/', requireRole(['admin']), jobCategoryController.createCategory);
router.put('/:id', requireRole(['admin']), jobCategoryController.updateCategory);
router.delete('/:id', requireRole(['admin']), jobCategoryController.deleteCategory);

export default router;
