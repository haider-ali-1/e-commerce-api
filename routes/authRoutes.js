import express from 'express';
import { login, logout, register } from '../controllers/authController.js';

const router = express.Router();

// Public Routes

router.post('/register', register);
router.post('/login', login);
router.get('/logout', logout);

export default router;
