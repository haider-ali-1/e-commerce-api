import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { asyncErrorHandler } from '../middleware/async-error-handler.js';
import { BadRequestError } from '../utils/custom-errors.js';
import { StatusCodes } from 'http-status-codes';

const createOrder = asyncErrorHandler(async (req, res, next) => {
  // tax, shippingFee, items, totalAmount
  const { tax, shippingFee, cartItems } = req.body;

  let orderItems = [];
  let totalAmount = 0;

  for (const item of cartItems) {
    //check if product exist
    const product = await Product.findById(item.product);
    if (!product)
      throw new BadRequestError(`cannot find product with id: ${item.product}`);

    // get products props
    const { name, image, price, _id } = product;

    const quantity = item.quantity;

    const orderItem = {
      name,
      image,
      price,
      quantity,
      subTotal: price * quantity,
      product: _id,
    };

    orderItems.push(orderItem);
    totalAmount += orderItem.subTotal;
  }

  const order = await Order.create({
    user: req.user.userId,
    tax,
    shippingFee,
    orderItems,
    totalAmount: (totalAmount + tax + shippingFee).toFixed(2),
    paymentIntentId: 'blahblah',
  });

  res.status(StatusCodes.CREATED).json({ status: 'success', data: { order } });
});

const getAllOrders = asyncErrorHandler(async (req, res, next) => {
  const orders = await Order.find({});
  res.status(StatusCodes.OK).json({ status: 'success', data: { orders } });
});

export { createOrder, getAllOrders };
