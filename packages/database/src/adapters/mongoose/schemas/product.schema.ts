import mongoose, { Schema, model, type Model } from 'mongoose';
import type { AdminProduct } from '@luxe-maison/core';

const productColorSchema = new Schema(
  {
    name: { type: String, required: true },
    hex: { type: String, required: true },
  },
  { _id: false },
);

const productSchema = new Schema<AdminProduct>(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    originalPrice: { type: Number },
    section: { type: String, required: true },
    category: { type: String, required: true },
    fit: { type: String, required: true },
    fabric: { type: String, required: true },
    season: { type: String, required: true },
    colors: { type: [productColorSchema], default: [] },
    sizes: { type: [String], default: [] },
    images: { type: [String], default: [] },
    description: { type: String, required: true },
    details: { type: [String], default: [] },
    badge: { type: String },
    rating: { type: Number, required: true },
    reviews: { type: Number, required: true },
    sku: { type: String, required: true },
    stock: { type: Number, required: true },
    tags: { type: [String], default: [] },
    seoTitle: { type: String, required: true },
    seoDescription: { type: String, required: true },
    status: { type: String, required: true, enum: ['active', 'draft', 'archived'] },
    createdAt: { type: String, required: true },
  },
  { versionKey: false },
);

export const ProductModel: Model<AdminProduct> =
  mongoose.models.Product ?? model<AdminProduct>('Product', productSchema);
