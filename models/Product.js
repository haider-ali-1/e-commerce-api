import mongoose, { Schema, model } from 'mongoose';
import { Review } from './Review.js';

const productSchema = new Schema(
  {
    user: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'name is required'],
      maxLength: [100, 'name should not be more than 100 characters'],
      trim: true,
      unique: true,
    },
    price: {
      type: Number,
      required: [true, 'price is required'],
      default: 0,
    },
    description: {
      type: String,
      required: [true, 'description is required'],
      trim: true,
    },
    image: {
      type: String,
      default: 'image.jpeg',
    },
    category: {
      type: String,
      required: [true, 'category is required'],
      enum: {
        values: ['office', 'kitchen', 'bedroom'],
        message: '{VALUE} is not supported',
      },
    },
    company: {
      type: String,
      required: [true, 'company is required'],
      enum: {
        values: ['ikea', 'liddy', 'marcos'],
        message: '{VALUE} is not supported',
      },
    },
    colors: {
      type: [String],
      default: ['#222'],
    },
    featured: {
      type: Boolean,
      default: false,
    },
    freeShipping: {
      type: Boolean,
      default: false,
    },
    inventory: {
      type: Number,
      required: true,
      default: 15,
    },
    averageRating: {
      type: Number,
      default: 0,
    },
    numOfReviews: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual Populate - set virtually for getting reviews also
productSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'product',
  justOne: false,
});

// Query Middleware
// remove reviews before delete a product
productSchema.pre('findOneAndDelete', async function (next) {
  const productId = this.getFilter()._id;
  await Review.deleteMany({ product: productId });
});

export const Product = model('Product', productSchema);
