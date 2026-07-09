import mongoose, { Schema, model, type Model } from 'mongoose';
import type { StaffMember } from '@luxe-maison/core';
import { COLLECTIONS, MODEL_NAMES } from '../collection-names.js';

const staffSchema = new Schema<StaffMember>(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    role: { type: String, required: true, index: true },
    passwordHash: { type: String, required: true },
    addedAt: { type: String, required: true },
    avatar: { type: String },
  },
  { versionKey: false, collection: COLLECTIONS.staff_members },
);

export const StaffModel: Model<StaffMember> =
  mongoose.models?.[MODEL_NAMES.Staff_Member] ??
  model<StaffMember>(MODEL_NAMES.Staff_Member, staffSchema);
