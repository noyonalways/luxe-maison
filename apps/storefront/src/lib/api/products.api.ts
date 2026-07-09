import type { Product, StorefrontProductFilters } from '@luxe-maison/shared';
import { apiFetch } from '@/lib/api/client';

function toQueryString(filters?: StorefrontProductFilters): string {
  if (!filters) return '';
  const params = new URLSearchParams();
  if (filters.section) params.set('section', filters.section);
  if (filters.category) params.set('category', filters.category);
  if (filters.fit) params.set('fit', filters.fit);
  if (filters.fabric) params.set('fabric', filters.fabric);
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

export const productsApi = {
  list(filters?: StorefrontProductFilters) {
    return apiFetch<Product[]>(`/api/products${toQueryString(filters)}`);
  },

  getById(id: string) {
    return apiFetch<Product>(`/api/products/${id}`);
  },
};
