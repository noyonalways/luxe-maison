import mongoose, { Schema, model, type Model } from 'mongoose';
import type { Customer } from '@luxe-maison/core';

const customerSchema = new Schema<Customer>(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    totalOrders: { type: Number, required: true },
    totalSpent: { type: Number, required: true },
    status: { type: String, required: true, enum: ['active', 'blocked'] },
    joinedAt: { type: String, required: true },
    lastOrderAt: { type: String, required: true },
    avatar: { type: String },
  },
  { versionKey: false },
);

export const CustomerModel: Model<Customer> =
  mongoose.models?.Customer ?? model<Customer>('Customer', customerSchema);
