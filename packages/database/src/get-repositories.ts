import type {
  CustomerRepository,
  OrderRepository,
  ProductRepository,
} from '@luxe-maison/core';
import type { DatabaseAdapter } from './clients/types.js';
import {
  createImpCustomerRepository,
  createImpOrderRepository,
  createImpProductRepository,
} from './adapters/in_memory/repositories.js';
import {
  connectMongoose,
  createImpCustomerRepository as createMongooseCustomerRepository,
  createImpOrderRepository as createMongooseOrderRepository,
  createImpProductRepository as createMongooseProductRepository,
  disconnectMongoose,
} from './adapters/mongoose/repositories.js';

let currentAdapter: DatabaseAdapter = 'in_memory';

export async function initDatabase(
  adapter: DatabaseAdapter,
  options: { mongoUri?: string } = {},
): Promise<void> {
  if (adapter === 'mongoose') {
    const uri = options.mongoUri ?? process.env.MONGODB_URI;
    if (!uri) {
      throw new Error('MONGODB_URI is required when using the mongoose adapter');
    }
    await connectMongoose(uri);
  }

  if (adapter === 'prisma') {
    throw new Error('prisma adapter is not implemented yet');
  }

  currentAdapter = adapter;
}

export async function disconnectDatabase(): Promise<void> {
  if (currentAdapter === 'mongoose') {
    await disconnectMongoose();
  }
}

function resolveAdapter(adapter?: DatabaseAdapter): DatabaseAdapter {
  return adapter ?? currentAdapter;
}

export function getProductRepository(adapter?: DatabaseAdapter): ProductRepository {
  switch (resolveAdapter(adapter)) {
    case 'in_memory':
      return createImpProductRepository();
    case 'mongoose':
      return createMongooseProductRepository();
    default:
      throw new Error(`Unsupported adapter for product repository: ${resolveAdapter(adapter)}`);
  }
}

export function getOrderRepository(adapter?: DatabaseAdapter): OrderRepository {
  switch (resolveAdapter(adapter)) {
    case 'in_memory':
      return createImpOrderRepository();
    case 'mongoose':
      return createMongooseOrderRepository();
    default:
      throw new Error(`Unsupported adapter for order repository: ${resolveAdapter(adapter)}`);
  }
}

export function getCustomerRepository(adapter?: DatabaseAdapter): CustomerRepository {
  switch (resolveAdapter(adapter)) {
    case 'in_memory':
      return createImpCustomerRepository();
    case 'mongoose':
      return createMongooseCustomerRepository();
    default:
      throw new Error(`Unsupported adapter for customer repository: ${resolveAdapter(adapter)}`);
  }
}
