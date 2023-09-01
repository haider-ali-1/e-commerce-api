import express from 'express';
import { login, logout, register } from '../controllers/authController.js';
import { validateRegisterUserInput } from '../middleware/validationMiddleware.js';
// import { userSchema, validateSchema } from '../middleware/zodValidation.js';
import {
  validate,
  userSchema,
  loginUserSchema,
} from '../middleware/joiValidation.js';

const router = express.Router();

// Public Routes

router.post('/register', validate(userSchema), register);
router.post('/login', validate(loginUserSchema), login);
router.get('/logout', logout);

export default router;
