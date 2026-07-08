import type { EditableRolePermissions } from '@luxe-maison/shared';
import { apiClient } from '@/lib/api/client';

export interface PermissionsResponse {
  status: 'ok';
  permissions: EditableRolePermissions;
}

export const permissionsApi = {
  get() {
    return apiClient.get<PermissionsResponse>('/api/permissions').then((res) => res.data);
  },

  update(permissions: EditableRolePermissions) {
    return apiClient
      .put<PermissionsResponse>('/api/permissions', { permissions })
      .then((res) => res.data);
  },

  reset() {
    return apiClient
      .post<PermissionsResponse>('/api/permissions/reset')
      .then((res) => res.data);
  },
};
