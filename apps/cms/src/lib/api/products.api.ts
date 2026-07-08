import type { AdminProduct } from '@luxe-maison/shared';
import { apiClient } from '@/lib/api/client';

export const productsApi = {
  list() {
    return apiClient.get<AdminProduct[]>('/api/products/admin').then((res) => res.data);
  },

  getById(id: string) {
    return apiClient.get<AdminProduct>(`/api/products/admin/${id}`).then((res) => res.data);
  },

  create(product: AdminProduct) {
    return apiClient.post<AdminProduct>('/api/products', product).then((res) => res.data);
  },

  update(id: string, product: Partial<AdminProduct>) {
    return apiClient.put<AdminProduct>(`/api/products/${id}`, product).then((res) => res.data);
  },

  toggleStatus(id: string) {
    return apiClient
      .patch<AdminProduct>(`/api/products/${id}/status`)
      .then((res) => res.data);
  },

  delete(id: string) {
    return apiClient.delete<{ status: 'ok' }>(`/api/products/${id}`).then((res) => res.data);
  },
};
