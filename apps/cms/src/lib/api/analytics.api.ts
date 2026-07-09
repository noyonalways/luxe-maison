import type { AnalyticsData } from '@luxe-maison/shared';
import { apiClient } from '@/lib/api/client';

export const analyticsApi = {
  get() {
    return apiClient.get<AnalyticsData>('/api/analytics').then((res) => res.data);
  },
};
