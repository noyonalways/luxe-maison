import type { Customer } from '../entities/customer.entity.js';
import type { CustomerRepository } from '../repositories/customer.repository.js';

export function createCustomerService(repository: CustomerRepository) {
  return {
    list(): Promise<Customer[]> {
      return repository.findAll();
    },

    getById(id: string): Promise<Customer | null> {
      return repository.findById(id);
    },

    getByEmail(email: string): Promise<Customer | null> {
      return repository.findByEmail(email);
    },

    create(customer: Customer): Promise<Customer> {
      return repository.create(customer);
    },

    update(id: string, updates: Partial<Customer>): Promise<Customer | null> {
      return repository.update(id, updates);
    },

    delete(id: string): Promise<boolean> {
      return repository.delete(id);
    },
  };
}

export type CustomerService = ReturnType<typeof createCustomerService>;
