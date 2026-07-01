import mongoose, { Schema, model, type Model } from 'mongoose';
import type { StoreSettings } from '@luxe-maison/core';

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
  { versionKey: false },
);

export const SettingsModel: Model<SettingsDocument> =
  mongoose.models.StoreSettings ??
  model<SettingsDocument>('StoreSettings', settingsSchema);

export { SETTINGS_ID };
