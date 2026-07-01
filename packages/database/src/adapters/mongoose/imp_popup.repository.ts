import type { PopupConfig } from '@luxe-maison/core';
import type { PopupRepository } from '@luxe-maison/core';
import type { Model } from 'mongoose';
import { PopupModel } from './schemas/popup.schema.js';

function toPlain<T>(doc: T | null): T | null {
  if (!doc) return null;
  return JSON.parse(JSON.stringify(doc)) as T;
}

export function createImpPopupRepository(
  model: Model<PopupConfig> = PopupModel,
): PopupRepository {
  return {
    async findAll() {
      const docs = await model.find().lean<PopupConfig[]>();
      return docs.map((doc) => toPlain(doc)!);
    },

    async findActive() {
      const docs = await model
        .find({ enabled: true })
        .sort({ priority: -1 })
        .lean<PopupConfig[]>();
      return docs.map((doc) => toPlain(doc)!);
    },

    async findById(id: string) {
      const doc = await model.findOne({ id }).lean<PopupConfig>();
      return toPlain(doc);
    },

    async create(popup: PopupConfig) {
      const doc = await model.create(popup);
      return toPlain(doc.toObject())!;
    },

    async update(id: string, updates: Partial<PopupConfig>) {
      const doc = await model
        .findOneAndUpdate({ id }, { $set: updates }, { new: true })
        .lean<PopupConfig>();
      return toPlain(doc);
    },

    async delete(id: string) {
      const result = await model.deleteOne({ id });
      return result.deletedCount > 0;
    },
  };
}
