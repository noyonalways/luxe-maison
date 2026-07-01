import type { Order } from '../entities/order.entity.js';

export interface OrderRepository {
  findAll(): Promise<Order[]>;
  findById(id: string): Promise<Order | null>;
  findByCustomerEmail(email: string): Promise<Order[]>;
  updateStatus(id: string, status: Order['status']): Promise<Order | null>;
}
