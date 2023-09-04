import { Schema, model } from 'mongoose';

const reviewSchema = new Schema(
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

const Review = model('Review', reviewSchema);

export { Review };
