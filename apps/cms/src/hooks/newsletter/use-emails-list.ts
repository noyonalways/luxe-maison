import { useQuery } from '@tanstack/react-query';
import { newsletterApi } from '@/lib/api/newsletter.api';
import { newsletterKeys } from '@/hooks/newsletter/newsletter-keys';
import { getStoredToken } from '@/lib/auth-session';

export function useEmailsList(enabled = true) {
  const hasToken = Boolean(getStoredToken());

  return useQuery({
    queryKey: newsletterKeys.emails(),
    queryFn: () => newsletterApi.listEmails(),
    enabled: enabled && hasToken,
    staleTime: 30_000,
  });
}
