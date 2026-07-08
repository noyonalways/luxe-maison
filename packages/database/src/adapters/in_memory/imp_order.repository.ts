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

    async findByIdAndEmail(id: string, email: string) {
      const normalized = email.toLowerCase();
      const order = orders.find(
        (o) => o.id.toLowerCase() === id.toLowerCase() && o.customerEmail.toLowerCase() === normalized,
      );
      return order ?? null;
    },

    async create(order: Order) {
      orders.push(order);
      return order;
    },

    async updateStatus(id: string, status: Order['status']) {
      const order = orders.find((o) => o.id === id);
      if (!order) return null;
      order.status = status;
      order.updatedAt = new Date().toISOString();
      return { ...order };
    },

    async update(id: string, updates: Partial<Pick<Order, 'status' | 'trackingNumber' | 'carrier' | 'notes'>>) {
      const order = orders.find((o) => o.id === id);
      if (!order) return null;
      Object.assign(order, updates);
      order.updatedAt = new Date().toISOString();
      return { ...order };
    },

    async appendNote(id: string, note: string) {
      const order = orders.find((o) => o.id === id);
      if (!order) return null;
      order.notes = [...order.notes, note];
      order.updatedAt = new Date().toISOString();
      return { ...order };
    },
  };
}
