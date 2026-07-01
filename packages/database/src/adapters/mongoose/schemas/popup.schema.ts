import mongoose, { Schema, model, type Model } from 'mongoose';
import type { PopupConfig } from '@luxe-maison/core';

const popupSchema = new Schema<PopupConfig>(
  {
    id: { type: String, required: true, unique: true, index: true },
    type: { type: String, required: true, enum: ['welcome', 'discount', 'campaign'] },
    enabled: { type: Boolean, required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    discountCode: { type: String, required: true },
    ctaText: { type: String, required: true },
    ctaLink: { type: String, required: true },
    trigger: {
      type: String,
      required: true,
      enum: ['page_load', 'exit_intent', 'scroll_50', 'delay_10s'],
    },
    priority: { type: Number, required: true },
  },
  { versionKey: false },
);

export const PopupModel: Model<PopupConfig> =
  mongoose.models.PopupConfig ?? model<PopupConfig>('PopupConfig', popupSchema);
