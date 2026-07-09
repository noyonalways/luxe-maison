import { useQuery } from '@tanstack/react-query';
import type { ContentPageSlug } from '@luxe-maison/shared';
import { contentPagesApi } from '@/lib/api/content-pages.api';
import { contentPageKeys } from '@/hooks/content-pages/content-page-keys';
import { getStoredToken } from '@/lib/auth-session';

export function useContentPageQuery(slug: ContentPageSlug, enabled = true) {
  const hasToken = Boolean(getStoredToken());

  return useQuery({
    queryKey: contentPageKeys.detail(slug),
    queryFn: () => contentPagesApi.get(slug),
    enabled: enabled && hasToken,
    staleTime: 30_000,
  });
}
