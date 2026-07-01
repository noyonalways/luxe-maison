import mongoose, { Schema, model, type Model } from 'mongoose';
import type { StaffMember } from '@luxe-maison/core';

const staffSchema = new Schema<StaffMember>(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    role: { type: String, required: true, enum: ['manager', 'employee'] },
    addedAt: { type: String, required: true },
  },
  { versionKey: false },
);

export const StaffModel: Model<StaffMember> =
  mongoose.models?.StaffMember ?? model<StaffMember>('StaffMember', staffSchema);
