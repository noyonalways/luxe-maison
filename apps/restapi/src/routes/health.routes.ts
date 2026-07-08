import type { Hono } from 'hono';
import type { AuthVariables } from '../middleware/auth.middleware.js';

export function healthRoutes(app: Hono<{ Variables: AuthVariables }>) {
  app.get('/health', (c) => {
    return c.json({ status: 'ok', service: 'luxe-maison-restapi' });
  });
}
