// Builds the static error pages in error-pages/ (see scripts/error-pages.ts).
//   npm run error-pages [-- "App Name"]
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { buildErrorPages } from './error-pages';

// Relative to the repository, not to the folder the command was started in.
const root = fileURLToPath(new URL('..', import.meta.url));

// Name, logo letter, and colours come from the app itself, so `npm run rebrand` keeps the error pages in step.
const pages = buildErrorPages({
    brand: readFileSync(`${root}src/lib/brand.ts`, 'utf8'),
    theme: readFileSync(`${root}src/index.css`, 'utf8'),
    appName: process.argv[2],
});

mkdirSync(`${root}error-pages`, { recursive: true });

for (const { file, html } of pages) {
    writeFileSync(`${root}error-pages/${file}`, html);
}

console.log(`${pages.length} error pages written to error-pages/`);
