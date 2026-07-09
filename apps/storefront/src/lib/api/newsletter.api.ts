import type { Subscriber } from '@luxe-maison/shared';
import { apiFetch } from '@/lib/api/client';

export const newsletterApi = {
  subscribe(input: { email: string; name?: string }) {
    return apiFetch<Subscriber | { status: string; message: string }>('/api/newsletter/subscribe', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },
};
