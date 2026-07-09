import type { Hono } from 'hono';
import type { ReviewRepository } from '@luxe-maison/core';
import { createReviewService } from '@luxe-maison/core';
import { requireCustomerAuth, type AuthVariables } from '../middleware/auth.middleware.js';

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

  app.get('/api/reviews/mine', requireCustomerAuth, async (c) => {
    const productId = c.req.query('productId')?.trim();
    if (!productId) {
      return c.json({ status: 'error', message: 'productId is required' }, 400);
    }

    const user = c.get('user');
    const review = await reviews.getByProductAndCustomer(productId, user.id);
    if (!review) return c.json(null);
    return c.json(review);
  });

  app.get('/api/reviews/:productId/average', async (c) => {
    const result = await reviews.getAverageRating(c.req.param('productId'));
    if (!result) return c.json({ avg: 0, count: 0 });
    return c.json(result);
  });

  app.post('/api/reviews', requireCustomerAuth, async (c) => {
    const user = c.get('user');
    const body = await c.req.json<{
      productId?: string;
      rating?: number;
      text?: string;
    }>();

    const productId = body.productId?.trim();
    const rating = body.rating;
    const text = body.text?.trim();

    if (!productId || !text || rating === undefined) {
      return c.json(
        { status: 'error', message: 'productId, rating, and text are required' },
        400,
      );
    }

    if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
      return c.json({ status: 'error', message: 'rating must be between 1 and 5' }, 400);
    }

    if (text.length < 10) {
      return c.json({ status: 'error', message: 'Review must be at least 10 characters' }, 400);
    }

    const existing = await reviews.getByProductAndCustomer(productId, user.id);
    if (existing) {
      return c.json(
        { status: 'error', message: 'You have already reviewed this product' },
        409,
      );
    }

    const author = user.name?.trim() || user.email.split('@')[0] || 'Customer';

    const review = await reviews.create({
      id: `rev-${Date.now()}`,
      productId,
      customerId: user.id,
      author,
      rating,
      text,
      date: new Date().toISOString().split('T')[0]!,
    });

    return c.json(review, 201);
  });
}
