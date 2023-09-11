import express from 'express';
import {
  createOrder,
  getAllOrders,
  getSingleOrder,
  getCurrentUserOrders,
  updateOrder,
} from '../controllers/orderController.js';
import {
  authenticateUser,
  authorizePermission,
} from '../middleware/authentication.js';

const router = express.Router();

router
  .route('/') //
  .post(authenticateUser, createOrder)
  .get(authenticateUser, authorizePermission('admin'), getAllOrders);

router
  .route('/my-orders') //
  .get(authenticateUser, getCurrentUserOrders);

router
  .route('/:id') //
  .get(authenticateUser, getSingleOrder)
  .patch(authenticateUser, updateOrder);

export default router;
