import type { StoreSettings } from '@luxe-maison/core';
import type { SettingsRepository } from '@luxe-maison/core';
import type { Model } from 'mongoose';
import { defaultStoreSettings } from '../in_memory/seed.js';
import { SETTINGS_ID, SettingsModel, type SettingsDocument } from './schemas/settings.schema.js';

function toPlain<T>(doc: T | null): T | null {
  if (!doc) return null;
  return JSON.parse(JSON.stringify(doc)) as T;
}

function stripId(doc: SettingsDocument): StoreSettings {
  const { id: _id, ...settings } = doc;
  return settings;
}

export function createImpSettingsRepository(
  model: Model<SettingsDocument> = SettingsModel,
): SettingsRepository {
  return {
    async get() {
      let doc = await model.findOne({ id: SETTINGS_ID }).lean<SettingsDocument>();
      if (!doc) {
        const created = await model.create({ id: SETTINGS_ID, ...defaultStoreSettings });
        doc = created.toObject() as SettingsDocument;
      }
      return stripId(toPlain(doc)!);
    },

    async update(updates: Partial<StoreSettings>) {
      const doc = await model
        .findOneAndUpdate(
          { id: SETTINGS_ID },
          { $set: updates },
          { new: true, upsert: true, setDefaultsOnInsert: true },
        )
        .lean<SettingsDocument>();
      return stripId(toPlain(doc)!);
    },
  };
}
