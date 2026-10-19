// @vitest-environment node
/// <reference types="node" />
import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const read = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

/** Every address the sidebar links to, like `/audit-logs`. */
const menuAddresses = [...read('layouts/menu.ts').matchAll(/\bto: '(\/[a-z-]*)'/g)].map((match) => match[1] ?? '');

describe('menu name, address, and page file', () => {
    it('reads the list of menu links from menu.ts', () => {
        expect(menuAddresses.length).toBeGreaterThanOrEqual(3);
    });

    it('gives every menu page a file named like its address (/audit-logs is pages/audit-logs.tsx)', () => {
        const missing = menuAddresses.filter(
            (address) => !existsSync(new URL(`../pages/${address === '/' ? 'dashboard' : address.slice(1)}.tsx`, import.meta.url)),
        );

        expect(missing, 'menu addresses without a page file of the same name in pages/').toEqual([]);
    });

    it('registers every menu address as a route in App.tsx', () => {
        const app = read('App.tsx');
        const missing = menuAddresses.filter((address) => address !== '/' && !app.includes(`path="${address}"`));

        expect(missing, 'menu addresses without a route in App.tsx').toEqual([]);
    });
});
