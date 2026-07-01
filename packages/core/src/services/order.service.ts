import type { Order } from '../entities/order.entity.js';
import type { OrderRepository } from '../repositories/order.repository.js';

export function createOrderService(repository: OrderRepository) {
  return {
    list(): Promise<Order[]> {
      return repository.findAll();
    },

    getById(id: string): Promise<Order | null> {
      return repository.findById(id);
    },

    getByCustomerEmail(email: string): Promise<Order[]> {
      return repository.findByCustomerEmail(email);
    },

    updateStatus(id: string, status: Order['status']): Promise<Order | null> {
      return repository.updateStatus(id, status);
    },
  };
}

export type OrderService = ReturnType<typeof createOrderService>;
