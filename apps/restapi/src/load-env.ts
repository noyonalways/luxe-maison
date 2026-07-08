import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { config } from 'dotenv';

const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const candidates = [
  path.join(appRoot, '.env.development.local'),
  path.join(appRoot, '.env.local'),
  path.join(appRoot, '.env'),
];

for (const file of candidates) {
  if (existsSync(file)) {
    config({ path: file, override: false });
  }
}
