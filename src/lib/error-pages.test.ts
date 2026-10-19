// @vitest-environment node
/// <reference types="node" />
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { buildErrorPages } from '../../scripts/error-pages';
import { ERROR_PAGES } from '@/lib/error-pages';

const read = (path: string) => readFileSync(new URL(`../../${path}`, import.meta.url), 'utf8');
const pages = buildErrorPages({ brand: read('src/lib/brand.ts'), theme: read('src/index.css') });

describe('static error pages (error-pages/*.html)', () => {
    it('has a page for every status the app words', () => {
        expect(pages.map((page) => page.file)).toEqual(ERROR_PAGES.map((page) => `${page.status}.html`));
    });

    it.each(pages.map((page) => [page.file, page.html] as const))(
        '%s is up to date with the words, pictures, and tokens (run `npm run error-pages`)',
        (file, html) => {
            expect(read(`error-pages/${file}`)).toBe(html);
        },
    );

    it('calls the 503 page maintenance: the title says so and the code is only a small note', () => {
        const html = pages.find((page) => page.file === '503.html')?.html ?? '';

        expect(html).toContain('<title>Sedang dalam pemeliharaan - Starter Kit</title>');
        expect(html).toContain('<h1>Sedang dalam pemeliharaan</h1>');
        expect(html).toContain('<p class="badge">Kode 503</p>');
        expect(html).not.toMatch(/service unavailable/i);
    });

    it.each(pages.map((page) => [page.file, page.html] as const))(
        '%s needs no script and no asset (safe under a strict Content-Security-Policy)',
        (_file, html) => {
            expect(html).not.toMatch(/javascript:|<script|<img|<link/i);
            expect(html).toContain('<svg');
            expect(html).toContain('name="viewport"');
        },
    );

    it('escapes an app name typed on the command line', () => {
        const [first] = buildErrorPages({ brand: read('src/lib/brand.ts'), theme: read('src/index.css'), appName: 'A&B <Bank>' });

        expect(first?.html).toContain('A&amp;B &lt;Bank&gt;');
        expect(first?.html).not.toContain('<Bank>');
    });
});
