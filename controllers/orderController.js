import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { asyncErrorHandler } from '../middleware/async-error-handler.js';
import { BadRequestError } from '../utils/custom-errors.js';
import { StatusCodes } from 'http-status-codes';

const createOrder = asyncErrorHandler(async (req, res, next) => {
  // tax, shippingFee, items, totalAmount
  const { tax, shippingFee, orderItems: cartItems } = req.body;

  const orderItems = await Promise.all(
    cartItems.map(async (orderItem) => {
      const product = await Product.findById(orderItem.product);
      if (!product)
        throw new BadRequestError(
          `cannot find product with id: ${item.product}`
        );
      const { name, image, price, _id } = product;

      const quantity = orderItem.quantity;
      return {
        name,
        image,
        price,
        quantity,
        subTotal: price * quantity,
        product: _id,
      };
    })
  );

  const totalAmount = orderItems.reduce((acc, current) => {
    return acc + current.subTotal;
  }, tax + shippingFee);

  const order = await Order.create({
    user: req.user.userId,
    tax,
    shippingFee,
    orderItems,
    totalAmount,
    paymentIntentId: 'blahblah',
  });

  res.status(StatusCodes.CREATED).json({ status: 'success', data: { order } });
});

const getAllOrders = asyncErrorHandler(async (req, res, next) => {
  const orders = await Order.find({});
  res.status(StatusCodes.OK).json({ status: 'success', data: { orders } });
});

export { createOrder, getAllOrders };
