import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { EditableRolePermissions } from '@luxe-maison/shared';
import { permissionsApi } from '@/lib/api/permissions.api';
import { permissionsKeys } from '@/hooks/permissions/permissions-keys';

export function useUpdatePermissionsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (permissions: EditableRolePermissions) => permissionsApi.update(permissions),
    onSuccess: (response) => {
      queryClient.setQueryData(permissionsKeys.matrix(), response.permissions);
    },
  });
}
