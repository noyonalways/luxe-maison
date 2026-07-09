import mongoose, { Schema, model, type Model } from 'mongoose';
import type { HomepageContent } from '@luxe-maison/core';
import { COLLECTIONS, MODEL_NAMES } from '../collection-names.js';

export const HOMEPAGE_ID = 'default';

export interface HomepageDocument extends HomepageContent {
  id: string;
}

const homepageSchema = new Schema<HomepageDocument>(
  {
    id: { type: String, required: true, unique: true, default: HOMEPAGE_ID },
    heroSlides: { type: Schema.Types.Mixed, required: true },
    categoriesSection: { type: Schema.Types.Mixed, required: true },
    categoryTiles: { type: Schema.Types.Mixed, required: true },
    storySection: { type: Schema.Types.Mixed, required: true },
    newsletterSection: { type: Schema.Types.Mixed, required: true },
  },
  { versionKey: false, collection: COLLECTIONS.homepage_contents },
);

export const HomepageModel: Model<HomepageDocument> =
  mongoose.models?.[MODEL_NAMES.Homepage_Content] ??
  model<HomepageDocument>(MODEL_NAMES.Homepage_Content, homepageSchema);
