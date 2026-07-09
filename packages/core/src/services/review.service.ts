import type { Review } from '../entities/review.entity.js';
import type { ReviewRepository } from '../repositories/review.repository.js';

export function createReviewService(repository: ReviewRepository) {
  return {
    list(): Promise<Review[]> {
      return repository.findAll();
    },

    getByProductId(productId: string): Promise<Review[]> {
      return repository.findByProductId(productId);
    },

    getById(id: string): Promise<Review | null> {
      return repository.findById(id);
    },

    getByProductAndCustomer(productId: string, customerId: string): Promise<Review | null> {
      return repository.findByProductAndCustomer(productId, customerId);
    },

    create(review: Review): Promise<Review> {
      return repository.create(review);
    },

    async getAverageRating(productId: string): Promise<{ avg: number; count: number } | null> {
      const reviews = await repository.findByProductId(productId);
      if (reviews.length === 0) return null;
      const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
      return { avg: Math.round(avg * 10) / 10, count: reviews.length };
    },
  };
}

export type ReviewService = ReturnType<typeof createReviewService>;
