import { useMutation, useQueryClient } from '@tanstack/react-query';
import { rolesApi } from '@/lib/api/roles.api';
import { permissionsKeys } from '@/hooks/permissions/permissions-keys';
import { rolesToEditablePermissions } from '@luxe-maison/shared';

export function useCreateRoleMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: rolesApi.create,
    onSuccess: (response) => {
      queryClient.setQueryData(permissionsKeys.matrix(), {
        roles: response.roles,
        permissions: rolesToEditablePermissions(response.roles),
      });
    },
  });
}
