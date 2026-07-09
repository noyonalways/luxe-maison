import type { HomepageContent, HomepageRepository } from '@luxe-maison/core';
import type { Model } from 'mongoose';
import { defaultHomepageContent, migrateHomepageContent } from '../in_memory/homepage.seed.js';
import { HOMEPAGE_ID, HomepageModel, type HomepageDocument } from './schemas/homepage.schema.js';

function toPlain<T>(doc: T | null): T | null {
  if (!doc) return null;
  return JSON.parse(JSON.stringify(doc)) as T;
}

function stripId(doc: HomepageDocument & { _id?: unknown }): HomepageContent {
  const { id: _id, _id: _mongoId, ...content } = doc;
  return content;
}

export function createImpHomepageRepository(
  model: Model<HomepageDocument> = HomepageModel,
): HomepageRepository {
  return {
    async get() {
      let doc = await model.findOne({ id: HOMEPAGE_ID }).lean<HomepageDocument & { _id?: unknown }>();
      if (!doc) {
        doc = await model.findOne().lean<HomepageDocument & { _id?: unknown }>();
      }
      if (!doc) {
        const created = await model.create({ id: HOMEPAGE_ID, ...defaultHomepageContent });
        doc = created.toObject() as HomepageDocument & { _id?: unknown };
        return stripId(doc);
      }

      if (!doc.id) {
        await model.updateOne({ _id: doc._id }, { $set: { id: HOMEPAGE_ID } });
        doc.id = HOMEPAGE_ID;
      }

      const raw = stripId(doc);
      const content = migrateHomepageContent(raw);
      const needsPersist = raw.heroSlides.some(
        (slide, index) => slide.imageUrl !== content.heroSlides[index]?.imageUrl,
      );

      if (needsPersist) {
        await model.findOneAndUpdate({ id: HOMEPAGE_ID }, { $set: { heroSlides: content.heroSlides } });
      }

      return content;
    },

    async update(updates: Partial<HomepageContent>) {
      const doc = await model
        .findOneAndUpdate(
          { id: HOMEPAGE_ID },
          { $set: updates },
          { new: true, upsert: true, setDefaultsOnInsert: true },
        )
        .lean<HomepageDocument>();
      return stripId(toPlain(doc)!);
    },

    async reset() {
      const doc = await model
        .findOneAndUpdate(
          { id: HOMEPAGE_ID },
          { $set: defaultHomepageContent },
          { new: true, upsert: true, setDefaultsOnInsert: true },
        )
        .lean<HomepageDocument>();
      return stripId(toPlain(doc)!);
    },
  };
}
