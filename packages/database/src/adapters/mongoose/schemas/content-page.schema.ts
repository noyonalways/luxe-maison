import mongoose, { Schema, model, type Model } from 'mongoose';
import type { ContentPage } from '@luxe-maison/core';
import { COLLECTIONS, MODEL_NAMES } from '../collection-names.js';

export interface ContentPageDocument extends ContentPage {
  _id?: unknown;
}

const contentPageSchema = new Schema<ContentPageDocument>(
  {
    slug: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    body: { type: String, required: true },
    metaDescription: { type: String },
    published: { type: Boolean, required: true, default: true },
    updatedAt: { type: String, required: true },
  },
  { versionKey: false, collection: COLLECTIONS.content_pages },
);

export const ContentPageModel: Model<ContentPageDocument> =
  mongoose.models?.[MODEL_NAMES.Content_Page] ??
  model<ContentPageDocument>(MODEL_NAMES.Content_Page, contentPageSchema);
