import { useMutation, useQueryClient } from '@tanstack/react-query';
import { rolesApi } from '@/lib/api/roles.api';
import { permissionsKeys } from '@/hooks/permissions/permissions-keys';
import { rolesToEditablePermissions } from '@luxe-maison/shared';

export function useDeleteRoleMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: rolesApi.delete,
    onSuccess: (response) => {
      queryClient.setQueryData(permissionsKeys.matrix(), {
        roles: response.roles,
        permissions: rolesToEditablePermissions(response.roles),
      });
    },
  });
}
