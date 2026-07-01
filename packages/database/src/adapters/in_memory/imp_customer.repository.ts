import type { Customer } from '@luxe-maison/core';
import type { CustomerRepository } from '@luxe-maison/core';
import { mockCustomers } from './seed.js';

export function createImpCustomerRepository(
  initial: Customer[] = structuredClone(mockCustomers),
): CustomerRepository {
  const customers = initial;

  return {
    async findAll() {
      return [...customers];
    },

    async findById(id: string) {
      return customers.find((c) => c.id === id) ?? null;
    },

    async findByEmail(email: string) {
      const normalized = email.toLowerCase();
      return customers.find((c) => c.email.toLowerCase() === normalized) ?? null;
    },
  };
}
