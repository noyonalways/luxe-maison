import type { Campaign } from '@luxe-maison/core';
import type { CampaignRepository } from '@luxe-maison/core';
import { mockCampaigns } from './seed.js';

export function createImpCampaignRepository(
  initial: Campaign[] = structuredClone(mockCampaigns),
): CampaignRepository {
  const campaigns = initial;

  return {
    async findAll() {
      return [...campaigns];
    },

    async findActive() {
      return campaigns.filter((c) => c.status === 'active');
    },

    async findById(id: string) {
      return campaigns.find((c) => c.id === id) ?? null;
    },

    async create(campaign: Campaign) {
      campaigns.push(campaign);
      return campaign;
    },

    async update(id: string, updates: Partial<Campaign>) {
      const index = campaigns.findIndex((c) => c.id === id);
      if (index === -1) return null;
      campaigns[index] = { ...campaigns[index]!, ...updates };
      return campaigns[index]!;
    },

    async delete(id: string) {
      const index = campaigns.findIndex((c) => c.id === id);
      if (index === -1) return false;
      campaigns.splice(index, 1);
      return true;
    },
  };
}
