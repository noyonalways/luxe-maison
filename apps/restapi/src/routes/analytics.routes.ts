import type { Hono } from 'hono';
import { analyticsData } from '@luxe-maison/database';

export function analyticsRoutes(app: Hono) {
  app.get('/api/analytics', async (c) => {
    return c.json(analyticsData);
  });
}
