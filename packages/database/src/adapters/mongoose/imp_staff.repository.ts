import type { StaffMember } from '@luxe-maison/core';
import type { StaffRepository } from '@luxe-maison/core';
import type { Model } from 'mongoose';
import { StaffModel } from './schemas/staff.schema.js';

function toPlain<T>(doc: T | null): T | null {
  if (!doc) return null;
  return JSON.parse(JSON.stringify(doc)) as T;
}

export function createImpStaffRepository(
  model: Model<StaffMember> = StaffModel,
): StaffRepository {
  return {
    async findAll() {
      const docs = await model.find().lean<StaffMember[]>();
      return docs.map((doc) => toPlain(doc)!);
    },

    async findById(id: string) {
      const doc = await model.findOne({ id }).lean<StaffMember>();
      return toPlain(doc);
    },

    async findByEmail(email: string) {
      const normalized = email.toLowerCase();
      const doc = await model
        .findOne({ email: { $regex: new RegExp(`^${normalized}$`, 'i') } })
        .lean<StaffMember>();
      return toPlain(doc);
    },

    async create(member: StaffMember) {
      const doc = await model.create(member);
      return toPlain(doc.toObject())!;
    },

    async update(id: string, updates: Partial<StaffMember>) {
      const doc = await model
        .findOneAndUpdate({ id }, { $set: updates }, { new: true })
        .lean<StaffMember>();
      return toPlain(doc);
    },

    async delete(id: string) {
      const result = await model.deleteOne({ id });
      return result.deletedCount > 0;
    },
  };
}
