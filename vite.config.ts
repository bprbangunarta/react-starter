import path from 'node:path';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';
import type { Plugin } from 'vite';

/**
 * Search-engine access. This is an internal admin app, so by default it is closed to crawlers: a `noindex` meta tag in the
 * page and a `Disallow: /` robots.txt. Build with ALLOW_INDEXING=true (env var or .env) to open it. The nginx header is switched
 * by the same variable in the Dockerfile (build-arg ALLOW_INDEXING).
 */
function indexing(allow: boolean): Plugin {
    const robots = allow ? 'User-agent: *\nAllow: /\n' : 'User-agent: *\nDisallow: /\n';

    return {
        name: 'indexing',
        transformIndexHtml: () => (allow ? [] : [{ tag: 'meta', attrs: { name: 'robots', content: 'noindex, nofollow' }, injectTo: 'head' }]),
        configureServer(server) {
            server.middlewares.use('/robots.txt', (_request, response) => {
                response.setHeader('Content-Type', 'text/plain');
                response.end(robots);
            });
        },
        generateBundle() {
            this.emitFile({ type: 'asset', fileName: 'robots.txt', source: robots });
        },
    };
}

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '');
    const allowIndexing = (process.env.ALLOW_INDEXING ?? env.ALLOW_INDEXING) === 'true';

    return {
        server: {
            // Used once `USE_MOCK` is false: the browser calls `/api/...`; in development Vite forwards it to the backend.
            proxy: {
                '/api': {
                    target: process.env.API_URL ?? 'http://127.0.0.1:8000',
                    rewrite: (url) => url.replace(/^\/api/, ''),
                },
            },
        },
        plugins: [react(), tailwindcss(), indexing(allowIndexing)],
        resolve: { alias: { '@': path.resolve(__dirname, 'src') } },
    };
});
