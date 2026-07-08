import { useQuery } from '@tanstack/react-query';
import { permissionsApi } from '@/lib/api/permissions.api';
import { permissionsKeys } from '@/hooks/permissions/permissions-keys';
import { getStoredToken } from '@/lib/auth-session';

export function usePermissionsQuery() {
  const hasToken = Boolean(getStoredToken());

  return useQuery({
    queryKey: permissionsKeys.matrix(),
    queryFn: async () => {
      const response = await permissionsApi.get();
      return response.permissions;
    },
    enabled: hasToken,
    staleTime: 60_000,
  });
}
