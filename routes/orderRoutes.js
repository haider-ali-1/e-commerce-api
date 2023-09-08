import express from 'express';
import { createOrder, getAllOrders } from '../controllers/orderController.js';
import {
  authenticateUser,
  authorizePermission,
} from '../middleware/authentication.js';

const router = express.Router();

router
  .route('/') //
  .post(authenticateUser, createOrder)
  .get(authenticateUser, authorizePermission('admin'), getAllOrders);

export default router;
