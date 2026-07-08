import type { StoreSettings } from '@luxe-maison/core';
import type { SettingsRepository } from '@luxe-maison/core';
import { DEFAULT_STORE_SETTINGS } from '@luxe-maison/core';
import { defaultStoreSettings } from './seed.js';

export function createImpSettingsRepository(
  initial: StoreSettings = structuredClone(defaultStoreSettings),
): SettingsRepository {
  let settings = initial;

  return {
    async get() {
      return { ...settings };
    },

    async update(updates: Partial<StoreSettings>) {
      settings = { ...settings, ...updates };
      return { ...settings };
    },

    async reset() {
      settings = structuredClone(DEFAULT_STORE_SETTINGS);
      return { ...settings };
    },
  };
}
