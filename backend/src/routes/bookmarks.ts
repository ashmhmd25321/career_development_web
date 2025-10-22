import { Router } from 'express';
import { bookmarkController } from '../controllers/bookmarkController';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

// Student can view their own bookmarks
router.get('/my-bookmarks', authenticateToken, requireRole(['student']), bookmarkController.getUserBookmarks);

// Student can create a bookmark
router.post('/', authenticateToken, requireRole(['student']), bookmarkController.createBookmark);

// Student can delete their own bookmark by ID
router.delete('/:bookmarkId', authenticateToken, requireRole(['student']), bookmarkController.deleteBookmark);

// Student can delete their own bookmark by job ID
router.delete('/job/:jobId', authenticateToken, requireRole(['student']), bookmarkController.deleteBookmarkByJobId);

// Check if job is bookmarked by current user
router.get('/job/:jobId/status', authenticateToken, requireRole(['student']), bookmarkController.isBookmarked);

// Get bookmark count for a job (public endpoint)
router.get('/job/:jobId/count', bookmarkController.getBookmarkCount);

export default router;
