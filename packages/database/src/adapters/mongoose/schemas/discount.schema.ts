import mongoose, { Schema, model, type Model } from 'mongoose';
import type { Discount } from '@luxe-maison/core';

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
  { versionKey: false },
);

export const DiscountModel: Model<Discount> =
  mongoose.models.Discount ?? model<Discount>('Discount', discountSchema);
