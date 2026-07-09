import type { Review } from '@luxe-maison/core';
import type { ReviewRepository } from '@luxe-maison/core';
import type { Model } from 'mongoose';
import { ReviewModel } from './schemas/review.schema.js';

function toPlain<T>(doc: T | null): T | null {
  if (!doc) return null;
  return JSON.parse(JSON.stringify(doc)) as T;
}

export function createImpReviewRepository(
  model: Model<Review> = ReviewModel,
): ReviewRepository {
  return {
    async findAll() {
      const docs = await model.find().lean<Review[]>();
      return docs.map((doc) => toPlain(doc)!);
    },

    async findByProductId(productId: string) {
      const docs = await model
        .find({ productId })
        .sort({ date: -1 })
        .lean<Review[]>();
      return docs.map((doc) => toPlain(doc)!);
    },

    async findById(id: string) {
      const doc = await model.findOne({ id }).lean<Review>();
      return toPlain(doc);
    },

    async findByProductAndCustomer(productId: string, customerId: string) {
      const doc = await model.findOne({ productId, customerId }).lean<Review>();
      return toPlain(doc);
    },

    async create(review: Review) {
      const doc = await model.create(review);
      return toPlain(doc.toObject())!;
    },
  };
}
