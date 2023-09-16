import express from 'express';
import { authenticateUser } from '../middleware/authentication.js';
import {
  forgotPassword,
  login,
  logout,
  register,
  resetPassword,
  verifyEmail,
} from '../controllers/authController.js';

const router = express.Router();

// Public Routes

router.post('/register', register);
router.post('/login', login);
router.get('/logout', authenticateUser, logout);
router.post('/verify-email/:token', verifyEmail);
router.post('/forgot-password', forgotPassword);
router.patch('/reset-password/:token', resetPassword);

export default router;
