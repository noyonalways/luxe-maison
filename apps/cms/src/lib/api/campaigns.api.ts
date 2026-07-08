import type { Campaign } from '@luxe-maison/shared';
import { apiClient } from '@/lib/api/client';

export type CreateCampaignPayload = Omit<
  Campaign,
  'id' | 'status' | 'revenue' | 'impressions' | 'clicks' | 'conversions' | 'createdAt'
> & { id?: string };

export type UpdateCampaignPayload = Partial<
  Pick<
    Campaign,
    | 'name'
    | 'type'
    | 'description'
    | 'startDate'
    | 'endDate'
    | 'discountCode'
    | 'targetAudience'
    | 'budget'
  >
>;

export const campaignsApi = {
  list(activeOnly = false) {
    const query = activeOnly ? '?active=true' : '';
    return apiClient.get<Campaign[]>(`/api/campaigns${query}`).then((res) => res.data);
  },

  getById(id: string) {
    return apiClient.get<Campaign>(`/api/campaigns/${id}`).then((res) => res.data);
  },

  create(campaign: CreateCampaignPayload) {
    return apiClient.post<Campaign>('/api/campaigns', campaign).then((res) => res.data);
  },

  update(id: string, campaign: UpdateCampaignPayload) {
    return apiClient.put<Campaign>(`/api/campaigns/${id}`, campaign).then((res) => res.data);
  },

  delete(id: string) {
    return apiClient.delete<{ status: 'ok' }>(`/api/campaigns/${id}`).then((res) => res.data);
  },
};
