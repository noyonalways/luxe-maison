import type { ContentPageSlug } from '@luxe-maison/shared';

export const contentPageKeys = {
  all: ['content-pages'] as const,
  list: () => [...contentPageKeys.all, 'list'] as const,
  detail: (slug: ContentPageSlug) => [...contentPageKeys.all, slug] as const,
};
