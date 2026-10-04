import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// Tests that run in the node environment (file reads) have no DOM to clean.
afterEach(() => {
    if (typeof document !== 'undefined') {
        cleanup();
        localStorage.clear();
    }
});
