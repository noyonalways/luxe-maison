import type { Hono } from 'hono';
import { analyticsData } from '@luxe-maison/database';
import { requireAuth, type AuthVariables } from '../middleware/auth.middleware.js';
import { requireSection } from '../lib/role-permissions.js';

export function analyticsRoutes(app: Hono<{ Variables: AuthVariables }>) {
  app.get('/api/analytics', requireAuth, requireSection('analytics', 'view'), async (c) => {
    return c.json(analyticsData);
  });
}
