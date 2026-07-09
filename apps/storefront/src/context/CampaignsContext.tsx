import { createContext, useCallback, useContext, type ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { Campaign } from '@luxe-maison/shared';
import { campaignsApi } from '@/lib/api/campaigns.api';
import { campaignKeys } from '@/hooks/campaigns/campaign-keys';

interface CampaignsContextType {
  campaigns: Campaign[];
  isLoading: boolean;
  getActiveCampaigns: () => Campaign[];
}

const CampaignsContext = createContext<CampaignsContextType | null>(null);

export function CampaignsProvider({ children }: { children: ReactNode }) {
  const { data = [], isLoading } = useQuery({
    queryKey: campaignKeys.active(),
    queryFn: () => campaignsApi.listActive(),
    staleTime: 60_000,
  });

  const getActiveCampaigns = useCallback(() => data, [data]);

  return (
    <CampaignsContext.Provider value={{ campaigns: data, isLoading, getActiveCampaigns }}>
      {children}
    </CampaignsContext.Provider>
  );
}

export function useCampaigns() {
  const ctx = useContext(CampaignsContext);
  if (!ctx) throw new Error('useCampaigns must be used within CampaignsProvider');
  return ctx;
}
