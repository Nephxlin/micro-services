import { Router, RequestHandler } from 'express';
import * as authController from '../controllers/auth.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/refresh-token', authController.refreshToken);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

// Protected routes
router.use(authenticate as RequestHandler);
router.get('/profile', authController.getProfile);
router.post('/change-password', authController.changePassword);
router.post('/logout', authController.logout);

// Admin only routes
router.get('/users', authorize(['ADMIN']) as RequestHandler, (req, res) => {
  // This is a placeholder for admin functionality
  res.json({ message: 'Admin access granted' });
});

export default router; 