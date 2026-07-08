import type { Hono } from 'hono';
import type { ReviewRepository } from '@luxe-maison/core';
import { createReviewService } from '@luxe-maison/core';
import type { AuthVariables } from '../middleware/auth.middleware.js';

export function reviewRoutes(
  app: Hono<{ Variables: AuthVariables }>,
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

  app.post('/api/reviews', async (c) => {
    const body = await c.req.json<{
      productId?: string;
      author?: string;
      rating?: number;
      text?: string;
    }>();

    const productId = body.productId?.trim();
    const author = body.author?.trim();
    const rating = body.rating;
    const text = body.text?.trim();

    if (!productId || !author || !text || rating === undefined) {
      return c.json(
        { status: 'error', message: 'productId, author, rating, and text are required' },
        400,
      );
    }

    if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
      return c.json({ status: 'error', message: 'rating must be between 1 and 5' }, 400);
    }

    if (author.length < 2 || text.length < 10) {
      return c.json({ status: 'error', message: 'Invalid review content' }, 400);
    }

    const review = await reviews.create({
      id: `rev-${Date.now()}`,
      productId,
      author,
      rating,
      text,
      date: new Date().toISOString().split('T')[0]!,
    });

    return c.json(review, 201);
  });
}
