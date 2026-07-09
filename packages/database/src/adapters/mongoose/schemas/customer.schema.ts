import mongoose, { Schema, model, type Model } from 'mongoose';
import type { Customer } from '@luxe-maison/core';
import { COLLECTIONS, MODEL_NAMES } from '../collection-names.js';

const customerSchema = new Schema<Customer>(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    phone: { type: String, required: true, default: 'Not provided' },
    address: { type: String, required: true, default: 'Not provided at signup' },
    totalOrders: { type: Number, required: true },
    totalSpent: { type: Number, required: true },
    status: { type: String, required: true, enum: ['active', 'blocked'] },
    joinedAt: { type: String, required: true },
    lastOrderAt: { type: String, required: true },
    avatar: { type: String },
    passwordHash: { type: String, select: false },
  },
  { versionKey: false, collection: COLLECTIONS.customers },
);

export const CustomerModel: Model<Customer> =
  mongoose.models?.[MODEL_NAMES.Customer] ??
  model<Customer>(MODEL_NAMES.Customer, customerSchema);
