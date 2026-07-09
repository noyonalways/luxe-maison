import type { ContentPage, ContentPageRepository, ContentPageSlug } from '@luxe-maison/core';
import { CONTENT_PAGE_SLUGS } from '@luxe-maison/core';
import type { Model } from 'mongoose';
import { defaultContentPages, getDefaultContentPage } from '../in_memory/content-page.seed.js';
import { ContentPageModel, type ContentPageDocument } from './schemas/content-page.schema.js';

function stripMongoId(doc: ContentPageDocument): ContentPage {
  const { _id, ...page } = doc;
  return page;
}

async function ensureSeeded(model: Model<ContentPageDocument>) {
  const count = await model.countDocuments();
  if (count === 0) {
    await model.insertMany(defaultContentPages);
    return;
  }

  for (const page of defaultContentPages) {
    await model.updateOne({ slug: page.slug }, { $setOnInsert: page }, { upsert: true });
  }
}

export function createImpContentPageRepository(
  model: Model<ContentPageDocument> = ContentPageModel,
): ContentPageRepository {
  return {
    async list() {
      await ensureSeeded(model);
      const docs = await model.find().lean<ContentPageDocument[]>();
      const bySlug = new Map(docs.map((doc) => [doc.slug, stripMongoId(doc)]));
      return CONTENT_PAGE_SLUGS.map((slug) => bySlug.get(slug) ?? getDefaultContentPage(slug));
    },

    async getBySlug(slug: ContentPageSlug) {
      await ensureSeeded(model);
      const doc = await model.findOne({ slug }).lean<ContentPageDocument>();
      if (!doc) return getDefaultContentPage(slug);
      return stripMongoId(doc);
    },

    async update(slug: ContentPageSlug, updates: Partial<Omit<ContentPage, 'slug'>>) {
      await ensureSeeded(model);
      const doc = await model
        .findOneAndUpdate(
          { slug },
          { $set: { ...updates, slug, updatedAt: updates.updatedAt ?? new Date().toISOString() } },
          { upsert: true, new: true },
        )
        .lean<ContentPageDocument>();
      return stripMongoId(doc!);
    },

    async reset(slug: ContentPageSlug) {
      const restored = getDefaultContentPage(slug);
      await model.findOneAndUpdate({ slug }, { $set: restored }, { upsert: true });
      return restored;
    },

    async resetAll() {
      await model.deleteMany({});
      await model.insertMany(defaultContentPages);
      return this.list();
    },
  };
}
