import type { StoreSettings } from '../entities/settings.entity.js';
import { DEFAULT_STORE_SETTINGS } from '../entities/settings.entity.js';
import type { SettingsRepository } from '../repositories/settings.repository.js';

export function createSettingsService(repository: SettingsRepository) {
  return {
    get(): Promise<StoreSettings> {
      return repository.get();
    },

    update(updates: Partial<StoreSettings>): Promise<StoreSettings> {
      return repository.update(updates);
    },

    reset(): Promise<StoreSettings> {
      return repository.reset();
    },
  };
}

export type SettingsService = ReturnType<typeof createSettingsService>;
export { DEFAULT_STORE_SETTINGS };
