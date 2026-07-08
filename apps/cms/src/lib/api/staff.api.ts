import type { StaffPublic } from '@luxe-maison/shared';
import { apiClient } from '@/lib/api/client';

export const staffApi = {
  list() {
    return apiClient.get<StaffPublic[]>('/api/staff').then((res) => res.data);
  },
};
