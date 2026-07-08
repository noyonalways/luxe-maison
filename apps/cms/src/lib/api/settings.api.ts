import type { StoreSettings } from '@luxe-maison/shared';
import { apiClient } from '@/lib/api/client';

export type UpdateSettingsPayload = Partial<StoreSettings>;

export const settingsApi = {
  get() {
    return apiClient.get<StoreSettings>('/api/settings').then((res) => res.data);
  },

  update(updates: UpdateSettingsPayload) {
    return apiClient.put<StoreSettings>('/api/settings', updates).then((res) => res.data);
  },

  reset() {
    return apiClient.post<StoreSettings>('/api/settings/reset').then((res) => res.data);
  },
};
