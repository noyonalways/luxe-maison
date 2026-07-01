import mongoose, { Schema, model, type Model } from 'mongoose';
import type { Order } from '@luxe-maison/core';

const orderItemSchema = new Schema(
  {
    productId: { type: String, required: true },
    productName: { type: String, required: true },
    size: { type: String, required: true },
    color: { type: String, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    image: { type: String, required: true },
  },
  { _id: false },
);

const orderSchema = new Schema<Order>(
  {
    id: { type: String, required: true, unique: true, index: true },
    customerName: { type: String, required: true },
    customerEmail: { type: String, required: true, index: true },
    phone: { type: String, required: true },
    shippingAddress: { type: String, required: true },
    status: {
      type: String,
      required: true,
      enum: ['pending', 'processing', 'shipped', 'delivered', 'returned'],
    },
    items: { type: [orderItemSchema], default: [] },
    subtotal: { type: Number, required: true },
    shipping: { type: Number, required: true },
    tax: { type: Number, required: true },
    total: { type: Number, required: true },
    trackingNumber: { type: String },
    carrier: { type: String },
    notes: { type: [String], default: [] },
    createdAt: { type: String, required: true },
    updatedAt: { type: String, required: true },
  },
  { versionKey: false },
);

export const OrderModel: Model<Order> =
  mongoose.models?.Order ?? model<Order>('Order', orderSchema);
