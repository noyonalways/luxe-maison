import { createContext, useContext, useState, type ReactNode } from 'react';
import { mockCampaigns } from '@/data/admin-mock';
import type { Campaign, CampaignType, CampaignStatus } from '@/data/admin-types';

interface CampaignsContextType {
  campaigns: Campaign[];
  addCampaign: (c: Campaign) => void;
  updateCampaign: (c: Campaign) => void;
  deleteCampaign: (id: string) => void;
  getActiveCampaigns: () => Campaign[];
}

const CampaignsContext = createContext<CampaignsContextType | null>(null);

export function CampaignsProvider({ children }: { children: ReactNode }) {
  const [campaigns, setCampaigns] = useState<Campaign[]>(mockCampaigns);

  const addCampaign = (c: Campaign) => setCampaigns(prev => [c, ...prev]);
  const updateCampaign = (c: Campaign) => setCampaigns(prev => prev.map(x => x.id === c.id ? c : x));
  const deleteCampaign = (id: string) => setCampaigns(prev => prev.filter(c => c.id !== id));
  const getActiveCampaigns = () => campaigns.filter(c => c.status === 'active');

  return (
    <CampaignsContext.Provider value={{ campaigns, addCampaign, updateCampaign, deleteCampaign, getActiveCampaigns }}>
      {children}
    </CampaignsContext.Provider>
  );
}

export function useCampaigns() {
  const ctx = useContext(CampaignsContext);
  if (!ctx) throw new Error('useCampaigns must be used within CampaignsProvider');
  return ctx;
}
