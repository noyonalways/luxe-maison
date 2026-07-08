import type { AdminProduct, Product } from '@luxe-maison/core';
import { toStorefrontProduct } from '@luxe-maison/core';
import type { ProductRepository } from '@luxe-maison/core';
import type { Model } from 'mongoose';
import { ProductModel } from './schemas/product.schema.js';

function toPlain<T>(doc: T | null): T | null {
  if (!doc) return null;
  return JSON.parse(JSON.stringify(doc)) as T;
}

export function createImpProductRepository(
  model: Model<AdminProduct> = ProductModel,
): ProductRepository {
  return {
    async findAll() {
      const docs = await model.find().lean<AdminProduct[]>();
      return docs.map((doc) => toPlain(doc)!);
    },

    async findAllActive() {
      const docs = await model.find({ status: 'active' }).lean<AdminProduct[]>();
      return docs
        .map((doc) => toStorefrontProduct(toPlain(doc)!))
        .filter((product): product is Product => product !== null);
    },

    async findActiveById(id: string) {
      const doc = await model.findOne({ id, status: 'active' }).lean<AdminProduct>();
      if (!doc) return null;
      return toStorefrontProduct(toPlain(doc)!);
    },

    async findById(id: string) {
      const doc = await model.findOne({ id }).lean<AdminProduct>();
      return toPlain(doc);
    },

    async create(product: AdminProduct) {
      const doc = await model.create(product);
      return toPlain(doc.toObject())!;
    },

    async update(id: string, updates: Partial<AdminProduct>) {
      const doc = await model
        .findOneAndUpdate({ id }, { $set: updates }, { new: true })
        .lean<AdminProduct>();
      return toPlain(doc);
    },

    async delete(id: string) {
      const result = await model.deleteOne({ id });
      return result.deletedCount > 0;
    },
  };
}
