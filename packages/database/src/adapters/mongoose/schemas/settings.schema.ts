import mongoose, { Schema, model, type Model } from 'mongoose';
import type { StoreSettings } from '@luxe-maison/core';
import { COLLECTIONS, MODEL_NAMES } from '../collection-names.js';

const SETTINGS_ID = 'default';

export interface SettingsDocument extends StoreSettings {
  id: string;
}

const settingsSchema = new Schema<SettingsDocument>(
  {
    id: { type: String, required: true, unique: true, default: SETTINGS_ID },
    storeName: { type: String, required: true },
    contactEmail: { type: String, required: true },
    currency: { type: String, required: true },
    language: { type: String, required: true },
    maintenanceMode: { type: Boolean, required: true },
    orderNotifications: { type: Boolean, required: true },
    stockAlerts: { type: Boolean, required: true },
    newsletterAutoReply: { type: Boolean, required: true },
    lowStockThreshold: { type: Number, required: true },
    timezone: { type: String, required: true },
  },
  { versionKey: false, collection: COLLECTIONS.store_settings },
);

export const SettingsModel: Model<SettingsDocument> =
  mongoose.models?.[MODEL_NAMES.Store_Settings] ??
  model<SettingsDocument>(MODEL_NAMES.Store_Settings, settingsSchema);

export { SETTINGS_ID };
