import { asyncErrorHandler } from '../middleware/async-error-handler.js';
import { Review } from '../models/Review.js';
import { StatusCodes } from 'http-status-codes';
import { checkOwnership } from '../middleware/authentication.js';

// @ publish review about product
// @ POST /api/v1/reviews

const createReview = asyncErrorHandler(async (req, res, next) => {
  req.body.user = req.user.userId;
  const review = await Review.create(req.body);
  res.status(StatusCodes.CREATED).json({ status: 'success', data: { review } });
});

// @ get single review
// @ GET /api/v1/reviews/:id

const getSingleReview = asyncErrorHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id);
  res.status(StatusCodes.CREATED).json({ status: 'success', data: { review } });
});

// @ update review about product
// @ PATCH /api/v1/reviews/:id

const updateReview = asyncErrorHandler(async (req, res, next) => {
  const { user, product, ...otherData } = req.body;
  const review = await Review.findById(req.params.id);

  checkOwnership(req.user, review.user);

  const updatedReview = await Review.findByIdAndUpdate(
    req.params.id,
    otherData,
    {
      new: true,
      runValidators: true,
    }
  );

  res
    .status(StatusCodes.OK)
    .json({ status: 'success', data: { review: updatedReview } });
});

// @ delete review
// @ DELETE /api/v1/reviews/:id

const deleteReview = asyncErrorHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id);

  checkOwnership(req.user, review.user);

  await Review.findByIdAndDelete(req.params.id);

  res
    .status(StatusCodes.OK)
    .json({ status: 'success', message: 'review deleted successfully' });
});

// @ get all review
// @ DELETE /api/v1/reviews

const getAllReviews = asyncErrorHandler(async (req, res, next) => {
  const reviews = await Review.find({})
    .populate({
      path: 'product',
      select: 'name price company',
    })
    .populate({
      path: 'user',
      select: 'name role',
    });
  res
    .status(StatusCodes.OK)
    .json({ status: 'success', total: reviews.length, data: { reviews } });
});

// @ get single product reviews
// @ GET /api/v1/products/:id/reviews
// @ Use Inside productRoutes.js

const getSingleProductReviews = asyncErrorHandler(async (req, res, next) => {
  const productId = req.params.id;
  const reviews = await Review.find({ product: productId });
  res
    .status(StatusCodes.OK)
    .json({ status: 'success', total: reviews.length, data: { reviews } });
});

export {
  createReview,
  getSingleReview,
  updateReview,
  deleteReview,
  getAllReviews,
  getSingleProductReviews,
};
