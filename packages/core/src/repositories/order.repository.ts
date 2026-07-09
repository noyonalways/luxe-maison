import type { Order } from '../entities/order.entity.js';

export interface OrderRepository {
  findAll(): Promise<Order[]>;
  findById(id: string): Promise<Order | null>;
  findByCustomerEmail(email: string): Promise<Order[]>;
  findByIdAndEmail(id: string, email: string): Promise<Order | null>;
  create(order: Order): Promise<Order>;
  updateStatus(id: string, status: Order['status']): Promise<Order | null>;
  update(id: string, updates: Partial<Pick<Order, 'status' | 'trackingNumber' | 'carrier' | 'notes' | 'paymentStatus'>>): Promise<Order | null>;
  appendNote(id: string, note: string): Promise<Order | null>;
}
