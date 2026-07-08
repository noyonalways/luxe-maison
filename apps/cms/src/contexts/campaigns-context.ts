import { createContext, useContext } from 'react';
import type { Campaign } from '@/data/cms-types';
import type { CreateCampaignPayload, UpdateCampaignPayload } from '@/lib/api/campaigns.api';

export interface CampaignsContextValue {
  campaigns: Campaign[];
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  addCampaign: (campaign: CreateCampaignPayload) => Promise<Campaign>;
  updateCampaign: (id: string, campaign: UpdateCampaignPayload) => Promise<Campaign>;
  deleteCampaign: (id: string) => Promise<void>;
  getActiveCampaigns: () => Campaign[];
}

export const CampaignsContext = createContext<CampaignsContextValue | null>(null);

export function useCampaigns() {
  const ctx = useContext(CampaignsContext);
  if (!ctx) throw new Error('useCampaigns must be used within CampaignsProvider');
  return ctx;
}
