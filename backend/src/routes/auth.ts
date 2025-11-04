import { Router } from 'express';
import { AuthController } from '@/controllers/authController';
import { authenticateToken, requireVerified } from '@/middleware/auth';

const router = Router();

// Public routes
router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.post('/refresh', AuthController.refreshToken);
router.post('/logout', AuthController.logout);
router.get('/verify/:token', AuthController.verifyEmail);
router.post('/forgot-password', AuthController.requestPasswordReset);
router.post('/reset-password', AuthController.resetPassword);

// Protected routes
router.get('/profile', authenticateToken, AuthController.getProfile);
router.put('/profile', authenticateToken, AuthController.updateProfile);
router.get('/users', authenticateToken, AuthController.getAllUsers);
router.patch('/users/:userId/status', authenticateToken, AuthController.updateUserStatus);

export default router;
