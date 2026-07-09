import type { Review } from '@luxe-maison/shared';
import { apiFetch } from '@/lib/api/client';

export type CreateReviewPayload = {
  productId: string;
  rating: number;
  text: string;
};

export const reviewsApi = {
  listByProduct(productId: string) {
    const params = new URLSearchParams({ productId });
    return apiFetch<Review[]>(`/api/reviews?${params.toString()}`);
  },

  getAverage(productId: string) {
    return apiFetch<{ avg: number; count: number }>(`/api/reviews/${productId}/average`);
  },

  getMyReview(productId: string) {
    const params = new URLSearchParams({ productId });
    return apiFetch<Review | null>(`/api/reviews/mine?${params.toString()}`);
  },

  create(payload: CreateReviewPayload) {
    return apiFetch<Review>('/api/reviews', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
};
