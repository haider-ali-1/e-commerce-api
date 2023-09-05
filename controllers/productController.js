import { StatusCodes } from 'http-status-codes';
import { asyncErrorHandler } from '../middleware/async-error-handler.js';
import { Product } from '../models/Product.js';

const createProduct = asyncErrorHandler(async (req, res, next) => {
  req.body.user = req.user.userId;
  const product = await Product.create(req.body);
  res.status(StatusCodes.OK).json({ status: 'success', data: { product } });
});

const getSingleProduct = asyncErrorHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id).populate({
    path: 'reviews',
  });
  res.status(StatusCodes.OK).json({ status: 'success', data: { product } });
});

const updateProduct = asyncErrorHandler(async (req, res, next) => {
  const updatedProduct = await Product.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  res
    .status(StatusCodes.OK)
    .json({ status: 'success', data: { product: updatedProduct } });
});

const deleteProduct = asyncErrorHandler(async (req, res, next) => {
  await Product.findByIdAndDelete(req.params.id);
  res
    .status(StatusCodes.CREATED)
    .json({ status: 'success', message: 'product deleted successfully' });
});

const getAllProducts = asyncErrorHandler(async (req, res, next) => {
  const products = await Product.find({}).populate({
    path: 'reviews',
    select: 'product rating',
  });
  res
    .status(StatusCodes.OK)
    .json({ status: 'success', total: products.length, data: { products } });
});

const uploadImage = asyncErrorHandler(async (req, res, next) => {
  res.send('file uploaded');
});

export {
  getAllProducts,
  createProduct,
  getSingleProduct,
  updateProduct,
  deleteProduct,
  uploadImage,
};
