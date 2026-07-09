import type { CmsRole, CmsSection, Permission } from '@luxe-maison/shared';
import { apiClient } from '@/lib/api/client';
import type { PermissionsResponse } from '@/lib/api/permissions.api';

export interface CreateRoleInput {
  name: string;
  slug?: string;
  permissions?: Partial<Record<CmsSection, Permission>>;
}

export const rolesApi = {
  list() {
    return apiClient.get<{ status: 'ok'; roles: CmsRole[] }>('/api/roles').then((res) => res.data);
  },

  create(input: CreateRoleInput) {
    return apiClient
      .post<{ status: 'ok'; role: CmsRole; roles: CmsRole[] }>('/api/roles', input)
      .then((res) => res.data);
  },

  delete(id: string) {
    return apiClient
      .delete<{ status: 'ok'; roles: CmsRole[] }>(`/api/roles/${id}`)
      .then((res) => res.data);
  },

  reset() {
    return apiClient.post<PermissionsResponse>('/api/roles/reset').then((res) => res.data);
  },
};
