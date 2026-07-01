import type { Hono } from 'hono';

export function healthRoutes(app: Hono) {
  app.get('/health', (c) => {
    return c.json({ status: 'ok', service: 'luxe-maison-restapi' });
  });
}
