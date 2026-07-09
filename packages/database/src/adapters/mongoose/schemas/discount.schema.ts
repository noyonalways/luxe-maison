import mongoose, { Schema, model, type Model } from 'mongoose';
import type { Discount } from '@luxe-maison/core';
import { COLLECTIONS, MODEL_NAMES } from '../collection-names.js';

const discountSchema = new Schema<Discount>(
  {
    id: { type: String, required: true, unique: true, index: true },
    code: { type: String, required: true, unique: true, index: true },
    type: { type: String, required: true, enum: ['percentage', 'fixed'] },
    value: { type: Number, required: true },
    minOrder: { type: Number, required: true },
    maxUses: { type: Number, required: true },
    usedCount: { type: Number, required: true },
    status: { type: String, required: true, enum: ['active', 'expired', 'disabled'] },
    expiresAt: { type: String, required: true },
    categories: { type: [String], default: [] },
    description: { type: String, required: true },
    createdAt: { type: String, required: true },
  },
  { versionKey: false, collection: COLLECTIONS.discounts },
);

export const DiscountModel: Model<Discount> =
  mongoose.models?.[MODEL_NAMES.Discount] ??
  model<Discount>(MODEL_NAMES.Discount, discountSchema);
