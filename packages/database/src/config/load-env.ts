import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { config } from 'dotenv';

let loaded = false;

export function loadDatabaseEnv(): void {
  if (loaded) return;
  loaded = true;

  const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
  const candidates = [
    path.join(packageRoot, '.env.development.local'),
    path.join(packageRoot, '.env.local'),
    path.join(packageRoot, '.env'),
  ];

  for (const file of candidates) {
    if (existsSync(file)) {
      config({ path: file, override: false });
    }
  }
}
