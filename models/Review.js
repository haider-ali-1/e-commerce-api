import { Schema, model } from 'mongoose';

const ReviewSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    rating: {
      type: Number,
      required: [true, 'rating is required'],
      min: 1,
      max: 5,
    },
    title: {
      type: String,
      required: [true, 'title is required'],
      maxLength: 100,
    },
    comment: {
      type: String,
      required: [true, 'comment is required'],
    },
  },
  {
    timestamps: true,
  }
);

ReviewSchema.statics.updateProductStats = async function (productId) {
  console.log(productId);
  const Review = this; // this refers to Model
  const Product = model('Product');
  const data = await Review.aggregate([
    { $match: { product: productId } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        numOfReviews: { $sum: 1 },
      },
    },
  ]);
  const { numOfReviews, averageRating } = data[0] || {};
  await Product.findByIdAndUpdate(productId, {
    numOfReviews,
    averageRating: Math.ceil(averageRating),
  });
};

ReviewSchema.post('findOneAndDelete', async function (doc) {
  await this.model.updateProductStats(doc.product); // this refers to Query Object
});

ReviewSchema.post('save', async function (doc) {
  await this.constructor.updateProductStats(doc.product); // this refers to Document
});

const Review = model('Review', ReviewSchema);

export { Review };
