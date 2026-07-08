import type { Discount } from '@luxe-maison/shared';
import { apiClient } from '@/lib/api/client';

export type CreateDiscountPayload = Omit<Discount, 'id' | 'usedCount' | 'createdAt'> & { id?: string };

export type UpdateDiscountPayload = Partial<
  Pick<
    Discount,
    | 'code'
    | 'type'
    | 'value'
    | 'minOrder'
    | 'maxUses'
    | 'status'
    | 'expiresAt'
    | 'categories'
    | 'description'
  >
>;

export const discountsApi = {
  list() {
    return apiClient.get<Discount[]>('/api/discounts').then((res) => res.data);
  },

  getById(id: string) {
    return apiClient.get<Discount>(`/api/discounts/${id}`).then((res) => res.data);
  },

  create(discount: CreateDiscountPayload) {
    return apiClient.post<Discount>('/api/discounts', discount).then((res) => res.data);
  },

  update(id: string, discount: UpdateDiscountPayload) {
    return apiClient.put<Discount>(`/api/discounts/${id}`, discount).then((res) => res.data);
  },

  toggleStatus(id: string) {
    return apiClient.patch<Discount>(`/api/discounts/${id}/status`).then((res) => res.data);
  },

  delete(id: string) {
    return apiClient.delete<{ status: 'ok' }>(`/api/discounts/${id}`).then((res) => res.data);
  },
};
