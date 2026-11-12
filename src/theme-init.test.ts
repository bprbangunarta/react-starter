// @vitest-environment node
/// <reference types="node" />
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { THEME_KEY } from '@/lib/theme';

describe('theme init script', () => {
    const script = readFileSync(new URL('../public/theme-init.js', import.meta.url), 'utf8');
    const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

    it('reads the same storage key as lib/theme.ts', () => {
        expect(script).toContain(`getItem('${THEME_KEY}')`);
    });

    it('is loaded from index.html before the app, as a plain script a strict CSP allows', () => {
        expect(html).toContain('<script src="/theme-init.js"></script>');
        expect(html.indexOf('theme-init.js')).toBeLessThan(html.indexOf('/src/main.tsx'));
    });
});
