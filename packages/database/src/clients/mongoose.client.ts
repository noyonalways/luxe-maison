import type { DatabaseClient } from './types.js';
import { connectMongoose, disconnectMongoose } from '../adapters/mongoose/connection.js';
import { createImpProductRepository } from '../adapters/mongoose/imp_product.repository.js';
import { createImpOrderRepository } from '../adapters/mongoose/imp_order.repository.js';
import { createImpCustomerRepository } from '../adapters/mongoose/imp_customer.repository.js';

export async function createMongooseClient(uri: string): Promise<DatabaseClient> {
  await connectMongoose(uri);

  return {
    adapter: 'mongoose',
    repositories: {
      products: createImpProductRepository(),
      orders: createImpOrderRepository(),
      customers: createImpCustomerRepository(),
    },
    disconnect: disconnectMongoose,
  };
}
