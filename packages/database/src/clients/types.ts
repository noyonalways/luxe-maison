import type { Repositories } from '@luxe-maison/core';

export type DatabaseAdapter = 'in_memory' | 'mongoose' | 'prisma';

export interface DatabaseClient {
  adapter: DatabaseAdapter;
  repositories: Repositories;
  disconnect?: () => Promise<void>;
}

export interface CreateDatabaseOptions {
  mongoUri?: string;
}
