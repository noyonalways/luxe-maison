/**
 * TypeScript incremental builds skip emit when tsconfig.tsbuildinfo exists
 * but dist/ was removed (fresh Docker clones, manual cleans). Clear the stale
 * cache so tsc always regenerates .js and .d.ts when outputs are missing.
 */
import { existsSync, rmSync } from "node:fs";
import { join } from "node:path";

const pkgRoot = process.cwd();
const distEntry = join(pkgRoot, "dist", "index.js");
const buildInfo = join(pkgRoot, "tsconfig.tsbuildinfo");

if (!existsSync(distEntry) && existsSync(buildInfo)) {
  rmSync(buildInfo);
}
