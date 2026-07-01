import type { Order } from '@luxe-maison/core';
import type { OrderRepository } from '@luxe-maison/core';
import { mockOrders } from './seed.js';

export function createImpOrderRepository(
  initial: Order[] = structuredClone(mockOrders),
): OrderRepository {
  const orders = initial;

  return {
    async findAll() {
      return [...orders];
    },

    async findById(id: string) {
      return orders.find((o) => o.id === id) ?? null;
    },

    async findByCustomerEmail(email: string) {
      const normalized = email.toLowerCase();
      return orders.filter((o) => o.customerEmail.toLowerCase() === normalized);
    },

    async updateStatus(id: string, status: Order['status']) {
      const order = orders.find((o) => o.id === id);
      if (!order) return null;
      order.status = status;
      order.updatedAt = new Date().toISOString();
      return order;
    },
  };
}
