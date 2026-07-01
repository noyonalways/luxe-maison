import type { Order } from '@luxe-maison/core';
import type { OrderRepository } from '@luxe-maison/core';
import type { Model } from 'mongoose';
import { OrderModel } from './schemas/order.schema.js';

function toPlain<T>(doc: T | null): T | null {
  if (!doc) return null;
  return JSON.parse(JSON.stringify(doc)) as T;
}

export function createImpOrderRepository(model: Model<Order> = OrderModel): OrderRepository {
  return {
    async findAll() {
      const docs = await model.find().lean<Order[]>();
      return docs.map((doc) => toPlain(doc)!);
    },

    async findById(id: string) {
      const doc = await model.findOne({ id }).lean<Order>();
      return toPlain(doc);
    },

    async findByCustomerEmail(email: string) {
      const normalized = email.toLowerCase();
      const docs = await model
        .find({ customerEmail: { $regex: new RegExp(`^${normalized}$`, 'i') } })
        .lean<Order[]>();
      return docs.map((doc) => toPlain(doc)!);
    },

    async updateStatus(id: string, status: Order['status']) {
      const doc = await model
        .findOneAndUpdate(
          { id },
          { $set: { status, updatedAt: new Date().toISOString() } },
          { new: true },
        )
        .lean<Order>();
      return toPlain(doc);
    },
  };
}
