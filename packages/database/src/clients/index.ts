export type { DatabaseClient, DatabaseAdapter, CreateDatabaseOptions } from './types.js';
export {
  createInMemoryClient,
  createInMemoryDatabase,
  createMemoryDatabase,
} from './in_memory.client.js';
export { createMongooseClient } from './mongoose.client.js';

import type { DatabaseClient, CreateDatabaseOptions } from './types.js';
import { createInMemoryClient } from './in_memory.client.js';
import { createMongooseClient } from './mongoose.client.js';
import { getDatabaseConfig } from '../config/database.config.js';

export async function createDatabase(
  adapter: 'in_memory' | 'mongoose',
  options: CreateDatabaseOptions = {},
): Promise<DatabaseClient> {
  if (adapter === 'in_memory') {
    return createInMemoryClient();
  }

  const uri = options.mongoUri ?? getDatabaseConfig().mongoUri;
  if (!uri) {
    throw new Error('MONGODB_URI is required for the mongoose adapter');
  }

  return createMongooseClient(uri);
}
