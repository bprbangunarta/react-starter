import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';
import { resetDb } from '@/mock/db';

// Tests that run in the node environment (file reads) have no DOM to clean.
afterEach(() => {
    if (typeof document !== 'undefined') {
        cleanup();
        resetDb();
        localStorage.clear();
    }
});
