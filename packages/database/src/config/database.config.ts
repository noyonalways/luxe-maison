import type { DatabaseAdapter } from '../clients/types.js';
import { loadDatabaseEnv } from './load-env.js';

export interface DatabaseConfig {
  adapter: DatabaseAdapter;
  mongoUri?: string;
}

function parseAdapter(value: string | undefined): DatabaseAdapter {
  const adapter = value ?? 'in_memory';
  if (adapter === 'in_memory' || adapter === 'mongoose') return adapter;
  throw new Error(`Unsupported DATABASE_ADAPTER: ${adapter}`);
}

export function getDatabaseConfig(): DatabaseConfig {
  loadDatabaseEnv();

  return {
    adapter: parseAdapter(process.env.DATABASE_ADAPTER),
    mongoUri: process.env.MONGODB_URI,
  };
}
