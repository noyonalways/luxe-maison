import type { DatabaseClient } from './types.js';
import { createImpProductRepository } from '../adapters/in_memory/imp_product.repository.js';
import { createImpOrderRepository } from '../adapters/in_memory/imp_order.repository.js';
import { createImpCustomerRepository } from '../adapters/in_memory/imp_customer.repository.js';

export function createInMemoryClient(): DatabaseClient {
  return {
    adapter: 'in_memory',
    repositories: {
      products: createImpProductRepository(),
      orders: createImpOrderRepository(),
      customers: createImpCustomerRepository(),
    },
  };
}

/** @deprecated Use createInMemoryClient */
export const createInMemoryDatabase = createInMemoryClient;

/** @deprecated Use createInMemoryClient */
export const createMemoryDatabase = createInMemoryClient;
