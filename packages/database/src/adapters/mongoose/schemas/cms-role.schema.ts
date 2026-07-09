import mongoose, { Schema, model, type Model } from 'mongoose';
import {
  ALL_SECTIONS,
  type CmsSection,
  type CmsRole,
  type Permission,
} from '@luxe-maison/core';
import { COLLECTIONS, MODEL_NAMES } from '../collection-names.js';

const permissionValues = ['none', 'view', 'edit', 'full'] as const;

const sectionPermissionSchema = ALL_SECTIONS.reduce(
  (shape, section) => {
    shape[section] = { type: String, enum: permissionValues, required: true };
    return shape;
  },
  {} as Record<CmsSection, { type: StringConstructor; enum: readonly Permission[]; required: true }>,
);

export interface CmsRoleDocument extends CmsRole {}

const cmsRoleSchema = new Schema<CmsRoleDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    isSystem: { type: Boolean, required: true, default: false },
    permissions: sectionPermissionSchema,
    createdAt: { type: String, required: true },
  },
  { versionKey: false, collection: COLLECTIONS.cms_roles },
);

export const CmsRoleModel: Model<CmsRoleDocument> =
  mongoose.models?.[MODEL_NAMES.Cms_Role] ??
  model<CmsRoleDocument>(MODEL_NAMES.Cms_Role, cmsRoleSchema);
