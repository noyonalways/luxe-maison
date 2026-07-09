import type { HomepageContent } from '@luxe-maison/shared';
import { apiClient } from '@/lib/api/client';

export type UpdateHomepagePayload = Partial<HomepageContent>;

export const homepageApi = {
  get() {
    return apiClient.get<HomepageContent>('/api/homepage/admin').then((res) => res.data);
  },

  update(updates: UpdateHomepagePayload) {
    return apiClient.put<HomepageContent>('/api/homepage', updates).then((res) => res.data);
  },

  reset() {
    return apiClient.post<HomepageContent>('/api/homepage/reset').then((res) => res.data);
  },
};
