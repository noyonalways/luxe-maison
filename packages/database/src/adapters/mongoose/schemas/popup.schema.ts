import mongoose, { Schema, model, type Model } from 'mongoose';
import type { PopupConfig } from '@luxe-maison/core';
import { COLLECTIONS, MODEL_NAMES } from '../collection-names.js';

const popupSchema = new Schema<PopupConfig>(
  {
    id: { type: String, required: true, unique: true, index: true },
    type: { type: String, required: true, enum: ['welcome', 'discount', 'campaign'] },
    enabled: { type: Boolean, required: true },
    title: { type: String, default: '' },
    message: { type: String, default: '' },
    discountCode: { type: String, default: '' },
    ctaText: { type: String, required: true, default: 'Shop Now' },
    ctaLink: { type: String, required: true, default: '/shop' },
    trigger: {
      type: String,
      required: true,
      enum: ['page_load', 'exit_intent', 'scroll_50', 'delay_10s'],
    },
    priority: { type: Number, required: true },
  },
  { versionKey: false, collection: COLLECTIONS.popup_configs },
);

export const PopupModel: Model<PopupConfig> =
  mongoose.models?.[MODEL_NAMES.Popup_Config] ??
  model<PopupConfig>(MODEL_NAMES.Popup_Config, popupSchema);
