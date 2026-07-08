import type { Hono } from 'hono';
import { analyticsData } from '@luxe-maison/database';
import { requireAuth, type AuthVariables } from '../middleware/auth.middleware.js';

export function analyticsRoutes(app: Hono<{ Variables: AuthVariables }>) {
  app.get('/api/analytics', requireAuth, async (c) => {
    return c.json(analyticsData);
  });
}
