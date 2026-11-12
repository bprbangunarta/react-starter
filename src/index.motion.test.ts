// @vitest-environment node
/// <reference types="node" />
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const css = readFileSync(new URL('./index.css', import.meta.url), 'utf8');
const root = new URL('.', import.meta.url).pathname;

function sources(dir: string): string[] {
    return readdirSync(dir).flatMap((name) => {
        const path = join(dir, name);

        if (statSync(path).isDirectory()) {
            return sources(path);
        }

        return /\.tsx$/.test(name) && !name.includes('.test.') ? [readFileSync(path, 'utf8')] : [];
    });
}

describe('motion', () => {
    it('defines every motion-* class the screens use', () => {
        const used = new Set(sources(root).flatMap((text) => [...text.matchAll(/\bmotion-[a-z-]+\b/g)].map((m) => m[0])));

        expect(used.size).toBeGreaterThan(5);

        for (const name of used) {
            expect(css, `.${name} is used but not defined in index.css`).toContain(`.${name}`);
        }
    });

    it('switches every motion class off for people who ask for reduced motion', () => {
        const defined = [...css.matchAll(/^\.(motion-[a-z-]+)/gm)].map((m) => m[1] ?? '');
        const reduced = css.slice(css.indexOf('@media (prefers-reduced-motion: reduce)'));

        expect(defined.length).toBeGreaterThan(5);

        for (const name of defined) {
            expect(reduced, `.${name} is not disabled under prefers-reduced-motion`).toContain(`.${name}`);
        }
    });
});
