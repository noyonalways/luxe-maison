import type { Customer } from '../entities/customer.entity.js';

export interface CustomerRepository {
  findAll(): Promise<Customer[]>;
  findById(id: string): Promise<Customer | null>;
  findByEmail(email: string): Promise<Customer | null>;
  create(customer: Customer): Promise<Customer>;
  update(id: string, updates: Partial<Customer>): Promise<Customer | null>;
  delete(id: string): Promise<boolean>;
}
