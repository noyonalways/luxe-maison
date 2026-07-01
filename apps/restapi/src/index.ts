import { serve } from '@hono/node-server';
import { disconnectDatabase, initDatabase } from '@luxe-maison/database';

type DatabaseAdapter = 'in_memory' | 'mongoose';

function resolveAdapter(): DatabaseAdapter {
  const adapter = process.env.DATABASE_ADAPTER ?? 'in_memory';

  
  if (adapter === 'in_memory' || adapter === 'mongoose') return adapter;
  throw new Error(`Unsupported DATABASE_ADAPTER: ${adapter}`);
}

const adapter = resolveAdapter();
const port = Number(process.env.PORT ?? 5000);

await initDatabase(adapter, { mongoUri: process.env.MONGODB_URI });

const { default: app } = await import('./app.js');

serve({ fetch: app.fetch, port }, (info) => {
  console.log(`REST API listening on http://localhost:${info.port} (${adapter})`);
});

async function shutdown() {
  await disconnectDatabase();
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
