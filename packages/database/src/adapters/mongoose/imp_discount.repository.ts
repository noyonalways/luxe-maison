import type { Discount } from '@luxe-maison/core';
import type { DiscountRepository } from '@luxe-maison/core';
import type { Model } from 'mongoose';
import { DiscountModel } from './schemas/discount.schema.js';

function toPlain<T>(doc: T | null): T | null {
  if (!doc) return null;
  return JSON.parse(JSON.stringify(doc)) as T;
}

export function createImpDiscountRepository(
  model: Model<Discount> = DiscountModel,
): DiscountRepository {
  return {
    async findAll() {
      const docs = await model.find().lean<Discount[]>();
      return docs.map((doc) => toPlain(doc)!);
    },

    async findById(id: string) {
      const doc = await model.findOne({ id }).lean<Discount>();
      return toPlain(doc);
    },

    async findByCode(code: string) {
      const normalized = code.toUpperCase().trim();
      const doc = await model
        .findOne({ code: { $regex: new RegExp(`^${normalized}$`, 'i') } })
        .lean<Discount>();
      return toPlain(doc);
    },

    async create(discount: Discount) {
      const doc = await model.create(discount);
      return toPlain(doc.toObject())!;
    },

    async update(id: string, updates: Partial<Discount>) {
      const doc = await model
        .findOneAndUpdate({ id }, { $set: updates }, { new: true })
        .lean<Discount>();
      return toPlain(doc);
    },

    async delete(id: string) {
      const result = await model.deleteOne({ id });
      return result.deletedCount > 0;
    },

    async incrementUsedCount(id: string) {
      const doc = await model
        .findOneAndUpdate({ id }, { $inc: { usedCount: 1 } }, { new: true })
        .lean<Discount>();
      return toPlain(doc);
    },
  };
}
