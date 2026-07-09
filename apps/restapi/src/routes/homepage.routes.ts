import type { Hono } from 'hono';
import type { HomepageContent, HomepageRepository } from '@luxe-maison/core';
import { createHomepageService } from '@luxe-maison/core';
import { requireAuth, type AuthVariables } from '../middleware/auth.middleware.js';
import { requireSection } from '../lib/role-permissions.js';

export function homepageRoutes(
  app: Hono<{ Variables: AuthVariables }>,
  { homepageRepository }: { homepageRepository: HomepageRepository },
) {
  const homepage = createHomepageService(homepageRepository);

  app.get('/api/homepage', async (c) => {
    const content = await homepage.get();
    return c.json(content);
  });

  app.get('/api/homepage/admin', requireAuth, requireSection('homepage', 'view'), async (c) => {
    const content = await homepage.get();
    return c.json(content);
  });

  app.put('/api/homepage', requireAuth, requireSection('homepage', 'edit'), async (c) => {
    const body = await c.req.json<Partial<HomepageContent>>();
    const updated = await homepage.update(body);
    return c.json(updated);
  });

  app.post('/api/homepage/reset', requireAuth, requireSection('homepage', 'full'), async (c) => {
    const content = await homepage.reset();
    return c.json(content);
  });
}
