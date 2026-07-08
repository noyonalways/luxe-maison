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

export function deriveCampaignStatus(
  startDate: string,
  endDate: string,
  now: Date = new Date(),
): CampaignStatus {
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (end < now) return 'ended';
  if (start > now) return 'scheduled';
  return 'active';
}
