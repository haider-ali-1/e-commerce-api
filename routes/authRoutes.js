import express from 'express';
import { login, logout, register } from '../controllers/authController.js';
import { validateRegisterUserInput } from '../middleware/validationMiddleware.js';
import { userSchema, validateSchema } from '../middleware/zodValidation.js';

const router = express.Router();

// Public Routes

router.post('/register', validateRegisterUserInput, register);
router.post('/login', login);
router.get('/logout', logout);

export default router;
