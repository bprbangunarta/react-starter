import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';
import { resetDb } from '@/mock/db';

// jsdom has no matchMedia; this one says "no match" (light, wide-screen rules off). Tests that need another answer replace it.
if (typeof window !== 'undefined' && typeof window.matchMedia !== 'function') {
    window.matchMedia = (query: string) =>
        ({ matches: false, media: query, addEventListener: () => undefined, removeEventListener: () => undefined }) as unknown as MediaQueryList;
}

// Tests that run in the node environment (file reads) have no DOM to clean.
afterEach(() => {
    if (typeof document !== 'undefined') {
        cleanup();
        resetDb();
        localStorage.clear();
    }
});
