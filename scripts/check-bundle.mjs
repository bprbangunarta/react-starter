// Fails when the JavaScript a visitor downloads first grows past the budget. Runs after `vite build` (npm run build).
//   node scripts/check-bundle.mjs
import { readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';

// gzip kilobytes of the entry chunk. Raise it on purpose, with a reason, not to make a failing build pass.
const BUDGET_KB = 150;

const assets = fileURLToPath(new URL('../dist/assets/', import.meta.url));
let files;

try {
    files = readdirSync(assets).filter((name) => /^index-.*\.js$/.test(name));
} catch {
    console.error('dist/assets not found: run `npx vite build` first.');
    process.exit(1);
}

const sizes = files.map((name) => ({ name, kb: gzipSync(readFileSync(assets + name)).length / 1024 }));
const entry = sizes.sort((a, b) => b.kb - a.kb)[0];

if (!entry) {
    console.error('No entry chunk (index-*.js) in dist/assets.');
    process.exit(1);
}

console.log(`Entry chunk ${entry.name}: ${entry.kb.toFixed(1)} kB gzip (budget ${BUDGET_KB} kB)`);

if (entry.kb > BUDGET_KB) {
    console.error('Over budget. Load the heavy part on demand (lazy routes, dynamic import) before raising the budget.');
    process.exit(1);
}
