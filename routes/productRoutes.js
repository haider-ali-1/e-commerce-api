import express from 'express';
import upload from '../middleware/multer.js';
import {
  authenticateUser,
  authorizePermission,
} from '../middleware/authentication.js';
import {
  createProduct,
  deleteProduct,
  getAllProducts,
  getSingleProduct,
  updateProduct,
  uploadImage,
} from '../controllers/productController.js';
import { getSingleProductReviews } from '../controllers/reviewController.js';

const router = express.Router();

router
  .route('/')
  .get(getAllProducts)
  .post(authenticateUser, authorizePermission('admin'), createProduct);

router
  .route('/upload-image')
  .post(
    authenticateUser,
    authorizePermission('admin'),
    upload.single('file'),
    uploadImage
  );

router
  .route('/:id')
  .get(getSingleProduct)
  .patch(authenticateUser, authorizePermission('admin'), updateProduct)
  .delete(authenticateUser, authorizePermission('admin'), deleteProduct);

router.route('/:id/reviews').get(getSingleProductReviews);
export default router;
