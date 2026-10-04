// @vitest-environment node
/// <reference types="node" />
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const read = (path: string) => readFileSync(new URL(`../../${path}`, import.meta.url), 'utf8');

describe('style guide', () => {
    it('lists every colour token of src/index.css', () => {
        const tokens = [...read('src/index.css').matchAll(/--color-([a-z-]+):/g)].map((match) => match[1]);
        const guide = read('src/pages/styleguide.tsx');

        expect(tokens.length).toBeGreaterThan(20);

        for (const token of tokens) {
            expect(guide, `token "${token}" is missing from TOKENS in styleguide.tsx`).toContain(`['${token}', 'bg-${token}'`);
        }
    });
});
