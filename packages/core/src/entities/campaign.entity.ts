export type CampaignType = 'sale' | 'seasonal' | 'flash' | 'launch';
export type CampaignStatus = 'scheduled' | 'active' | 'ended';

export interface Campaign {
  id: string;
  name: string;
  type: CampaignType;
  status: CampaignStatus;
  description: string;
  startDate: string;
  endDate: string;
  discountCode?: string;
  targetAudience: string;
  budget: number;
  revenue: number;
  impressions: number;
  clicks: number;
  conversions: number;
  createdAt: string;
}
