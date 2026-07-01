import mongoose, { Schema, model, type Model } from 'mongoose';
import type { Review } from '@luxe-maison/core';

const reviewSchema = new Schema<Review>(
  {
    id: { type: String, required: true, unique: true, index: true },
    productId: { type: String, required: true, index: true },
    author: { type: String, required: true },
    rating: { type: Number, required: true },
    text: { type: String, required: true },
    date: { type: String, required: true },
  },
  { versionKey: false },
);

export const ReviewModel: Model<Review> =
  mongoose.models.Review ?? model<Review>('Review', reviewSchema);
