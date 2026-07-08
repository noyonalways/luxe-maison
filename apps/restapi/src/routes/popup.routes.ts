import type { Hono } from 'hono';
import type { PopupRepository } from '@luxe-maison/core';
import { createPopupService } from '@luxe-maison/core';
import type { AuthVariables } from '../middleware/auth.middleware.js';

export function popupRoutes(
  app: Hono<{ Variables: AuthVariables }>,
  { popupRepository }: { popupRepository: PopupRepository },
) {
  const popups = createPopupService(popupRepository);

  app.get('/api/popups', async (c) => {
    const activeOnly = c.req.query('active') === 'true';
    const list = activeOnly ? await popups.listActive() : await popups.list();
    return c.json(list);
  });

  app.get('/api/popups/:id', async (c) => {
    const popup = await popups.getById(c.req.param('id'));
    if (!popup) return c.json({ error: 'Popup not found' }, 404);
    return c.json(popup);
  });
}
