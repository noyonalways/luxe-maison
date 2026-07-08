import { apiFetch } from '@/lib/api/client';
import type { Order, OrderItem } from '@luxe-maison/shared';

export type CreateOrderPayload = {
  items: OrderItem[];
  customerName: string;
  customerEmail: string;
  phone: string;
  shippingAddress: string;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  promoCode?: string;
};

export const ordersApi = {
  create(payload: CreateOrderPayload) {
    return apiFetch<Order>('/api/orders', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  mine() {
    return apiFetch<Order[]>('/api/orders/mine');
  },

  track(orderId: string, email: string) {
    const params = new URLSearchParams({ orderId, email });
    return apiFetch<Order>(`/api/orders/track?${params.toString()}`);
  },
};
