import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '@/lib/api/analytics.api';
import { analyticsKeys } from '@/hooks/analytics/analytics-keys';
import { getStoredToken } from '@/lib/auth-session';

export function useAnalytics(enabled = true) {
  const hasToken = Boolean(getStoredToken());

  return useQuery({
    queryKey: analyticsKeys.summary(),
    queryFn: () => analyticsApi.get(),
    enabled: enabled && hasToken,
    staleTime: 60_000,
  });
}
