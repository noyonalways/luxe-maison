import './load-env.js';
import { serve } from '@hono/node-server';
import { disconnectDatabase, initDatabase } from '@luxe-maison/database';

const port = Number(process.env.PORT ?? 5000);

const adapter = await initDatabase();

const { default: app, staffRepository } = await import('./app.js');
const { seedStaffIfEmpty } = await import('./seed/staff.seed.js');

await seedStaffIfEmpty(staffRepository);

serve({ fetch: app.fetch, port }, (info) => {
  console.log(`REST API listening on http://localhost:${info.port} (${adapter})`);
});

async function shutdown() {
  await disconnectDatabase();
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
