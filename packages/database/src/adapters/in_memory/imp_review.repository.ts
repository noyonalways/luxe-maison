import type { Review } from '@luxe-maison/core';
import type { ReviewRepository } from '@luxe-maison/core';
import { seedReviews } from './seed.js';

export function createImpReviewRepository(
  initial: Review[] = structuredClone(seedReviews),
): ReviewRepository {
  const reviews = initial;

  return {
    async findAll() {
      return [...reviews];
    },

    async findByProductId(productId: string) {
      return reviews
        .filter((r) => r.productId === productId)
        .sort((a, b) => b.date.localeCompare(a.date));
    },

    async findById(id: string) {
      return reviews.find((r) => r.id === id) ?? null;
    },

    async findByProductAndCustomer(productId: string, customerId: string) {
      return (
        reviews.find((r) => r.productId === productId && r.customerId === customerId) ?? null
      );
    },

    async create(review: Review) {
      reviews.push(review);
      return review;
    },
  };
}
