import type { Hono } from 'hono';
import type { SettingsRepository } from '@luxe-maison/core';
import { createSettingsService } from '@luxe-maison/core';
import { requireAuth, type AuthVariables } from '../middleware/auth.middleware.js';
import { requireSection } from '../lib/role-permissions.js';

export function settingsRoutes(
  app: Hono<{ Variables: AuthVariables }>,
  { settingsRepository }: { settingsRepository: SettingsRepository },
) {
  const settings = createSettingsService(settingsRepository);

  app.get('/api/settings', requireAuth, requireSection('settings', 'view'), async (c) => {
    const data = await settings.get();
    return c.json(data);
  });
}
