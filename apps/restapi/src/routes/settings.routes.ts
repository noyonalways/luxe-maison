import type { Hono } from 'hono';
import type { SettingsRepository, StoreSettings } from '@luxe-maison/core';
import { createSettingsService } from '@luxe-maison/core';
import { requireAuth, type AuthVariables } from '../middleware/auth.middleware.js';
import { requireSection } from '../lib/role-permissions.js';

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function parseSettingsUpdates(body: Partial<StoreSettings>): Partial<StoreSettings> {
  const updates: Partial<StoreSettings> = {};

  if (body.storeName !== undefined) updates.storeName = body.storeName.trim();
  if (body.contactEmail !== undefined) updates.contactEmail = body.contactEmail.trim().toLowerCase();
  if (body.currency !== undefined) updates.currency = body.currency.trim();
  if (body.language !== undefined) updates.language = body.language.trim();
  if (body.timezone !== undefined) updates.timezone = body.timezone.trim();
  if (typeof body.maintenanceMode === 'boolean') updates.maintenanceMode = body.maintenanceMode;
  if (typeof body.orderNotifications === 'boolean') {
    updates.orderNotifications = body.orderNotifications;
  }
  if (typeof body.stockAlerts === 'boolean') updates.stockAlerts = body.stockAlerts;
  if (typeof body.newsletterAutoReply === 'boolean') {
    updates.newsletterAutoReply = body.newsletterAutoReply;
  }
  if (typeof body.lowStockThreshold === 'number') {
    updates.lowStockThreshold = body.lowStockThreshold;
  }

  return updates;
}

export function settingsRoutes(
  app: Hono<{ Variables: AuthVariables }>,
  { settingsRepository }: { settingsRepository: SettingsRepository },
) {
  const settings = createSettingsService(settingsRepository);

  app.get('/api/settings', requireAuth, requireSection('settings', 'view'), async (c) => {
    const data = await settings.get();
    return c.json(data);
  });

  app.put('/api/settings', requireAuth, requireSection('settings', 'edit'), async (c) => {
    const body = await c.req.json<Partial<StoreSettings>>();
    const updates = parseSettingsUpdates(body);

    if (updates.storeName !== undefined && !updates.storeName) {
      return c.json({ status: 'error', message: 'storeName cannot be empty' }, 400);
    }

    if (updates.contactEmail !== undefined) {
      if (!updates.contactEmail) {
        return c.json({ status: 'error', message: 'contactEmail cannot be empty' }, 400);
      }
      if (!isValidEmail(updates.contactEmail)) {
        return c.json({ status: 'error', message: 'Invalid contact email address' }, 400);
      }
    }

    if (
      updates.lowStockThreshold !== undefined &&
      (!Number.isFinite(updates.lowStockThreshold) || updates.lowStockThreshold < 1)
    ) {
      return c.json({ status: 'error', message: 'lowStockThreshold must be at least 1' }, 400);
    }

    const updated = await settings.update(updates);
    return c.json(updated);
  });

  app.post('/api/settings/reset', requireAuth, requireSection('settings', 'full'), async (c) => {
    const data = await settings.reset();
    return c.json(data);
  });
}
