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
  };
}
