import type { StoreSettings } from '../entities/settings.entity.js';

export interface SettingsRepository {
  get(): Promise<StoreSettings>;
  update(updates: Partial<StoreSettings>): Promise<StoreSettings>;
}
