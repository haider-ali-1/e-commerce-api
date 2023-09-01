import express from 'express';

import {
  getAllUsers,
  getSingleUser,
  showCurrentUser,
  updateUser,
  updateUserPassword,
} from '../controllers/userController.js';

import {
  authenticateUser,
  authorizePermission,
} from '../middleware/authentication.js';

const router = express.Router();

// Public Routes
router.use(authenticateUser);
router.route('/profile').get(showCurrentUser).patch(updateUser);
router.route('/update-password').patch(updateUserPassword);
router.route('/:id').get(getSingleUser);

router.use(authorizePermission('admin'));
router.route('/').get(getAllUsers);

// router
//   .route('/') //
//   .get(authenticateUser, authorizePermission('admin'), getAllUsers);

// router
//   .route('/profile') //
//   .get(authenticateUser, showCurrentUser);

// router
//   .route('/:id') //
//   .get(getSingleUser);

// router
//   .route('/update-password') //
//   .patch(authenticateUser, updateUserPassword);

export default router;
