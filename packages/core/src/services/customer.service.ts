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
  };
}

export type CustomerService = ReturnType<typeof createCustomerService>;
