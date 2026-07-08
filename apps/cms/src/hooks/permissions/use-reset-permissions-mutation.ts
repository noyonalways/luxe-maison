import { useMutation, useQueryClient } from '@tanstack/react-query';
import { permissionsApi } from '@/lib/api/permissions.api';
import { permissionsKeys } from '@/hooks/permissions/permissions-keys';

export function useResetPermissionsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => permissionsApi.reset(),
    onSuccess: (response) => {
      queryClient.setQueryData(permissionsKeys.matrix(), response.permissions);
    },
  });
}
