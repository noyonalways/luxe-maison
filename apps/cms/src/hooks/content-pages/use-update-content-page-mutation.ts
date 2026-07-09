import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { ContentPageSlug } from '@luxe-maison/shared';
import { contentPagesApi, type UpdateContentPagePayload } from '@/lib/api/content-pages.api';
import { contentPageKeys } from '@/hooks/content-pages/content-page-keys';

export function useUpdateContentPageMutation(slug: ContentPageSlug) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (updates: UpdateContentPagePayload) => contentPagesApi.update(slug, updates),
    onSuccess: (data) => {
      queryClient.setQueryData(contentPageKeys.detail(slug), data);
      queryClient.invalidateQueries({ queryKey: contentPageKeys.list() });
    },
  });
}
