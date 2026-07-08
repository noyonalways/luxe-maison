'use client';

import { createContext, useCallback, useContext, type ReactNode } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Review } from '@luxe-maison/shared';
import { reviewsApi } from '@/lib/api/reviews.api';
import { reviewKeys } from '@/hooks/products/product-keys';
import { ApiError } from '@/lib/api/client';

interface ReviewsContextType {
  addReview: (
    productId: string,
    author: string,
    rating: number,
    text: string,
  ) => Promise<{ success: boolean; error?: string }>;
}

const ReviewsContext = createContext<ReviewsContextType | undefined>(undefined);

export function useProductReviews(productId: string) {
  return useQuery({
    queryKey: reviewKeys.byProduct(productId),
    queryFn: () => reviewsApi.listByProduct(productId),
    enabled: Boolean(productId),
    staleTime: 30_000,
  });
}

export function useProductAverage(productId: string) {
  return useQuery({
    queryKey: reviewKeys.average(productId),
    queryFn: () => reviewsApi.getAverage(productId),
    enabled: Boolean(productId),
    staleTime: 30_000,
  });
}

export function ReviewsProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: reviewsApi.create,
    onSuccess: (_review, variables) => {
      void queryClient.invalidateQueries({ queryKey: reviewKeys.byProduct(variables.productId) });
      void queryClient.invalidateQueries({ queryKey: reviewKeys.average(variables.productId) });
    },
  });

  const addReview = useCallback(
    async (productId: string, author: string, rating: number, text: string) => {
      try {
        await createMutation.mutateAsync({ productId, author, rating, text });
        return { success: true };
      } catch (err) {
        const message = err instanceof ApiError ? err.message : 'Failed to submit review';
        return { success: false, error: message };
      }
    },
    [createMutation],
  );

  return <ReviewsContext.Provider value={{ addReview }}>{children}</ReviewsContext.Provider>;
}

export function useReviewsForProduct(productId: string) {
  const reviewsQuery = useProductReviews(productId);
  const averageQuery = useProductAverage(productId);

  return {
    reviews: reviewsQuery.data ?? [],
    average: averageQuery.data && averageQuery.data.count > 0 ? averageQuery.data : null,
    isLoading: reviewsQuery.isLoading || averageQuery.isLoading,
  };
}

export function useReviews() {
  const ctx = useContext(ReviewsContext);
  if (!ctx) throw new Error('useReviews must be used within ReviewsProvider');
  return ctx;
}

export type { Review };
