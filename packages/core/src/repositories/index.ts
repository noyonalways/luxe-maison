export type { ProductRepository } from './product.repository.js';
export type { OrderRepository } from './order.repository.js';
export type { CustomerRepository } from './customer.repository.js';

import type { ProductRepository } from './product.repository.js';
import type { OrderRepository } from './order.repository.js';
import type { CustomerRepository } from './customer.repository.js';

export interface Repositories {
  products: ProductRepository;
  orders: OrderRepository;
  customers: CustomerRepository;
}
