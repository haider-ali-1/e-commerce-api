import mongoose, { Schema, model, Model } from 'mongoose';

const orderSchema = new Schema({
  tax: {
    type: Number,
    required: true,
  },
});

orderSchema.statics.calculateShippingFee = function (order) {
  console.log(order);
  return order.tax;
};

const Order = model('Order', orderSchema);

const order = new Order({ tax: 15 });

const shippingTax = await Order.calculateShippingFee(order);
console.log(shippingTax);
