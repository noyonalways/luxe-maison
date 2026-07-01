import type { Campaign } from '../entities/campaign.entity.js';

export interface CampaignRepository {
  findAll(): Promise<Campaign[]>;
  findActive(): Promise<Campaign[]>;
  findById(id: string): Promise<Campaign | null>;
  create(campaign: Campaign): Promise<Campaign>;
  update(id: string, updates: Partial<Campaign>): Promise<Campaign | null>;
  delete(id: string): Promise<boolean>;
}
