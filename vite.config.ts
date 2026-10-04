import path from 'node:path';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
    server: {
        // Used once `USE_MOCK` is false: the browser calls `/api/...`; in development Vite forwards it to the backend.
        proxy: {
            '/api': {
                target: process.env.API_URL ?? 'http://127.0.0.1:8000',
                rewrite: (url) => url.replace(/^\/api/, ''),
            },
        },
    },
    plugins: [react(), tailwindcss()],
    resolve: { alias: { '@': path.resolve(__dirname, 'src') } },
});
