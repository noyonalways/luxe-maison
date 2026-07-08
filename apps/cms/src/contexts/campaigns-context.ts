import { createContext, useContext } from 'react';
import type { Campaign } from '@/data/cms-types';

export interface CampaignsContextValue {
  campaigns: Campaign[];
  addCampaign: (c: Campaign) => void;
  updateCampaign: (c: Campaign) => void;
  deleteCampaign: (id: string) => void;
  getActiveCampaigns: () => Campaign[];
}

export const CampaignsContext = createContext<CampaignsContextValue | null>(null);

export function useCampaigns() {
  const ctx = useContext(CampaignsContext);
  if (!ctx) throw new Error('useCampaigns must be used within CampaignsProvider');
  return ctx;
}
