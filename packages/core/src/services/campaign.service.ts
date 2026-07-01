import type { Campaign } from '../entities/campaign.entity.js';
import type { CampaignRepository } from '../repositories/campaign.repository.js';

export function createCampaignService(repository: CampaignRepository) {
  return {
    list(): Promise<Campaign[]> {
      return repository.findAll();
    },

    listActive(): Promise<Campaign[]> {
      return repository.findActive();
    },

    getById(id: string): Promise<Campaign | null> {
      return repository.findById(id);
    },

    create(campaign: Campaign): Promise<Campaign> {
      return repository.create(campaign);
    },

    update(id: string, updates: Partial<Campaign>): Promise<Campaign | null> {
      return repository.update(id, updates);
    },

    delete(id: string): Promise<boolean> {
      return repository.delete(id);
    },
  };
}

export type CampaignService = ReturnType<typeof createCampaignService>;
