import type { Hono } from 'hono';
import type { ReviewRepository } from '@luxe-maison/core';
import { createReviewService } from '@luxe-maison/core';

export function reviewRoutes(
  app: Hono,
  { reviewRepository }: { reviewRepository: ReviewRepository },
) {
  const reviews = createReviewService(reviewRepository);

  app.get('/api/reviews', async (c) => {
    const productId = c.req.query('productId');
    if (productId) {
      const list = await reviews.getByProductId(productId);
      return c.json(list);
    }
    const list = await reviews.list();
    return c.json(list);
  });

  app.get('/api/reviews/:productId/average', async (c) => {
    const result = await reviews.getAverageRating(c.req.param('productId'));
    if (!result) return c.json({ avg: 0, count: 0 });
    return c.json(result);
  });
}
