// @vitest-environment node
/// <reference types="node" />
import { readdirSync, readFileSync } from 'node:fs';
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

    it('shows every exported UI component', () => {
        // Building blocks that are used inside other components (shown there) rather than on their own.
        const internal = new Set(['Pagination', 'Popover', 'PopoverTrigger', 'PopoverContent', 'SortHead', 'TooltipProvider']);
        const guide = read('src/pages/styleguide.tsx');
        const missing: string[] = [];

        for (const file of readdirSync(new URL('../components/ui', import.meta.url)).filter((name) => /\.tsx$/.test(name) && !name.includes('.test.'))) {
            for (const match of read(`src/components/ui/${file}`).matchAll(/export (?:function|const) ([A-Z]\w+)/g)) {
                const name = match[1] ?? '';

                if (!internal.has(name) && !new RegExp(`\\b${name}\\b`).test(guide)) {
                    missing.push(`${file}: ${name}`);
                }
            }
        }

        expect(missing, 'UI components without an example in styleguide.tsx').toEqual([]);
    });
});
