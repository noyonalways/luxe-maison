import type { CmsRole, CmsRolesRepository, CmsSection, Permission } from '@luxe-maison/core';
import type { Model } from 'mongoose';
import { CmsRoleModel, type CmsRoleDocument } from './schemas/cms-role.schema.js';

function toPlain<T>(doc: T | null): T | null {
  if (!doc) return null;
  return JSON.parse(JSON.stringify(doc)) as T;
}

export function createImpCmsRolesRepository(
  model: Model<CmsRoleDocument> = CmsRoleModel,
): CmsRolesRepository {
  return {
    async findAll() {
      const docs = await model.find().sort({ isSystem: -1, name: 1 }).lean<CmsRoleDocument[]>();
      return docs.map((doc) => toPlain(doc)!);
    },

    async findById(id: string) {
      const doc = await model.findOne({ id }).lean<CmsRoleDocument>();
      return toPlain(doc);
    },

    async findBySlug(slug: string) {
      const doc = await model.findOne({ slug }).lean<CmsRoleDocument>();
      return toPlain(doc);
    },

    async create(role: CmsRole) {
      const created = await model.create(role);
      return toPlain(created.toObject() as CmsRoleDocument)!;
    },

    async update(id, updates) {
      const doc = await model
        .findOneAndUpdate({ id }, { $set: updates }, { new: true })
        .lean<CmsRoleDocument>();
      return toPlain(doc);
    },

    async delete(id: string) {
      const result = await model.deleteOne({ id, isSystem: false });
      return result.deletedCount > 0;
    },

    async updatePermission(roleId: string, section: CmsSection, permission: Permission) {
      const doc = await model
        .findOneAndUpdate(
          { id: roleId },
          { $set: { [`permissions.${section}`]: permission } },
          { new: true },
        )
        .lean<CmsRoleDocument>();
      return toPlain(doc);
    },
  };
}
