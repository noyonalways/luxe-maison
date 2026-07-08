import { existsSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '../../..');

const requiredArtifacts = [
  'packages/core/dist/index.js',
  'packages/database/dist/index.js',
];

const missing = requiredArtifacts.filter((relativePath) => !existsSync(join(root, relativePath)));

if (missing.length === 0) {
  process.exit(0);
}

console.log('[restapi] Missing workspace build outputs:');
for (const path of missing) {
  console.log(`  - ${path}`);
}
console.log('[restapi] Building @luxe-maison/core and @luxe-maison/database...');

execSync('pnpm --filter @luxe-maison/core --filter @luxe-maison/database run build', {
  cwd: root,
  stdio: 'inherit',
});
