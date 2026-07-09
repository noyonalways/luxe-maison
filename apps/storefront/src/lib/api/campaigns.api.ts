import type { Campaign } from '@luxe-maison/shared';
import { apiFetch } from '@/lib/api/client';

export const campaignsApi = {
  listActive() {
    return apiFetch<Campaign[]>('/api/campaigns/active');
  },
};
