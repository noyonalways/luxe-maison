import mongoose, { Schema, model, type Model } from 'mongoose';
import type { Review } from '@luxe-maison/core';
import { COLLECTIONS, MODEL_NAMES } from '../collection-names.js';

const reviewSchema = new Schema<Review>(
  {
    id: { type: String, required: true, unique: true, index: true },
    productId: { type: String, required: true, index: true },
    author: { type: String, required: true },
    rating: { type: Number, required: true },
    text: { type: String, required: true },
    date: { type: String, required: true },
  },
  { versionKey: false, collection: COLLECTIONS.reviews },
);

export const ReviewModel: Model<Review> =
  mongoose.models?.[MODEL_NAMES.Review] ?? model<Review>(MODEL_NAMES.Review, reviewSchema);
