import { Router } from 'express';
import {
  createReview,
  getSingleReview,
  updateReview,
  deleteReview,
  getAllReviews,
} from '../controllers/reviewController.js';
import { authenticateUser } from '../middleware/authentication.js';

const router = Router();

router //
  .route('/')
  .post(authenticateUser, createReview)
  .get(getAllReviews);

router
  .route('/:id')
  .get(getSingleReview)
  .patch(authenticateUser, updateReview)
  .delete(authenticateUser, deleteReview);

export default router;
