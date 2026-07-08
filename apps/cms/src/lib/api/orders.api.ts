import type { Order } from '@luxe-maison/shared';
import { apiClient } from '@/lib/api/client';

export const ordersApi = {
  list() {
    return apiClient.get<Order[]>('/api/orders').then((res) => res.data);
  },
};
