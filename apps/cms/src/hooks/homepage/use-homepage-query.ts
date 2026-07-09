import { useQuery } from '@tanstack/react-query';
import { homepageApi } from '@/lib/api/homepage.api';
import { homepageKeys } from '@/hooks/homepage/homepage-keys';
import { getStoredToken } from '@/lib/auth-session';

export function useHomepageQuery(enabled = true) {
  const hasToken = Boolean(getStoredToken());

  return useQuery({
    queryKey: homepageKeys.detail(),
    queryFn: () => homepageApi.get(),
    enabled: enabled && hasToken,
    staleTime: 30_000,
  });
}
