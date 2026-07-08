import { useQuery } from '@tanstack/react-query';
import { authApi } from '@/lib/api/auth.api';
import { getStoredToken } from '@/lib/auth-session';
import { authKeys } from '@/hooks/auth/auth-keys';

export function useAuthSession() {
  const hasToken = Boolean(getStoredToken());

  return useQuery({
    queryKey: authKeys.session(),
    queryFn: async () => {
      const response = await authApi.me();
      return response.user;
    },
    enabled: hasToken,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}
