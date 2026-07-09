import mongoose, { Schema, model, type Model } from 'mongoose';
import type { HomepageContent } from '@luxe-maison/core';

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
  { versionKey: false },
);

export const HomepageModel: Model<HomepageDocument> =
  mongoose.models?.HomepageContent ??
  model<HomepageDocument>('HomepageContent', homepageSchema);
