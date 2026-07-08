import mongoose, { Schema, model, type Model } from 'mongoose';
import {
  ALL_SECTIONS,
  cloneDefaultPermissions,
  normalizeRolePermissions,
  type CmsSection,
  type EditableRolePermissions,
  type Permission,
} from '@luxe-maison/core';
import type { RolePermissionsRepository } from '@luxe-maison/core';

const PERMISSIONS_ID = 'default';

const permissionValues = ['none', 'view', 'edit', 'full'] as const;

const sectionPermissionSchema = ALL_SECTIONS.reduce(
  (shape, section) => {
    shape[section] = { type: String, enum: permissionValues, required: true };
    return shape;
  },
  {} as Record<CmsSection, { type: StringConstructor; enum: readonly Permission[]; required: true }>,
);

export interface RolePermissionsDocument {
  id: string;
  manager: Record<CmsSection, Permission>;
  employee: Record<CmsSection, Permission>;
}

const rolePermissionsSchema = new Schema<RolePermissionsDocument>(
  {
    id: { type: String, required: true, unique: true, default: PERMISSIONS_ID },
    manager: sectionPermissionSchema,
    employee: sectionPermissionSchema,
  },
  { versionKey: false },
);

export const RolePermissionsModel: Model<RolePermissionsDocument> =
  mongoose.models?.RolePermissions ??
  model<RolePermissionsDocument>('RolePermissions', rolePermissionsSchema);

function toPermissions(doc: RolePermissionsDocument): EditableRolePermissions {
  return normalizeRolePermissions({
    manager: doc.manager,
    employee: doc.employee,
  });
}

export { PERMISSIONS_ID };
