import type { Hono } from 'hono';
import type { ContentPageRepository } from '@luxe-maison/core';
import { createContentPageService, isContentPageSlug } from '@luxe-maison/core';
import { requireAuth, type AuthVariables } from '../middleware/auth.middleware.js';
import { requireSection } from '../lib/role-permissions.js';

export function contentPageRoutes(
  app: Hono<{ Variables: AuthVariables }>,
  { contentPageRepository }: { contentPageRepository: ContentPageRepository },
) {
  const pages = createContentPageService(contentPageRepository);

  app.get('/api/pages/:slug', async (c) => {
    const slug = c.req.param('slug');
    if (!isContentPageSlug(slug)) {
      return c.json({ status: 'error', message: 'Page not found' }, 404);
    }
    const page = await pages.getPublishedBySlug(slug);
    if (!page) {
      return c.json({ status: 'error', message: 'Page not found' }, 404);
    }
    return c.json(page);
  });

  app.get('/api/pages/admin/list', requireAuth, requireSection('pages', 'view'), async (c) => {
    const list = await pages.list();
    return c.json(list);
  });

  app.get('/api/pages/admin/:slug', requireAuth, requireSection('pages', 'view'), async (c) => {
    const slug = c.req.param('slug');
    if (!isContentPageSlug(slug)) {
      return c.json({ status: 'error', message: 'Page not found' }, 404);
    }
    const page = await pages.getBySlug(slug);
    if (!page) {
      return c.json({ status: 'error', message: 'Page not found' }, 404);
    }
    return c.json(page);
  });

  app.put('/api/pages/:slug', requireAuth, requireSection('pages', 'edit'), async (c) => {
    const slug = c.req.param('slug');
    if (!isContentPageSlug(slug)) {
      return c.json({ status: 'error', message: 'Page not found' }, 404);
    }
    const body = await c.req.json<{
      title?: string;
      body?: string;
      metaDescription?: string;
      published?: boolean;
    }>();
    const updated = await pages.update(slug, body);
    return c.json(updated);
  });

  app.post('/api/pages/:slug/reset', requireAuth, requireSection('pages', 'full'), async (c) => {
    const slug = c.req.param('slug');
    if (!isContentPageSlug(slug)) {
      return c.json({ status: 'error', message: 'Page not found' }, 404);
    }
    const restored = await pages.reset(slug);
    return c.json(restored);
  });
}
