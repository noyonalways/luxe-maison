import type { Hono } from 'hono';
import type { DiscountRepository } from '@luxe-maison/core';
import { calculateDiscount, createDiscountService } from '@luxe-maison/core';

export function discountRoutes(
  app: Hono,
  { discountRepository }: { discountRepository: DiscountRepository },
) {
  const discounts = createDiscountService(discountRepository);

  app.get('/api/discounts', async (c) => {
    const list = await discounts.list();
    return c.json(list);
  });

  app.get('/api/discounts/:id', async (c) => {
    const discount = await discounts.getById(c.req.param('id'));
    if (!discount) return c.json({ error: 'Discount not found' }, 404);
    return c.json(discount);
  });

  app.post('/api/discounts/validate', async (c) => {
    const body = await c.req.json<{ code?: string; orderTotal?: number }>();
    const code = body.code;
    const orderTotal = body.orderTotal;

    if (!code || orderTotal === undefined) {
      return c.json({ error: 'code and orderTotal are required' }, 400);
    }

    const result = await discounts.validateCode(code, orderTotal);
    if (!result.valid) {
      return c.json({ valid: false, error: result.error }, 400);
    }

    const amount = calculateDiscount(result.promo!, orderTotal);
    return c.json({ valid: true, promo: result.promo, discountAmount: amount });
  });
}
