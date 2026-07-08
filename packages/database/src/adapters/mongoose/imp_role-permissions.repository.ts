import { cloneDefaultPermissions, normalizeRolePermissions, type EditableRolePermissions } from '@luxe-maison/core';
import type { RolePermissionsRepository } from '@luxe-maison/core';
import type { Model } from 'mongoose';
import {
  PERMISSIONS_ID,
  RolePermissionsModel,
  type RolePermissionsDocument,
} from './schemas/role-permissions.schema.js';

function toPlain<T>(doc: T | null): T | null {
  if (!doc) return null;
  return JSON.parse(JSON.stringify(doc)) as T;
}

function toPermissions(doc: RolePermissionsDocument): EditableRolePermissions {
  return normalizeRolePermissions({
    manager: doc.manager,
    employee: doc.employee,
  });
}

export function createImpRolePermissionsRepository(
  model: Model<RolePermissionsDocument> = RolePermissionsModel,
): RolePermissionsRepository {
  return {
    async get() {
      let doc = await model.findOne({ id: PERMISSIONS_ID }).lean<RolePermissionsDocument>();
      if (!doc) {
        const defaults = cloneDefaultPermissions();
        const created = await model.create({
          id: PERMISSIONS_ID,
          manager: defaults.manager,
          employee: defaults.employee,
        });
        doc = created.toObject() as RolePermissionsDocument;
      }
      return toPermissions(toPlain(doc)!);
    },

    async update(permissions: EditableRolePermissions) {
      const doc = await model
        .findOneAndUpdate(
          { id: PERMISSIONS_ID },
          { $set: permissions },
          { new: true, upsert: true, setDefaultsOnInsert: true },
        )
        .lean<RolePermissionsDocument>();
      return toPermissions(toPlain(doc)!);
    },

    async reset() {
      const defaults = cloneDefaultPermissions();
      const doc = await model
        .findOneAndUpdate(
          { id: PERMISSIONS_ID },
          { $set: defaults },
          { new: true, upsert: true, setDefaultsOnInsert: true },
        )
        .lean<RolePermissionsDocument>();
      return toPermissions(toPlain(doc)!);
    },
  };
}
