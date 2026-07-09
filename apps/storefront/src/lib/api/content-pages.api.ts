import type { ContentPage, ContentPageSlug } from '@luxe-maison/shared';
import { apiFetch } from './client';

export const contentPagesApi = {
  get(slug: ContentPageSlug) {
    return apiFetch<ContentPage>(`/api/pages/${slug}`);
  },
};
