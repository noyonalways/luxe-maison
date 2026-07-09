import type { HomepageContent } from '@luxe-maison/shared';
import { apiFetch } from '@/lib/api/client';

export const homepageApi = {
  get() {
    return apiFetch<HomepageContent>('/api/homepage');
  },
};
