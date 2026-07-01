import mongoose, { Schema, model, type Model } from 'mongoose';
import type { Campaign } from '@luxe-maison/core';

const campaignSchema = new Schema<Campaign>(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    type: { type: String, required: true, enum: ['sale', 'seasonal', 'flash', 'launch'] },
    status: { type: String, required: true, enum: ['scheduled', 'active', 'ended'] },
    description: { type: String, required: true },
    startDate: { type: String, required: true },
    endDate: { type: String, required: true },
    discountCode: { type: String },
    targetAudience: { type: String, required: true },
    budget: { type: Number, required: true },
    revenue: { type: Number, required: true },
    impressions: { type: Number, required: true },
    clicks: { type: Number, required: true },
    conversions: { type: Number, required: true },
    createdAt: { type: String, required: true },
  },
  { versionKey: false },
);

export const CampaignModel: Model<Campaign> =
  mongoose.models.Campaign ?? model<Campaign>('Campaign', campaignSchema);
