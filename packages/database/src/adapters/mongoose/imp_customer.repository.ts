import type { Customer } from '@luxe-maison/core';
import type { CustomerRepository } from '@luxe-maison/core';
import type { Model } from 'mongoose';
import { CustomerModel } from './schemas/customer.schema.js';

function toPlain<T>(doc: T | null): T | null {
  if (!doc) return null;
  return JSON.parse(JSON.stringify(doc)) as T;
}

export function createImpCustomerRepository(
  model: Model<Customer> = CustomerModel,
): CustomerRepository {
  return {
    async findAll() {
      const docs = await model.find().lean<Customer[]>();
      return docs.map((doc) => toPlain(doc)!);
    },

    async findById(id: string) {
      const doc = await model.findOne({ id }).lean<Customer>();
      return toPlain(doc);
    },

    async findByEmail(email: string) {
      const normalized = email.toLowerCase();
      const doc = await model
        .findOne({ email: { $regex: new RegExp(`^${normalized}$`, 'i') } })
        .lean<Customer>();
      return toPlain(doc);
    },

    async findByEmailForAuth(email: string) {
      const normalized = email.toLowerCase();
      const doc = await model
        .findOne({ email: { $regex: new RegExp(`^${normalized}$`, 'i') } })
        .select('+passwordHash')
        .lean<Customer>();
      return toPlain(doc);
    },

    async create(customer: Customer) {
      const doc = await model.create(customer);
      return toPlain(doc.toObject())!;
    },

    async update(id: string, updates: Partial<Customer>) {
      const doc = await model
        .findOneAndUpdate({ id }, { $set: updates }, { new: true })
        .lean<Customer>();
      return toPlain(doc);
    },

    async delete(id: string) {
      const result = await model.deleteOne({ id });
      return result.deletedCount > 0;
    },
  };
}
