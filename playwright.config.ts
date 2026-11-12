/// <reference types="node" />
import { defineConfig } from '@playwright/test';

// End-to-end tests run against the production build with the mock API, the same thing a reviewer clicks through.
//   npm run test:e2e
export default defineConfig({
    testDir: 'e2e',
    testMatch: '*.e2e.ts',
    fullyParallel: true,
    retries: process.env.CI ? 1 : 0,
    use: { baseURL: 'http://127.0.0.1:4173', trace: 'retain-on-failure' },
    webServer: {
        command: 'npx vite build && npx vite preview --host 127.0.0.1 --port 4173 --strictPort',
        url: 'http://127.0.0.1:4173',
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
    },
});
