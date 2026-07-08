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

    async findByEmailForAuth(email: string) {
      const normalized = email.toLowerCase();
      return customers.find((c) => c.email.toLowerCase() === normalized) ?? null;
    },

    async create(customer: Customer) {
      customers.push(customer);
      return customer;
    },

    async update(id: string, updates: Partial<Customer>) {
      const index = customers.findIndex((c) => c.id === id);
      if (index === -1) return null;
      customers[index] = { ...customers[index]!, ...updates };
      return customers[index]!;
    },

    async delete(id: string) {
      const index = customers.findIndex((c) => c.id === id);
      if (index === -1) return false;
      customers.splice(index, 1);
      return true;
    },
  };
}
