import type { Order, OrderStatus } from '@luxe-maison/shared';
import { apiClient } from '@/lib/api/client';

export type UpdateOrderPayload = Partial<{
  trackingNumber: string;
  carrier: string;
  status: OrderStatus;
}>;

export const ordersApi = {
  list() {
    return apiClient.get<Order[]>('/api/orders').then((res) => res.data);
  },

  getById(id: string) {
    return apiClient.get<Order>(`/api/orders/${id}`).then((res) => res.data);
  },

  updateStatus(id: string, status: OrderStatus) {
    return apiClient.patch<Order>(`/api/orders/${id}/status`, { status }).then((res) => res.data);
  },

  update(id: string, payload: UpdateOrderPayload) {
    return apiClient.patch<Order>(`/api/orders/${id}`, payload).then((res) => res.data);
  },

  addNote(id: string, note: string) {
    return apiClient.post<Order>(`/api/orders/${id}/notes`, { note }).then((res) => res.data);
  },
};
