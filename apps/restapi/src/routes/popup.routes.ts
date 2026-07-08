import type { Hono } from 'hono';
import type { PopupConfig, PopupRepository, PopupTrigger, PopupType } from '@luxe-maison/core';
import { createPopupService } from '@luxe-maison/core';
import { requireAuth, type AuthVariables } from '../middleware/auth.middleware.js';
import { requireSection } from '../lib/role-permissions.js';

const POPUP_TYPES: PopupType[] = ['welcome', 'discount', 'campaign'];
const POPUP_TRIGGERS: PopupTrigger[] = ['page_load', 'exit_intent', 'scroll_50', 'delay_10s'];

function isPopupType(value: unknown): value is PopupType {
  return typeof value === 'string' && POPUP_TYPES.includes(value as PopupType);
}

function isPopupTrigger(value: unknown): value is PopupTrigger {
  return typeof value === 'string' && POPUP_TRIGGERS.includes(value as PopupTrigger);
}

function parsePopupInput(body: Partial<PopupConfig>): Partial<PopupConfig> {
  const updates: Partial<PopupConfig> = {};

  if (body.title !== undefined) updates.title = body.title.trim();
  if (body.message !== undefined) updates.message = body.message.trim();
  if (body.discountCode !== undefined) updates.discountCode = body.discountCode.trim().toUpperCase();
  if (body.ctaText !== undefined) updates.ctaText = body.ctaText.trim();
  if (body.ctaLink !== undefined) updates.ctaLink = body.ctaLink.trim();
  if (isPopupTrigger(body.trigger)) updates.trigger = body.trigger;
  if (typeof body.priority === 'number') updates.priority = body.priority;
  if (typeof body.enabled === 'boolean') updates.enabled = body.enabled;

  return updates;
}

export function popupRoutes(
  app: Hono<{ Variables: AuthVariables }>,
  { popupRepository }: { popupRepository: PopupRepository },
) {
  const popups = createPopupService(popupRepository);

  app.get('/api/popups/active', async (c) => {
    const list = await popups.listActive();
    return c.json(list);
  });

  app.get('/api/popups', requireAuth, requireSection('popup', 'view'), async (c) => {
    const list = await popups.list();
    return c.json(list);
  });

  app.get('/api/popups/:id', requireAuth, requireSection('popup', 'view'), async (c) => {
    const popup = await popups.getById(c.req.param('id'));
    if (!popup) return c.json({ error: 'Popup not found' }, 404);
    return c.json(popup);
  });

  app.post('/api/popups', requireAuth, requireSection('popup', 'edit'), async (c) => {
    const body = await c.req.json<Partial<PopupConfig>>();

    if (!isPopupType(body.type)) {
      return c.json({ status: 'error', message: 'Invalid popup type' }, 400);
    }

    const title = body.title?.trim() || 'Untitled';
    const message = body.message?.trim() || '';

    const popup: PopupConfig = {
      id: body.id || `popup-${Date.now()}`,
      type: body.type,
      enabled: Boolean(body.enabled),
      title,
      message,
      discountCode: body.discountCode?.trim().toUpperCase() || '',
      ctaText: body.ctaText?.trim() || 'Shop Now',
      ctaLink: body.ctaLink?.trim() || '/shop',
      trigger: isPopupTrigger(body.trigger) ? body.trigger : 'page_load',
      priority: typeof body.priority === 'number' ? body.priority : 1,
    };

    const created = await popups.create(popup);
    return c.json(created, 201);
  });

  app.put('/api/popups/:id', requireAuth, requireSection('popup', 'edit'), async (c) => {
    const id = c.req.param('id');
    const body = await c.req.json<Partial<PopupConfig>>();
    const updates = parsePopupInput(body);

    if (updates.title !== undefined && !updates.title) {
      return c.json({ status: 'error', message: 'title cannot be empty' }, 400);
    }

    if (updates.message !== undefined && !updates.message) {
      return c.json({ status: 'error', message: 'message cannot be empty' }, 400);
    }

    const updated = await popups.update(id, updates);
    if (!updated) return c.json({ error: 'Popup not found' }, 404);
    return c.json(updated);
  });

  app.patch('/api/popups/:id/enabled', requireAuth, requireSection('popup', 'edit'), async (c) => {
    const id = c.req.param('id');
    const body = await c.req.json<{ enabled?: boolean }>();

    if (typeof body.enabled !== 'boolean') {
      return c.json({ status: 'error', message: 'enabled must be a boolean' }, 400);
    }

    const existing = await popups.getById(id);
    if (!existing) return c.json({ error: 'Popup not found' }, 404);

    if (body.enabled && (!existing.title.trim() || !existing.message.trim())) {
      return c.json(
        { status: 'error', message: 'Add a title and message before enabling this popup' },
        400,
      );
    }

    const updated = await popups.update(id, { enabled: body.enabled });
    if (!updated) return c.json({ error: 'Popup not found' }, 404);
    return c.json(updated);
  });

  app.delete('/api/popups/:id', requireAuth, requireSection('popup', 'full'), async (c) => {
    const deleted = await popups.delete(c.req.param('id'));
    if (!deleted) return c.json({ error: 'Popup not found' }, 404);
    return c.json({ status: 'ok' });
  });
}
