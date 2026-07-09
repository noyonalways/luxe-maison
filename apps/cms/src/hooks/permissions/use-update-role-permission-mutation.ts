import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { CmsSection, Permission } from '@luxe-maison/shared';
import { permissionsApi } from '@/lib/api/permissions.api';
import { permissionsKeys } from '@/hooks/permissions/permissions-keys';

export function useUpdateRolePermissionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      roleId,
      section,
      permission,
    }: {
      roleId: string;
      section: CmsSection;
      permission: Permission;
    }) => permissionsApi.updateRolePermission(roleId, section, permission),
    onSuccess: (response) => {
      queryClient.setQueryData(permissionsKeys.matrix(), {
        roles: response.roles,
        permissions: response.permissions,
      });
    },
  });
}
