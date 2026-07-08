import { useState, type ReactNode } from 'react';
import { mockCampaigns } from '@/data/cms-mock';
import { CampaignsContext, type CampaignsContextValue } from '@/contexts/campaigns-context';

export function CampaignsProvider({ children }: { children: ReactNode }) {
  const [campaigns, setCampaigns] = useState(mockCampaigns);

  const addCampaign: CampaignsContextValue['addCampaign'] = (c) => setCampaigns((prev) => [c, ...prev]);
  const updateCampaign: CampaignsContextValue['updateCampaign'] = (c) =>
    setCampaigns((prev) => prev.map((x) => (x.id === c.id ? c : x)));
  const deleteCampaign: CampaignsContextValue['deleteCampaign'] = (id) =>
    setCampaigns((prev) => prev.filter((c) => c.id !== id));
  const getActiveCampaigns: CampaignsContextValue['getActiveCampaigns'] = () =>
    campaigns.filter((c) => c.status === 'active');

  return (
    <CampaignsContext.Provider value={{ campaigns, addCampaign, updateCampaign, deleteCampaign, getActiveCampaigns }}>
      {children}
    </CampaignsContext.Provider>
  );
}
