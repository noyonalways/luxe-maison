import type { StaffPublic, StaffRole } from '@luxe-maison/shared';
import { apiClient } from '@/lib/api/client';

export interface CreateStaffPayload {
  name: string;
  email: string;
  role: Extract<StaffRole, 'manager' | 'employee'>;
  password: string;
  avatar?: string;
}

export interface UpdateStaffPayload {
  name?: string;
  email?: string;
  role?: Extract<StaffRole, 'manager' | 'employee'>;
  password?: string;
  avatar?: string;
}

export const staffApi = {
  list() {
    return apiClient.get<StaffPublic[]>('/api/staff').then((res) => res.data);
  },

  getById(id: string) {
    return apiClient.get<StaffPublic>(`/api/staff/${id}`).then((res) => res.data);
  },

  create(payload: CreateStaffPayload) {
    return apiClient.post<StaffPublic>('/api/staff', payload).then((res) => res.data);
  },

  update(id: string, payload: UpdateStaffPayload) {
    return apiClient.put<StaffPublic>(`/api/staff/${id}`, payload).then((res) => res.data);
  },

  delete(id: string) {
    return apiClient.delete<{ status: 'ok' }>(`/api/staff/${id}`).then((res) => res.data);
  },
};
