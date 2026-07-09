import type { Hono } from 'hono';
import type {
  CampaignRepository,
  CustomerRepository,
  OrderRepository,
  ProductRepository,
} from '@luxe-maison/core';
import { createAnalyticsService } from '@luxe-maison/core';
import { requireAuth, type AuthVariables } from '../middleware/auth.middleware.js';
import { requireSection } from '../lib/role-permissions.js';

export function analyticsRoutes(
  app: Hono<{ Variables: AuthVariables }>,
  {
    orderRepository,
    productRepository,
    customerRepository,
    campaignRepository,
  }: {
    orderRepository: OrderRepository;
    productRepository: ProductRepository;
    customerRepository: CustomerRepository;
    campaignRepository: CampaignRepository;
  },
) {
  const analytics = createAnalyticsService({
    orderRepository,
    productRepository,
    customerRepository,
    campaignRepository,
  });

  app.get('/api/analytics', requireAuth, requireSection('analytics', 'view'), async (c) => {
    const data = await analytics.getAnalytics();
    return c.json(data);
  });
}
