import type { Hono } from 'hono';
import type { SettingsRepository } from '@luxe-maison/core';
import { createSettingsService } from '@luxe-maison/core';

export function settingsRoutes(
  app: Hono,
  { settingsRepository }: { settingsRepository: SettingsRepository },
) {
  const settings = createSettingsService(settingsRepository);

  app.get('/api/settings', async (c) => {
    const data = await settings.get();
    return c.json(data);
  });
}
