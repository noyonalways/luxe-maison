import { useQuery } from '@tanstack/react-query';
import { newsletterApi } from '@/lib/api/newsletter.api';
import { newsletterKeys } from '@/hooks/newsletter/newsletter-keys';
import { getStoredToken } from '@/lib/auth-session';

export function useSubscribersList(enabled = true) {
  const hasToken = Boolean(getStoredToken());

  return useQuery({
    queryKey: newsletterKeys.subscribers(),
    queryFn: () => newsletterApi.listSubscribers(),
    enabled: enabled && hasToken,
    staleTime: 30_000,
  });
}
