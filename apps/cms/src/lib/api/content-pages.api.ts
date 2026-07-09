import type { ContentPage, ContentPageSlug } from '@luxe-maison/shared';
import { apiClient } from '@/lib/api/client';

export type UpdateContentPagePayload = Partial<
  Pick<ContentPage, 'title' | 'body' | 'metaDescription' | 'published'>
>;

export const contentPagesApi = {
  list() {
    return apiClient.get<ContentPage[]>('/api/pages/admin/list').then((res) => res.data);
  },

  get(slug: ContentPageSlug) {
    return apiClient.get<ContentPage>(`/api/pages/admin/${slug}`).then((res) => res.data);
  },

  update(slug: ContentPageSlug, updates: UpdateContentPagePayload) {
    return apiClient.put<ContentPage>(`/api/pages/${slug}`, updates).then((res) => res.data);
  },

  reset(slug: ContentPageSlug) {
    return apiClient.post<ContentPage>(`/api/pages/${slug}/reset`).then((res) => res.data);
  },
};
