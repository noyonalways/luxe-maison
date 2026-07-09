import type { Review } from '../entities/review.entity.js';

export interface ReviewRepository {
  findAll(): Promise<Review[]>;
  findByProductId(productId: string): Promise<Review[]>;
  findById(id: string): Promise<Review | null>;
  findByProductAndCustomer(productId: string, customerId: string): Promise<Review | null>;
  create(review: Review): Promise<Review>;
}
