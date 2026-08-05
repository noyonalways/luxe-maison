import './load-env.js';
import { serve } from '@hono/node-server';
import { disconnectDatabase, initDatabase } from '@luxe-maison/database';

const port = Number(process.env.PORT ?? 5000);

const adapter = await initDatabase();

const { default: app, staffRepository } = await import('./app.js');
const { seedStaffIfEmpty } = await import('./seed/staff.seed.js');

await seedStaffIfEmpty(staffRepository);

serve({ fetch: app.fetch, port }, (info) => {
  const apiUrl =
    process.env.API_URL ||
    process.env.PUBLIC_API_URL ||
    process.env.SERVER_URL ||
    process.env.VITE_API_URL ||
    `http://localhost:${info.port}`;

  console.log(`REST API listening on ${apiUrl} (${adapter})`);
});

async function shutdown() {
  await disconnectDatabase();
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
