import express from 'express';

import {
  getAllUsers,
  getSingleUser,
  showCurrentUser,
  updateUserPassword,
} from '../controllers/userController.js';

import {
  authenticateUser,
  authorizePermission,
} from '../middleware/authentication.js';

const router = express.Router();

router
  .route('/') //
  .get(authenticateUser, authorizePermission('admin'), getAllUsers);

router
  .route('/profile') //
  .get(authenticateUser, showCurrentUser);

router
  .route('/:id') //
  .get(getSingleUser);

router
  .route('/update-password') //
  .patch(authenticateUser, updateUserPassword);

export default router;
