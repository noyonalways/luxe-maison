import type { Campaign } from '@luxe-maison/core';
import type { CampaignRepository } from '@luxe-maison/core';
import type { Model } from 'mongoose';
import { CampaignModel } from './schemas/campaign.schema.js';

function toPlain<T>(doc: T | null): T | null {
  if (!doc) return null;
  return JSON.parse(JSON.stringify(doc)) as T;
}

export function createImpCampaignRepository(
  model: Model<Campaign> = CampaignModel,
): CampaignRepository {
  return {
    async findAll() {
      const docs = await model.find().lean<Campaign[]>();
      return docs.map((doc) => toPlain(doc)!);
    },

    async findActive() {
      const docs = await model.find({ status: 'active' }).lean<Campaign[]>();
      return docs.map((doc) => toPlain(doc)!);
    },

    async findById(id: string) {
      const doc = await model.findOne({ id }).lean<Campaign>();
      return toPlain(doc);
    },

    async create(campaign: Campaign) {
      const doc = await model.create(campaign);
      return toPlain(doc.toObject())!;
    },

    async update(id: string, updates: Partial<Campaign>) {
      const doc = await model
        .findOneAndUpdate({ id }, { $set: updates }, { new: true })
        .lean<Campaign>();
      return toPlain(doc);
    },

    async delete(id: string) {
      const result = await model.deleteOne({ id });
      return result.deletedCount > 0;
    },
  };
}
