import type { Hono } from 'hono';
import type { OrderRepository } from '@luxe-maison/core';
import { createOrderService } from '@luxe-maison/core';
import { requireAuth, type AuthVariables } from '../middleware/auth.middleware.js';

export function orderRoutes(
  app: Hono<{ Variables: AuthVariables }>,
  { orderRepository }: { orderRepository: OrderRepository },
) {
  const orders = createOrderService(orderRepository);

  app.get('/api/orders', requireAuth, async (c) => {
    const list = await orders.list();
    return c.json(list);
  });

  app.get('/api/orders/track', async (c) => {
    const email = c.req.query('email');
    if (!email) return c.json({ error: 'email query parameter is required' }, 400);
    const list = await orders.getByCustomerEmail(email);
    return c.json(list);
  });

  app.get('/api/orders/:id', requireAuth, async (c) => {
    const order = await orders.getById(c.req.param('id'));
    if (!order) return c.json({ error: 'Order not found' }, 404);
    return c.json(order);
  });
}
