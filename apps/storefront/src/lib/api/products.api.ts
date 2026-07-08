import type { Product } from '@luxe-maison/shared';
import { apiFetch } from '@/lib/api/client';

export const productsApi = {
  list() {
    return apiFetch<Product[]>('/api/products');
  },

  getById(id: string) {
    return apiFetch<Product>(`/api/products/${id}`);
  },
};
