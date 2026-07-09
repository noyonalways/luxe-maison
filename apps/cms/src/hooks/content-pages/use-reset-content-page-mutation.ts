import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { ContentPageSlug } from '@luxe-maison/shared';
import { contentPagesApi } from '@/lib/api/content-pages.api';
import { contentPageKeys } from '@/hooks/content-pages/content-page-keys';

export function useResetContentPageMutation(slug: ContentPageSlug) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => contentPagesApi.reset(slug),
    onSuccess: (data) => {
      queryClient.setQueryData(contentPageKeys.detail(slug), data);
      queryClient.invalidateQueries({ queryKey: contentPageKeys.list() });
    },
  });
}
